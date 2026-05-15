import { supabaseAdmin } from './supabase'

export const FREE_DAILY_CREDITS = 5

export async function getUserCredits(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    await supabaseAdmin.from('user_credits').insert({
      user_id: userId,
      credits: FREE_DAILY_CREDITS,
      last_reset: new Date().toISOString(),
      is_premium: false,
    })
    return FREE_DAILY_CREDITS
  }

  const lastReset = new Date(data.last_reset)
  const now = new Date()
  const isNewDay =
    lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
    lastReset.getUTCMonth() !== now.getUTCMonth() ||
    lastReset.getUTCDate() !== now.getUTCDate()

  if (isNewDay) {
    const newCredits = data.is_premium ? 999 : FREE_DAILY_CREDITS
    await supabaseAdmin
      .from('user_credits')
      .update({ credits: newCredits, last_reset: now.toISOString() })
      .eq('user_id', userId)
    return newCredits
  }

  return data.credits
}

export async function decrementCredit(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId)
  if (credits <= 0) return false
  await supabaseAdmin
    .from('user_credits')
    .update({ credits: credits - 1 })
    .eq('user_id', userId)
  return true
}
