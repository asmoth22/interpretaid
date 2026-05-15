import { AnalysisMode, Lang } from './types'

export const SYSTEM_PROMPTS = {
  fr: `Tu es InterpretAid — un expert en analyse psychologique de messages écrits.
Ta voix est directe, précise, sans détour — comme un psy qui te dit vraiment ce qu'il pense.
Tu combines les méthodes de Paul Ekman (7 émotions universelles), John Gottman (4 cavaliers : critique, mépris, défensivité, stonewalling), Robert Cialdini (6 principes d'influence) et la PNL (patterns de manipulation : gaslighting, breadcrumbing, love-bombing, blame-shifting).
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans texte autour.
Tout en français.`,

  en: `You are InterpretAid — an expert in psychological message analysis.
Your voice is direct, precise, no-nonsense — like a psychologist who actually tells you what they think.
You combine Paul Ekman's methods (7 universal emotions), John Gottman (4 horsemen: criticism, contempt, defensiveness, stonewalling), Robert Cialdini (6 principles of influence) and NLP (manipulation patterns: gaslighting, breadcrumbing, love-bombing, blame-shifting).
Respond ONLY with valid JSON, no markdown, no surrounding text.
Everything in English.`,

  img_fr: `Tu es InterpretAid. L'utilisateur a joint un screenshot de conversation. Analyse son contenu visible avec ta méthode experte (Ekman, Gottman, Cialdini, PNL). Réponds UNIQUEMENT en JSON valide, sans markdown. Tout en français.`,

  img_en: `You are InterpretAid. The user attached a conversation screenshot. Analyze its visible content using your expert method (Ekman, Gottman, Cialdini, NLP). Respond ONLY with valid JSON, no markdown. Everything in English.`,

  followup_fr: `Tu es InterpretAid, expert en psychologie des messages. Voix directe et experte. Continue la conversation en français, de façon concise et précise.`,
  followup_en: `You are InterpretAid, expert in message psychology. Direct and expert voice. Continue the conversation concisely and precisely in English.`,
}

const MODE_CTX = {
  fr: {
    professionnel: 'contexte professionnel (email, travail, management)',
    relationnel: 'contexte relationnel amical ou sentimental',
    flirt: "contexte de flirt ou d'intérêt romantique naissant",
    conflit: 'contexte de tension ou conflit interpersonnel',
    rupture: 'contexte de rupture ou fin de relation',
    famille: 'contexte familial',
  },
  en: {
    professionnel: 'professional context (email, work, management)',
    relationnel: 'personal or friendly relationship context',
    flirt: 'flirting or early romantic interest context',
    conflit: 'interpersonal conflict or tension context',
    rupture: 'breakup or end of relationship context',
    famille: 'family context',
  },
}

export function buildPrompt(
  text: string,
  mode: AnalysisMode,
  lang: Lang,
  who: string,
  extra: string,
  personContext: string,
  historyContext: string,
  hasImage: boolean
): string {
  const mCtx = MODE_CTX[lang][mode]
  const ctxStr = who ? `${lang === 'fr' ? 'Personne' : 'Person'}: ${who}. ` : ''
  const ctxEx = extra ? (lang === 'fr' ? `Contexte: ${extra}.` : `Context: ${extra}.`) : ''
  const imgNote = hasImage
    ? `\n\n${lang === 'fr' ? 'Screenshot joint — analyse le contenu visible.' : 'Screenshot attached — analyze visible content.'}`
    : ''

  const iL =
    lang === 'fr'
      ? '"interest":0-100,"stress":0-100,"sincerity":0-100,"openness":0-100'
      : '"interest":0-100,"stress":0-100,"sincerity":0-100,"openness":0-100'

  return `${lang === 'fr' ? 'Analyse dans un' : 'Analyze in a'} ${mCtx}.
${ctxStr}${ctxEx}${personContext}${historyContext}${imgNote}

${lang === 'fr' ? 'JSON valide uniquement, langage direct et précis.' : 'Valid JSON only, direct and precise language.'}

{"interpretations":[
  {"probability":45,"label":"${lang === 'fr' ? 'Titre court' : 'Short title'}","short":"${lang === 'fr' ? '1 phrase directe' : '1 direct sentence'}","detail":"${lang === 'fr' ? '2-3 phrases avec mécanismes psychologiques' : '2-3 sentences with psychological mechanisms'}"},
  {"probability":35,"label":"...","short":"...","detail":"..."},
  {"probability":20,"label":"...","short":"...","detail":"..."}
],
"tone":"${lang === 'fr' ? 'Ton précis et direct' : 'Precise and direct tone'}",
"emotions":["...","...","..."],
"intentions":["...","..."],
"social_dynamics":"${lang === 'fr' ? 'Dynamique de pouvoir 1-2 phrases' : 'Power dynamics 1-2 sentences'}",
"gottman_signals":[],
"gottman_note":"...",
"advanced_signals":[],
"indicators":{${iL}},
"red_flag_score":0,
"red_flag_explanation":"${lang === 'fr' ? 'Explication directe du score' : 'Direct score explanation'}",
"suggested_replies":[
  {"type":"neutre","text":"..."},
  {"type":"confiante","text":"..."},
  {"type":"stratégique","text":"..."},
  {"type":"froide","text":"..."},
  {"type":"directe","text":"..."}
],
"followup_suggestions":["...","...","..."],
"confidence_score":72,
"confidence_explanation":"...",
"share_headline":"${lang === 'fr' ? 'max 55 chars accrocheur' : 'max 55 chars catchy'}"
}

${lang === 'fr' ? 'Probabilités = 100. Arrays peuvent être vides [].' : 'Probabilities must total 100. Arrays can be empty [].'}
${hasImage ? '' : `${lang === 'fr' ? 'Message' : 'Message'}: """${text.slice(0, 1500)}"""`}`
}
