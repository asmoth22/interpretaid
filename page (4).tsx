import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPTS } from '@/lib/prompt'
import { Lang } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { question, history, lang } = await req.json() as {
      question: string; history: {role:string;content:string}[]; lang: Lang
    }

    const sysKey = lang === 'fr' ? 'followup_fr' : 'followup_en'
    const ctx = history.map(h => `[${h.role}] ${h.content}`).join('\n')
    const prompt = `${lang === 'fr' ? 'Contexte' : 'Context'}:\n${ctx}\n\n${lang === 'fr' ? 'Question' : 'Question'}: ${question}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPTS[sysKey as keyof typeof SYSTEM_PROMPTS],
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
