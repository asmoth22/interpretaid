import { NextRequest, NextResponse } from 'next/server'
import { getUserCredits } from '@/lib/credits'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })
  const credits = await getUserCredits(userId)
  return NextResponse.json({ credits })
}
