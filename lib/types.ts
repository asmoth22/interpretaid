export type AnalysisMode = 'professionnel' | 'relationnel' | 'flirt' | 'conflit' | 'rupture' | 'famille'
export type Lang = 'fr' | 'en'

export interface Interpretation {
  probability: number
  label: string
  short: string
  detail: string
}

export interface SuggestedReply {
  type: 'neutre' | 'confiante' | 'stratégique' | 'froide' | 'directe'
  text: string
}

export interface Indicators {
  interest: number
  stress: number
  sincerity: number
  openness: number
}

export interface AnalysisResult {
  interpretations: Interpretation[]
  tone: string
  emotions: string[]
  intentions: string[]
  social_dynamics: string
  gottman_signals: string[]
  gottman_note: string
  advanced_signals: string[]
  indicators: Indicators
  red_flag_score: number
  red_flag_explanation: string
  suggested_replies: SuggestedReply[]
  followup_suggestions: string[]
  confidence_score: number
  confidence_explanation: string
  share_headline: string
}

export interface PersonAnalysis {
  rf: number
  date: number
  mode: AnalysisMode
}

export interface Person {
  id: string
  name: string
  color: string
  analyses: PersonAnalysis[]
}

export interface HistoryItem {
  id: string
  text: string
  mode: AnalysisMode
  rf: number
  sc: number
  lang: Lang
  person: string | null
  date: string
}
