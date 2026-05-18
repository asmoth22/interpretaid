import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'
import { decrementCredit, getUserCredits } from '@/lib/credits'
import { buildPrompt, SYSTEM_PROMPTS } from '@/lib/prompt'
import { AnalysisMode, AnalysisResult, Lang } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      text, mode, lang, who, extra, userId,
      personContext, historyContext, imageBase64, imageMime, personName
    } = body as {
      text: string; mode: AnalysisMode; lang: Lang; who: string; extra: string
      userId: string; personContext: string; historyContext: string
      imageBase64?: string; imageMime?: string; personName?: string
    }

    if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    if (!text && !imageBase64) return NextResponse.json({ error: 'Message requis' }, { status: 400 })

    const credits = await getUserCredits(userId)
    if (credits <= 0) {
      return NextResponse.json(
        { error: lang === 'fr' ? 'Plus de crédits. Revenez demain ou passez Premium.' : 'No credits left. Come back tomorrow or go Premium.' },
        { status: 429 }
      )
    }

    const hasImage = !!imageBase64
    const prompt = buildPrompt(text || '', mode, lang, who, extra, personContext, historyContext, hasImage)
    const systemKey = hasImage ? (lang === 'fr' ? 'img_fr' : 'img_en') : lang
    const systemPrompt = SYSTEM_PROMPTS[systemKey as keyof typeof SYSTEM_PROMPTS]

    const messages: Anthropic.MessageParam[] = hasImage
      ? [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: (imageMime || 'image/jpeg') as 'image/jpeg', data: imageBase64! } },
            { type: 'text', text: prompt }
          ]
        }]
      : [{ role: 'user', content: prompt }]

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    })

    const rawText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    let result: AnalysisResult
    try {
      result = JSON.parse(rawText.replace(/```json|```/g, '').trim())
    } catch {
      return NextResponse.json({ error: 'Erreur parsing IA' }, { status: 500 })
    }

    await decrementCredit(userId)
    const remainingCredits = credits - 1

    // Sauvegarde optionnelle si Supabase configuré
    if (supabaseAdmin) {
      await supabaseAdmin.from('analyses').insert({
        user_id: userId,
        mode,
        lang,
        input_text: (text || '[Screenshot]').slice(0, 500),
        result,
        red_flag_score: Math.round(result.red_flag_score || 0),
        confidence_score: Math.round(result.confidence_score || 0),
        person_name: personName || null,
      }).then(() => {})
    }

    return NextResponse.json({ result, credits: remainingCredits })
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
