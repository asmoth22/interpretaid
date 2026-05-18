'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnalysisMode, AnalysisResult, Person, HistoryItem, Lang } from '@/lib/types'

function getUserId(): string {
  if (typeof window === 'undefined') return 'anon'
  let id = localStorage.getItem('ia_uid')
  if (!id) { id = 'anon_' + Math.random().toString(36).slice(2, 11); localStorage.setItem('ia_uid', id) }
  return id
}

const COLORS = ['#d4a847','#3ab8a0','#9b7ee8','#e05a5a','#5ab87a','#f0c96a']

type TREntry = {
  modes: Record<string, string>
  who: string[]
  whoV: string[]
  nb:string; tabH:string; tabP:string; ph:string; ctxPh:string; upL:string; hint:string; whoL:string
  rel:string; interps:string; tone:string; emo:string; int:string; inds:string; adv:string
  reps:string; cpH:string; cont:string; gottT:string; rfLbl:string; shr:string
  interest:string; stress:string; sincerity:string; openness:string
  rT: Record<string, string>
  rfL:{label:string;c:string;bg:string}; rfM:{label:string;c:string;bg:string}; rfH:{label:string;c:string;bg:string}
  hempty:string; pplEmpty:string; padd:string; noTrend:string; fiab:string
  pTrend:(n:number,avg:number)=>string
  err:string; emptyT:string; emptySub:string
  exs:{t:string;m:string;l:string}[]
  smT:string; creditsLeft:(n:number)=>string; noCredits:string
  sys:string; fsys:string
}
const TR: Record<Lang, TREntry> = {
  fr: {
    modes: { professionnel:'Professionnel', relationnel:'Relationnel', flirt:'Flirt', conflit:'Conflit', rupture:'Rupture', famille:'Famille' },
    who: ['Collègue','Partenaire','Ami(e)','Inconnu(e)','Famille','Supérieur'],
    whoV: ['collègue','partenaire','ami(e)','inconnu(e)','famille','supérieur'],
    nb:'Nouvelle analyse', tabH:'Analyses', tabP:'Personnes', ph:'Colle ton message ici…',
    ctxPh:'Contexte…', upL:'Screenshot', hint:'Entrée pour envoyer', whoL:'Qui :',
    rel:'Fiabilité', interps:'Interprétations', tone:'Ton', emo:'Émotions', int:'Intentions',
    inds:'Indicateurs', adv:'Signaux avancés', reps:'Suggestions', cpH:'clic = copier',
    cont:'Continuer →', gottT:'Gottman', rfLbl:'Red Flag Score', shr:'Partager',
    interest:'Intérêt', stress:'Stress', sincerity:'Sincérité', openness:'Ouverture',
    rT:{ neutre:'neutre', confiante:'confiante', stratégique:'stratégique', froide:'froide', directe:'directe' },
    rfL:{ label:'Message sain', c:'#5ab87a', bg:'rgba(90,184,122,0.12)' },
    rfM:{ label:'Signaux ambigus', c:'#d4a847', bg:'rgba(212,168,71,0.13)' },
    rfH:{ label:'Red flags détectés', c:'#e05a5a', bg:'rgba(224,90,90,0.12)' },
    hempty:'Aucune analyse.', pplEmpty:'Ajoute une personne pour suivre l\'évolution.',
    padd:'Suivre une personne', noTrend:'Première analyse', fiab:'fiab.',
    pTrend:(n:number,avg:number)=>`${n} analyse${n>1?'s':''} · moy. ${avg}/100`,
    err:'Erreur de connexion. Réessaie.', emptyT:'Qu\'est-ce que ce message veut vraiment dire ?',
    emptySub:'Colle un texte ou glisse un screenshot.',
    exs:[
      {t:"Ok, c'est cool. Fais comme tu veux.",m:'conflit',l:"« Ok c'est cool. »"},
      {t:"Je suis juste occupé en ce moment.",m:'relationnel',l:"« Je suis occupé… »"},
      {t:"Bien reçu, merci. On en reparlera.",m:'professionnel',l:"« Bien reçu. »"},
      {t:"Haha ouais c'était sympa. T'as un truc.",m:'flirt',l:"« T'as un truc. »"}
    ],
    smT:'Red Flag Score partageable', creditsLeft:(n:number)=>`${n} crédit${n!==1?'s':''}`,
    noCredits:'Plus de crédits. Revenez demain ou passez Premium.',
    sys:`Tu es InterpretAid — expert en analyse psychologique de messages (Ekman, Gottman, Cialdini, PNL). Voix directe et précise. Réponds UNIQUEMENT en JSON valide, sans markdown. Tout en français.`,
    fsys:`Tu es InterpretAid, expert en psychologie des messages. Voix directe. Réponds en français, de façon concise.`,
  },
  en: {
    modes:{ professionnel:'Professional', relationnel:'Personal', flirt:'Flirt', conflit:'Conflict', rupture:'Breakup', famille:'Family' },
    who:['Colleague','Partner','Friend','Stranger','Family','Manager'],
    whoV:['colleague','partner','friend','stranger','family','manager'],
    nb:'New analysis', tabH:'Analyses', tabP:'People', ph:'Paste your message here…',
    ctxPh:'Context…', upL:'Screenshot', hint:'Enter to send', whoL:'Who:',
    rel:'Reliability', interps:'Interpretations', tone:'Tone', emo:'Emotions', int:'Intentions',
    inds:'Indicators', adv:'Advanced signals', reps:'Suggested replies', cpH:'click to copy',
    cont:'Continue →', gottT:'Gottman', rfLbl:'Red Flag Score', shr:'Share',
    interest:'Interest', stress:'Stress', sincerity:'Sincerity', openness:'Openness',
    rT:{ neutre:'neutral', confiante:'confident', stratégique:'strategic', froide:'cold', directe:'direct' },
    rfL:{ label:'Healthy message', c:'#5ab87a', bg:'rgba(90,184,122,0.12)' },
    rfM:{ label:'Ambiguous signals', c:'#d4a847', bg:'rgba(212,168,71,0.13)' },
    rfH:{ label:'Red flags detected', c:'#e05a5a', bg:'rgba(224,90,90,0.12)' },
    hempty:'No analyses yet.', pplEmpty:'Add a person to track their messages over time.',
    padd:'Track a person', noTrend:'First analysis', fiab:'rel.',
    pTrend:(n:number,avg:number)=>`${n} ${n>1?'analyses':'analysis'} · avg ${avg}/100`,
    err:'Connection error. Please retry.', emptyT:'What does this message really mean?',
    emptySub:'Paste text or upload a screenshot.',
    exs:[
      {t:"Ok, cool. Do whatever you want.",m:'conflit',l:'"Ok, cool."'},
      {t:"I've just been really busy lately.",m:'relationnel',l:'"I\'ve been busy…"'},
      {t:"Noted, thanks. We'll circle back.",m:'professionnel',l:'"We\'ll circle back."'},
      {t:"Haha yeah last night was fun. You've got something.",m:'flirt',l:'"You\'ve got something."'}
    ],
    smT:'Shareable Red Flag Score', creditsLeft:(n:number)=>`${n} credit${n!==1?'s':''}`,
    noCredits:'No credits left. Come back tomorrow or go Premium.',
    sys:`You are InterpretAid — expert in psychological message analysis (Ekman, Gottman, Cialdini, NLP). Direct and precise voice. Respond ONLY with valid JSON, no markdown. Everything in English.`,
    fsys:`You are InterpretAid, expert in message psychology. Direct voice. Respond concisely in English.`,
  }
}

type TRKey = typeof TR
function useT(lang: Lang): TREntry { return TR[lang] }

export default function InterpretAidApp() {
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Lang>('fr')
  const [mode, setMode] = useState<AnalysisMode>((searchParams.get('mode') as AnalysisMode) || 'professionnel')
  const [who, setWho] = useState('')
  const [tab, setTab] = useState<'h'|'p'>('h')
  const [text, setText] = useState(searchParams.get('text') || '')
  const [extra, setExtra] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(5)
  const [imgB64, setImgB64] = useState<string|null>(null)
  const [imgMime, setImgMime] = useState<string>('image/jpeg')
  const [imgName, setImgName] = useState('')
  const [history, setHistory] = useState<{role:string;content:string}[]>([])
  const [analyses, setAnalyses] = useState<HistoryItem[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [activePerson, setActivePerson] = useState<Person|null>(null)
  const [messages, setMessages] = useState<React.ReactNode[]>([])
  const [showEmpty, setShowEmpty] = useState(true)
  const [apfOpen, setApfOpen] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const [shareModal, setShareModal] = useState<{result:AnalysisResult;rf:number}|null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const t = useT(lang)

  useEffect(() => {
    try { setAnalyses(JSON.parse(localStorage.getItem('ia_a')||'[]')) } catch {}
    try { setPeople(JSON.parse(localStorage.getItem('ia_p')||'[]')) } catch {}
    const uid = getUserId()
    fetch(`/api/credits?userId=${uid}`).then(r=>r.json()).then(d=>setCredits(d.credits??5)).catch(()=>{})
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  function savePeople(p: Person[]) {
    setPeople(p)
    try { localStorage.setItem('ia_p', JSON.stringify(p)) } catch {}
  }
  function saveAnalyses(a: HistoryItem[]) {
    setAnalyses(a)
    try { localStorage.setItem('ia_a', JSON.stringify(a)) } catch {}
  }

  function rfLevel(rf: number) {
    if (rf <= 35) return t.rfL
    if (rf <= 65) return t.rfM
    return t.rfH
  }

  function addPerson() {
    if (!newPersonName.trim()) return
    const p: Person = { id: 'p'+Date.now(), name: newPersonName.trim(), color: COLORS[people.length%COLORS.length], analyses: [] }
    const newPeople = [p, ...people]
    savePeople(newPeople)
    setNewPersonName('')
    setApfOpen(false)
    setActivePerson(p)
    setTab('h')
    resetChat()
  }

  function resetChat() {
    setMessages([])
    setShowEmpty(true)
    setHistory([])
  }

  function useExample(txt: string, m: string) {
    setText(txt)
    setMode(m as AnalysisMode)
  }

  async function analyze() {
    if ((!text.trim() || text.trim().length < 3) && !imgB64) return
    if (credits <= 0) { alert(t.noCredits); return }
    setLoading(true)
    setShowEmpty(false)

    const userMsg = (
      <div key={'u'+Date.now()} style={{ display:'flex', justifyContent:'flex-end', animation:'fadeUp .25s ease' }}>
        <div style={{ maxWidth:'68%', background:'var(--s3)', border:'0.5px solid var(--b2)', borderRadius:'11px 11px 3px 11px', padding:'9px 13px', fontSize:12.5, lineHeight:1.6 }}>
          <div style={{ fontSize:8.5, fontWeight:500, letterSpacing:'1px', textTransform:'uppercase', color:'var(--gold)', marginBottom:3 }}>
            {activePerson && <span style={{ marginRight:6, fontSize:8 }}>• {activePerson.name}</span>}
            {t.modes[mode]}
          </div>
          {text || '[Screenshot]'}
          {imgB64 && <div style={{ marginTop:4, fontSize:9.5, color:'var(--gold)', opacity:.8 }}>📷 Screenshot</div>}
        </div>
      </div>
    )

    const typingMsg = (
      <div key={'typ'+Date.now()} style={{ display:'flex', gap:8, alignItems:'center', padding:'7px 0', animation:'fadeUp .25s ease' }}>
        <Avt/>
        <div style={{ display:'flex', gap:3 }}>
          {[0,200,400].map(d=><div key={d} style={{ width:4, height:4, borderRadius:'50%', background:'var(--t3)', animation:`td 1.2s ease ${d}ms infinite` }}/>)}
        </div>
      </div>
    )

    setMessages(prev => [...prev, userMsg, typingMsg])

    const personContext = activePerson && activePerson.analyses.length > 0
      ? `\n\n${lang==='fr'?`Suivi — ${activePerson.name} (${activePerson.analyses.length} analyses, RF moy: ${Math.round(activePerson.analyses.reduce((s,a)=>s+a.rf,0)/activePerson.analyses.length)}/100).`:`Tracking — ${activePerson.name} (${activePerson.analyses.length} analyses, avg RF: ${Math.round(activePerson.analyses.reduce((s,a)=>s+a.rf,0)/activePerson.analyses.length)}/100).`}`
      : ''
    const histCtx = history.length > 0 ? `\n\n${lang==='fr'?'Échange précédent':'Previous exchange'}:\n${history.map(h=>`[${h.role}] ${h.content}`).join('\n')}` : ''

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text, mode, lang, who, extra,
          userId: getUserId(),
          personContext, historyContext: histCtx,
          imageBase64: imgB64, imageMime: imgMime,
          personName: activePerson?.name || null,
        })
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data.error) }

      const result: AnalysisResult = data.result
      setCredits(data.credits)
      setHistory(prev => [...prev, { role:'user', content:text||'Screenshot' }, { role:'assistant', content:result.interpretations?.[0]?.detail||'' }])

      if (activePerson) {
        const updated = people.map(p => p.id === activePerson.id
          ? { ...p, analyses: [...p.analyses, { rf: Math.round(result.red_flag_score||0), date: Date.now(), mode }] }
          : p
        )
        savePeople(updated)
        setActivePerson(updated.find(p=>p.id===activePerson.id)||null)
      }

      const newItem: HistoryItem = {
        id: 'h'+Date.now(), text: (text||'[Screenshot]').slice(0,65), mode, lang,
        rf: Math.round(result.red_flag_score||0), sc: Math.round(result.confidence_score||0),
        person: activePerson?.name||null, date: new Date().toISOString()
      }
      saveAnalyses([newItem, ...analyses].slice(0,30))

      const resultMsg = <ResultCard key={'r'+Date.now()} result={result} t={t} lang={lang} activePerson={activePerson} people={people} onShare={()=>setShareModal({result,rf:Math.round(result.red_flag_score||0)})} onFollowup={askFollowup} rfLevel={rfLevel} />
      setMessages(prev => [...prev.filter((_,i)=>i!==prev.length-1), resultMsg])
    } catch (e: unknown) {
      const errMsg = (
        <div key={'err'+Date.now()} style={{ display:'flex', gap:8, alignItems:'flex-start', animation:'fadeUp .25s ease' }}>
          <Avt/>
          <div style={{ background:'var(--s2)', border:'0.5px solid var(--b2)', borderRadius:11, padding:'11px 13px', fontSize:12, color:'var(--rose)', lineHeight:1.7 }}>
            {e instanceof Error ? e.message : t.err}
          </div>
        </div>
      )
      setMessages(prev => [...prev.filter((_,i)=>i!==prev.length-1), errMsg])
    } finally {
      setLoading(false)
      setText('')
      setImgB64(null); setImgName('')
      if (taRef.current) taRef.current.style.height = 'auto'
    }
  }

  async function askFollowup(question: string) {
    const qMsg = (
      <div key={'q'+Date.now()} style={{ display:'flex', justifyContent:'flex-end' }}>
        <div style={{ maxWidth:'68%', background:'var(--s3)', border:'0.5px solid var(--b2)', borderRadius:'11px 11px 3px 11px', padding:'9px 13px', fontSize:12.5, lineHeight:1.6 }}>
          {question}
        </div>
      </div>
    )
    const typMsg = (
      <div key={'qt'+Date.now()} style={{ display:'flex', gap:8, alignItems:'center', padding:'7px 0' }}>
        <Avt/><div style={{ display:'flex', gap:3 }}>{[0,200,400].map(d=><div key={d} style={{ width:4, height:4, borderRadius:'50%', background:'var(--t3)', animation:`td 1.2s ease ${d}ms infinite` }}/>)}</div>
      </div>
    )
    setMessages(prev => [...prev, qMsg, typMsg])
    try {
      const res = await fetch('/api/followup', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question, history, lang })
      })
      const data = await res.json()
      const fMsg = (
        <div key={'f'+Date.now()} style={{ display:'flex', gap:8, alignItems:'flex-start', animation:'fadeUp .25s ease' }}>
          <Avt/>
          <div style={{ background:'var(--s2)', border:'0.5px solid var(--b2)', borderRadius:11, padding:'11px 13px', fontSize:12, color:'var(--t2)', lineHeight:1.7 }}>
            {data.text}
          </div>
        </div>
      )
      setMessages(prev => [...prev.filter((_,i)=>i!==prev.length-1), fMsg])
      setHistory(prev => [...prev, {role:'user',content:question}, {role:'assistant',content:data.text}])
    } catch { setMessages(prev => prev.filter((_,i)=>i!==prev.length-1)) }
  }

  function onImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setImgMime(f.type)
    setImgName(f.name)
    const r = new FileReader()
    r.onload = ev => { setImgB64((ev.target?.result as string).split(',')[1]) }
    r.readAsDataURL(f)
  }

  function onTextInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
  }

  const canSend = (text.trim().length >= 3 || !!imgB64) && !loading

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg)', color:'var(--tx)', fontFamily:'Inter, sans-serif', WebkitFontSmoothing:'antialiased', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes td { 0%,60%,100%{opacity:.3} 30%{opacity:1} }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width:210, flexShrink:0, background:'var(--s1)', borderRight:'0.5px solid var(--b1)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'15px 13px 11px', borderBottom:'0.5px solid var(--b1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="9" fill="#1e1c1a"/><path d="M7 11 Q16 7 25 11 L25 21 Q16 25 7 21 Z" fill="none" stroke="#d4a847" strokeWidth="1.1"/><circle cx="12" cy="16" r="1.6" fill="#d4a847" opacity=".9"/><circle cx="16" cy="15.3" r="1.2" fill="#d4a847" opacity=".5"/><circle cx="20" cy="16" r="1.6" fill="#d4a847" opacity=".9"/></svg>
            <span style={{ fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:14 }}>Interpret<span style={{ color:'var(--gold)' }}>Aid</span></span>
          </div>
          <div style={{ display:'flex', background:'var(--s2)', borderRadius:6, padding:2, border:'0.5px solid var(--b1)' }}>
            {(['fr','en'] as Lang[]).map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{ flex:1, fontSize:10, fontWeight:500, fontFamily:'Inter, sans-serif', padding:'4px 0', borderRadius:4, border: lang===l ? '0.5px solid var(--b2)' : 'none', background: lang===l ? 'var(--s3)' : 'transparent', color: lang===l ? 'var(--tx)' : 'var(--t3)', cursor:'pointer' }}>
                {l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', borderBottom:'0.5px solid var(--b1)', flexShrink:0 }}>
          {(['h','p'] as const).map(tb=>(
            <button key={tb} onClick={()=>setTab(tb)} style={{ flex:1, fontSize:10, fontWeight:500, fontFamily:'Inter, sans-serif', padding:'8px 0', border:'none', borderBottom: tab===tb ? '1.5px solid var(--gold)' : '1.5px solid transparent', background:'transparent', color: tab===tb ? 'var(--gold)' : 'var(--t3)', cursor:'pointer' }}>
              {tb === 'h' ? t.tabH : t.tabP}
            </button>
          ))}
        </div>

        {/* HISTORY TAB */}
        {tab === 'h' && (
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'10px 10px 0' }}>
              <button onClick={()=>{resetChat();setActivePerson(null)}} style={{ display:'flex', alignItems:'center', gap:6, width:'100%', padding:'7px 10px', borderRadius:7, background:'rgba(212,168,71,0.13)', border:'0.5px solid rgba(212,168,71,0.18)', color:'var(--g2)', fontSize:11.5, fontWeight:500, fontFamily:'Inter, sans-serif', cursor:'pointer', marginBottom:7 }}>
                + {t.nb}
              </button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'0 10px 10px' }}>
              {analyses.length === 0
                ? <div style={{ fontSize:11, color:'var(--t3)', padding:10, lineHeight:1.5 }}>{t.hempty}</div>
                : analyses.map(a => {
                  const rfC = a.rf > 65 ? 'var(--rose)' : a.rf > 35 ? 'var(--gold)' : 'var(--grn)'
                  return (
                    <div key={a.id} style={{ padding:'8px 10px', borderRadius:7, marginBottom:2, border:'0.5px solid transparent' }}>
                      <div style={{ fontSize:8.5, fontWeight:500, letterSpacing:'1px', textTransform:'uppercase', color:'var(--t3)', marginBottom:2 }}>
                        {a.person && <span style={{ color:'var(--gold)', marginRight:4 }}>• {a.person}</span>}
                        {(TR[a.lang]?.modes||{})[a.mode]||a.mode}
                      </div>
                      <div style={{ fontSize:11, color:'var(--t2)', lineHeight:1.35, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{a.text}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:3 }}>
                        <span style={{ fontSize:9.5, color:rfC }}>RF {a.rf}</span>
                        <span style={{ fontSize:9, color:'var(--t3)' }}>·</span>
                        <span style={{ fontSize:9.5, color:'var(--gold)' }}>{a.sc}% {t.fiab}</span>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        )}

        {/* PEOPLE TAB */}
        {tab === 'p' && (
          <div style={{ flex:1, overflowY:'auto', padding:'8px 10px' }}>
            <button onClick={()=>setApfOpen(!apfOpen)} style={{ display:'flex', alignItems:'center', gap:6, width:'100%', padding:'7px 10px', borderRadius:7, background:'transparent', border:'0.5px dashed var(--b2)', color:'var(--t2)', fontSize:11, fontWeight:500, fontFamily:'Inter, sans-serif', cursor:'pointer', marginBottom:7 }}>
              + {t.padd}
            </button>
            {apfOpen && (
              <div style={{ padding:10, background:'var(--s2)', borderRadius:10, marginBottom:8, border:'0.5px solid var(--b2)' }}>
                <input value={newPersonName} onChange={e=>setNewPersonName(e.target.value)} placeholder="Prénom ou pseudo…" onKeyDown={e=>e.key==='Enter'&&addPerson()} style={{ width:'100%', background:'transparent', border:'none', borderBottom:'0.5px solid var(--b2)', outline:'none', fontFamily:'Inter, sans-serif', fontSize:12, color:'var(--tx)', padding:'4px 0', marginBottom:8 }}/>
                <div style={{ display:'flex', gap:5 }}>
                  <button onClick={addPerson} style={{ flex:1, fontSize:11, fontWeight:500, fontFamily:'Inter, sans-serif', padding:'5px 0', borderRadius:6, border:'none', background:'var(--gold)', color:'#1a1410', cursor:'pointer' }}>Ajouter</button>
                  <button onClick={()=>setApfOpen(false)} style={{ fontSize:11, fontFamily:'Inter, sans-serif', padding:'5px 10px', borderRadius:6, border:'0.5px solid var(--b2)', background:'transparent', color:'var(--t2)', cursor:'pointer' }}>Annuler</button>
                </div>
              </div>
            )}
            {people.length === 0
              ? <div style={{ fontSize:11, color:'var(--t3)', lineHeight:1.6 }}>{t.pplEmpty}</div>
              : people.map(p => {
                const isOn = activePerson?.id === p.id
                const lastRf = p.analyses.length > 0 ? p.analyses[p.analyses.length-1].rf : null
                const rfC = lastRf === null ? 'var(--t3)' : lastRf > 65 ? 'var(--rose)' : lastRf > 35 ? 'var(--gold)' : 'var(--grn)'
                return (
                  <div key={p.id} onClick={()=>{setActivePerson(p);setTab('h');resetChat()}} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 10px', borderRadius:7, cursor:'pointer', marginBottom:3, border: isOn ? '0.5px solid var(--b2)' : '0.5px solid transparent', background: isOn ? 'var(--s2)' : 'transparent' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:p.color+'22', color:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, flexShrink:0 }}>{p.name[0].toUpperCase()}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize:9.5, color:rfC }}>{lastRf===null?'—':`RF ${lastRf}`}</div>
                      <div style={{ fontSize:9, color:'var(--t3)' }}>{p.analyses.length} {t.tabH.toLowerCase()}</div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {/* MODES */}
        <div style={{ padding:'11px 20px', borderBottom:'0.5px solid var(--b1)', background:'var(--s1)', display:'flex', alignItems:'center', gap:6, flexShrink:0, flexWrap:'wrap' }}>
          {(Object.entries(t.modes) as [AnalysisMode, string][]).map(([k,v])=>(
            <button key={k} onClick={()=>setMode(k)} style={{ fontSize:10.5, padding:'4px 10px', borderRadius:20, border:'0.5px solid', borderColor: mode===k ? 'rgba(212,168,71,0.28)' : 'rgba(255,255,255,0.10)', background: mode===k ? 'rgba(212,168,71,0.13)' : 'transparent', color: mode===k ? 'var(--g2)' : 'var(--t2)', cursor:'pointer', fontFamily:'Inter, sans-serif', whiteSpace:'nowrap' }}>
              {v}
            </button>
          ))}
          <div style={{ marginLeft:'auto', fontSize:11, color:'var(--gold)' }}>{t.creditsLeft(credits)}</div>
        </div>

        {/* PERSON BANNER */}
        {activePerson && (
          <div style={{ padding:'8px 20px', background:'var(--s2)', borderBottom:'0.5px solid var(--b1)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:activePerson.color+'22', color:activePerson.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600 }}>{activePerson.name[0].toUpperCase()}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12.5, fontWeight:500 }}>{activePerson.name}</div>
              <div style={{ fontSize:10, color:'var(--t2)' }}>
                {activePerson.analyses.length === 0 ? t.noTrend : t.pTrend(activePerson.analyses.length, Math.round(activePerson.analyses.reduce((s,a)=>s+a.rf,0)/activePerson.analyses.length))}
              </div>
            </div>
            <button onClick={()=>{setActivePerson(null);resetChat()}} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:15 }}>×</button>
          </div>
        )}

        {/* CHAT */}
        <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:18, display:'flex', flexDirection:'column', gap:11 }}>
          {showEmpty && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'28px 14px' }}>
              <div style={{ marginBottom:12, opacity:.5 }}>
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none"><path d="M8 14 Q24 8 40 14 L40 30 Q24 36 8 30 Z" fill="none" stroke="#d4a847" strokeWidth="1.3" opacity=".7"/><circle cx="18" cy="22" r="2.6" fill="#d4a847" opacity=".8"/><circle cx="24" cy="21" r="1.9" fill="#d4a847" opacity=".45"/><circle cx="30" cy="22" r="2.6" fill="#d4a847" opacity=".8"/></svg>
              </div>
              <div style={{ fontFamily:'Syne, sans-serif', fontSize:17, fontWeight:600, marginBottom:6 }}>{t.emptyT}</div>
              <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.65, maxWidth:300, marginBottom:18 }}>{t.emptySub}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center', maxWidth:360 }}>
                {t.exs.map((x,i)=>(
                  <button key={i} onClick={()=>useExample(x.t,x.m)} style={{ fontSize:10.5, color:'var(--t2)', border:'0.5px solid var(--b2)', borderRadius:20, padding:'4px 11px', cursor:'pointer', fontFamily:'Inter, sans-serif', background:'transparent' }}>
                    {x.l}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages}
        </div>

        {/* INPUT */}
        <div style={{ background:'var(--s1)', borderTop:'0.5px solid var(--b1)', padding:'11px 18px', flexShrink:0 }}>
          <div style={{ display:'flex', gap:6, marginBottom:7, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:10, color:'var(--t3)', whiteSpace:'nowrap' }}>{t.whoL}</span>
            <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
              {t.who.map((w,i)=>(
                <button key={i} onClick={()=>setWho(who===t.whoV[i]?'':t.whoV[i])} style={{ fontSize:9.5, padding:'2px 7px', borderRadius:12, border:'0.5px solid', borderColor: who===t.whoV[i] ? 'var(--b2)' : 'var(--b1)', background: who===t.whoV[i] ? 'var(--s3)' : 'transparent', color: who===t.whoV[i] ? 'var(--tx)' : 'var(--t3)', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>{w}</button>
              ))}
            </div>
            <div style={{ marginLeft:'auto' }}>
              <input value={extra} onChange={e=>setExtra(e.target.value)} placeholder={t.ctxPh} style={{ fontSize:11, color:'var(--t2)', background:'transparent', border:'none', outline:'none', fontFamily:'Inter, sans-serif', width:130 }}/>
            </div>
          </div>

          <div style={{ display:'flex', gap:6, marginBottom:7, alignItems:'center' }}>
            <button onClick={()=>document.getElementById('fi-ia')?.click()} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10.5, color:'var(--t2)', border:'0.5px solid var(--b2)', borderRadius:7, padding:'4px 9px', cursor:'pointer', background:'transparent', fontFamily:'Inter, sans-serif' }}>
              📷 {t.upL}
            </button>
            {imgB64 && (
              <div style={{ display:'flex', alignItems:'center', gap:5, background:'var(--s2)', border:'0.5px solid var(--b2)', borderRadius:7, padding:'3px 7px', fontSize:10.5, color:'var(--t2)' }}>
                <span style={{ maxWidth:70, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', fontSize:9.5 }}>{imgName}</span>
                <button onClick={()=>{setImgB64(null);setImgName('')}} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:12, padding:'0 2px' }}>×</button>
              </div>
            )}
            <input type="file" id="fi-ia" accept="image/*" style={{ display:'none' }} onChange={onImgChange}/>
          </div>

          <div style={{ display:'flex', alignItems:'flex-end', gap:7, background:'var(--s2)', border:'0.5px solid var(--b2)', borderRadius:11, padding:'7px 10px' }}>
            <textarea ref={taRef} value={text} onChange={onTextInput} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();analyze()}}} placeholder={t.ph} rows={1} style={{ flex:1, border:'none', outline:'none', background:'transparent', fontFamily:'Inter, sans-serif', fontSize:12.5, color:'var(--tx)', resize:'none', lineHeight:1.6, maxHeight:100, minHeight:18 }}/>
            <button onClick={analyze} disabled={!canSend} style={{ width:26, height:26, borderRadius:'50%', background: canSend ? 'var(--gold)' : 'var(--s3)', border:'none', cursor: canSend ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .13s' }}>
              {loading
                ? <div style={{ width:11, height:11, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
                : <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </button>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
            <span style={{ fontSize:9.5, color:'var(--t3)' }}>{text.length} / 1500</span>
            <span style={{ fontSize:9.5, color:'var(--t3)' }}>{t.hint}</span>
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      {shareModal && (
        <div onClick={()=>setShareModal(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.78)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'var(--s1)', border:'0.5px solid var(--b2)', borderRadius:16, padding:18, width:300 }}>
            <button onClick={()=>setShareModal(null)} style={{ float:'right', background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:15 }}>×</button>
            <div style={{ fontFamily:'Syne, sans-serif', fontSize:15, fontWeight:700, marginBottom:3 }}>{t.smT}</div>
            <div style={{ fontSize:11, color:'var(--t2)', marginBottom:12 }}>InterpretAid · interpretaid.app</div>
            {(() => {
              const rfL = rfLevel(shareModal.rf)
              return (
                <div style={{ background:rfL.bg, border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:9, padding:14, marginBottom:12 }}>
                  <div style={{ fontSize:9.5, fontWeight:500, letterSpacing:'1px', textTransform:'uppercase', color:rfL.c, marginBottom:5 }}>{t.rfLbl}</div>
                  <div style={{ fontFamily:'Syne, sans-serif', fontSize:26, fontWeight:700, color:rfL.c, marginBottom:2 }}>{shareModal.rf}/100</div>
                  <div style={{ fontSize:11, color:rfL.c, opacity:.85, marginBottom:6 }}>{rfL.label}</div>
                  <div style={{ fontSize:10.5, color:'var(--t2)', fontStyle:'italic', lineHeight:1.5 }}>"{shareModal.result.share_headline}"</div>
                  <div style={{ fontSize:9, color:'var(--t3)', marginTop:7 }}>InterpretAid · interpretaid.app</div>
                </div>
              )
            })()}
            <div style={{ display:'flex', gap:7 }}>
              <button onClick={()=>{
                const rfL = rfLevel(shareModal.rf)
                navigator.clipboard.writeText(`${t.rfLbl}: ${shareModal.rf}/100 — ${rfL.label}\n"${shareModal.result.share_headline}"\n\nInterpretAid → interpretaid.app`).catch(()=>{})
              }} style={{ flex:1, fontSize:11.5, fontWeight:500, fontFamily:'Inter, sans-serif', padding:7, borderRadius:7, cursor:'pointer', border:'none', background:'var(--s3)', color:'var(--tx)' }}>Copier</button>
              <button onClick={()=>{
                const rfL = rfLevel(shareModal.rf)
                window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(`${t.rfLbl}: ${shareModal.rf}/100 — ${rfL.label}\n"${shareModal.result.share_headline}"\n\nInterpretAid → interpretaid.app`),'_blank')
              }} style={{ flex:1, fontSize:11.5, fontWeight:500, fontFamily:'Inter, sans-serif', padding:7, borderRadius:7, cursor:'pointer', border:'none', background:'var(--gold)', color:'#1a1410' }}>Twitter / X</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Avt() {
  return (
    <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(212,168,71,0.13)', border:'0.5px solid rgba(212,168,71,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="4.5" cy="7" r="1.4" fill="#d4a847"/><circle cx="7" cy="6.4" r="1.1" fill="#d4a847" opacity=".5"/><circle cx="9.5" cy="7" r="1.4" fill="#d4a847"/></svg>
    </div>
  )
}

function ResultCard({ result, t, lang, activePerson, people, onShare, onFollowup, rfLevel }: {
  result: AnalysisResult; t: TREntry; lang: Lang
  activePerson: Person|null; people: Person[]
  onShare: ()=>void; onFollowup: (q:string)=>void
  rfLevel: (rf:number)=>{ label:string; c:string; bg:string }
}) {
  const [expandedInterp, setExpandedInterp] = useState(0)
  const [copiedReply, setCopiedReply] = useState<string|null>(null)
  const rf = Math.max(0, Math.min(100, Math.round(result.red_flag_score || 0)))
  const sc = Math.max(0, Math.min(100, Math.round(result.confidence_score || 65)))
  const rfL = rfLevel(rf)
  const gottman = result.gottman_signals || []
  const adv = result.advanced_signals || []
  const ind = result.indicators || {}
  const interps = result.interpretations || []
  const fups = result.followup_suggestions || []

  const circ = 2 * Math.PI * 28
  const dash = circ * (rf / 100)

  const personAnalyses = activePerson ? activePerson.analyses.slice(-6) : []

  function copyReply(text: string, type: string) {
    navigator.clipboard.writeText(text).catch(()=>{})
    setCopiedReply(type)
    setTimeout(()=>setCopiedReply(null), 1800)
  }

  const rCls: Record<string, string> = { neutre:'var(--t3)', confiante:'var(--teal)', stratégique:'var(--vio, #9b7ee8)', froide:'var(--rose)', directe:'var(--gold)' }

  return (
    <div style={{ display:'flex', gap:8, alignItems:'flex-start', animation:'fadeUp .25s ease' }}>
      <Avt/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ background:'var(--s1)', border:'0.5px solid var(--b2)', borderRadius:17, overflow:'hidden' }}>

          {/* TOP BAR */}
          <div style={{ height:2, background:`linear-gradient(90deg,${rfL.c},#3ab8a0)`, width:'100%' }}/>

          <div style={{ padding:'14px 16px' }}>
            {/* PERSON TAG */}
            {activePerson && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10.5, color:'#3ab8a0', background:'rgba(58,184,160,0.12)', border:'0.5px solid rgba(58,184,160,0.2)', borderRadius:20, padding:'3px 9px', marginBottom:9 }}>
                👤 {activePerson.name}
              </div>
            )}

            {/* RED FLAG HERO */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:11, background:rfL.bg, border:'0.5px solid rgba(255,255,255,0.05)', marginBottom:11, position:'relative' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:9, fontWeight:500, letterSpacing:'1.1px', textTransform:'uppercase', color:rfL.c, marginBottom:3 }}>{t.rfLbl}</div>
                <div style={{ fontFamily:'Syne, sans-serif', fontSize:30, fontWeight:700, lineHeight:1, color:rfL.c }}>{rf}<span style={{ fontSize:15, fontWeight:500 }}>/100</span></div>
                <div style={{ fontSize:11, color:rfL.c, opacity:.85, marginTop:4 }}>{rfL.label}</div>
                <div style={{ fontSize:10.5, color:'var(--t2)', marginTop:5, lineHeight:1.5, maxWidth:200 }}>{result.red_flag_explanation}</div>
              </div>
              <div style={{ position:'relative', width:60, height:60, flexShrink:0 }}>
                <svg viewBox="0 0 70 70" fill="none" width="60" height="60">
                  <circle cx="35" cy="35" r="28" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                  <circle cx="35" cy="35" r="28" stroke={rfL.c} strokeWidth="5" strokeDasharray={`${dash.toFixed(1)} ${(circ-dash).toFixed(1)}`} strokeLinecap="round" transform="rotate(-90 35 35)"/>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:700, color:rfL.c, lineHeight:1 }}>
                  {rf}<span style={{ fontSize:7.5, fontWeight:500, marginTop:1 }}>/100</span>
                </div>
              </div>
              <button onClick={onShare} style={{ position:'absolute', right:10, bottom:8, fontSize:10, fontWeight:500, fontFamily:'Inter, sans-serif', padding:'3px 9px', borderRadius:5, cursor:'pointer', border:'none', background:rfL.c, color:'#1a1410' }}>{t.shr}</button>
            </div>

            {/* TREND BARS */}
            {personAnalyses.length >= 2 && (
              <div style={{ background:'var(--s2)', borderRadius:7, padding:'9px 11px', marginBottom:11 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:500, letterSpacing:'1.1px', textTransform:'uppercase', color:'var(--t3)' }}>Évolution RF</span>
                  <span style={{ fontSize:9.5, color:'var(--t2)' }}>{personAnalyses.length} pts</span>
                </div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:28 }}>
                  {personAnalyses.map((a,i)=>{
                    const c = a.rf > 65 ? 'var(--rose)' : a.rf > 35 ? 'var(--gold)' : 'var(--grn)'
                    const h = Math.max(4, Math.round((a.rf/100)*28))
                    return <div key={i} style={{ flex:1, borderRadius:'2px 2px 0 0', background:c, height:`${h}px`, minWidth:8 }}/>
                  })}
                </div>
              </div>
            )}

            {/* RELIABILITY */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <div style={{ fontSize:9, fontWeight:500, letterSpacing:'1.2px', textTransform:'uppercase', color:'var(--t3)', marginBottom:2 }}>{t.rel}</div>
                <div style={{ fontSize:10.5, color:'var(--t2)', fontStyle:'italic', maxWidth:260, lineHeight:1.5 }}>{result.confidence_explanation}</div>
              </div>
              <span style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:700, color:'var(--gold)' }}>{sc}%</span>
            </div>
            <div style={{ height:2, background:'rgba(255,255,255,0.04)', borderRadius:1, overflow:'hidden', marginBottom:11 }}>
              <div style={{ height:'100%', borderRadius:1, background:'linear-gradient(90deg,var(--gold),#3ab8a0)', width:`${sc}%`, transition:'width .9s ease' }}/>
            </div>

            {/* INTERPRETATIONS */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:9, fontWeight:500, letterSpacing:'1.2px', textTransform:'uppercase', color:'var(--t3)', marginBottom:7 }}>{t.interps}</div>
              {interps.map((it,i)=>(
                <div key={i} onClick={()=>setExpandedInterp(expandedInterp===i?-1:i)} style={{ border:'0.5px solid', borderColor: expandedInterp===i ? 'rgba(212,168,71,0.25)' : 'rgba(255,255,255,0.055)', borderRadius:11, padding:'9px 11px', marginBottom:5, cursor:'pointer', background: expandedInterp===i ? 'rgba(212,168,71,0.07)' : 'transparent', position:'relative' }}>
                  <span style={{ position:'absolute', right:9, top:9, fontSize:9, color:'var(--t3)' }}>{expandedInterp===i?'▾':'▸'}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                    <span style={{ fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:700, color:'var(--g2)', minWidth:33 }}>{Math.round(it.probability||0)}%</span>
                    <div style={{ flex:1, height:2, background:'rgba(255,255,255,0.04)', borderRadius:1, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:1, background:'var(--gold)', width:`${Math.round(it.probability||0)}%`, transition:'width .6s ease' }}/>
                    </div>
                  </div>
                  <div style={{ fontSize:11.5, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>{it.label}</div>
                  {expandedInterp===i && <div style={{ fontSize:11, color:'var(--t2)', lineHeight:1.65, marginTop:4 }}>{it.detail||it.short}</div>}
                </div>
              ))}
            </div>

            {/* TONE + EMOTIONS + INTENTIONS */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:5, marginBottom:6 }}>
              {[
                { lbl:t.tone, content:<div style={{ fontSize:11, color:'var(--tx)', marginTop:3, lineHeight:1.5 }}>{result.tone}</div> },
                { lbl:t.emo, content:<div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:3 }}>{(result.emotions||[]).map((e,i)=><span key={i} style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'rgba(224,90,90,0.12)', color:'#f08080' }}>{e}</span>)}</div> },
                { lbl:t.int, content:<div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:3 }}>{(result.intentions||[]).map((v,i)=><span key={i} style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'rgba(58,184,160,0.12)', color:'#3ab8a0' }}>{v}</span>)}</div> },
              ].map((block,i)=>(
                <div key={i} style={{ background:'var(--s2)', borderRadius:7, padding:'8px 10px' }}>
                  <div style={{ fontSize:9, fontWeight:500, letterSpacing:'1.2px', textTransform:'uppercase', color:'var(--t3)' }}>{block.lbl}</div>
                  {block.content}
                </div>
              ))}
            </div>

            {/* INDICATORS */}
            <div style={{ background:'var(--s2)', borderRadius:7, padding:'8px 10px', marginBottom:6 }}>
              <div style={{ fontSize:9, fontWeight:500, letterSpacing:'1.2px', textTransform:'uppercase', color:'var(--t3)', marginBottom:6 }}>{t.inds}</div>
              {([['interest',t.interest,'#3ab8a0'],['stress',t.stress,'#d4a847'],['sincerity',t.sincerity,'#9b7ee8'],['openness',t.openness,'#d4a847']] as [string,string,string][]).map(([k,lbl,c])=>(
                <div key={k} style={{ display:'flex', alignItems:'center', marginBottom:5 }}>
                  <span style={{ fontSize:10.5, color:'var(--t2)', minWidth:80 }}>{lbl}</span>
                  <div style={{ flex:1, height:2, background:'rgba(255,255,255,0.04)', borderRadius:1, margin:'0 8px', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:1, background:c, width:`${Math.round((ind as unknown as Record<string,number>)[k]||0)}%`, transition:'width .7s ease' }}/>
                  </div>
                  <span style={{ fontSize:10.5, fontWeight:500, color:c, minWidth:26, textAlign:'right' }}>{Math.round((ind as unknown as Record<string,number>)[k]||0)}%</span>
                </div>
              ))}
            </div>

            {/* GOTTMAN */}
            {gottman.length > 0 && (
              <div style={{ background:'rgba(224,90,90,0.12)', border:'0.5px solid rgba(224,90,90,0.18)', borderRadius:7, padding:'8px 10px', marginBottom:6 }}>
                <div style={{ fontSize:9, fontWeight:500, letterSpacing:'1px', textTransform:'uppercase', color:'var(--rose)', marginBottom:4 }}>{t.gottT}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>{gottman.map((s,i)=><span key={i} style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'rgba(224,90,90,0.15)', color:'#f08080' }}>{s}</span>)}</div>
                {result.gottman_note && <div style={{ fontSize:10, color:'var(--rose)', marginTop:4, opacity:.85 }}>{result.gottman_note}</div>}
              </div>
            )}

            {/* ADVANCED SIGNALS */}
            {adv.length > 0 && (
              <div style={{ background:'var(--s2)', borderRadius:7, padding:'8px 10px', marginBottom:6 }}>
                <div style={{ fontSize:9, fontWeight:500, letterSpacing:'1.2px', textTransform:'uppercase', color:'var(--t3)', marginBottom:4 }}>{t.adv}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>{adv.map((s,i)=><span key={i} style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'rgba(155,126,232,0.12)', color:'#9b7ee8' }}>{s}</span>)}</div>
              </div>
            )}

            {/* REPLIES */}
            <div style={{ borderTop:'0.5px solid var(--b1)', margin:'0 -16px', padding:'11px 16px 0' }}>
              <div style={{ fontSize:9, fontWeight:500, letterSpacing:'1.2px', textTransform:'uppercase', color:'var(--t3)', marginBottom:7 }}>
                {t.reps} <span style={{ textTransform:'none', letterSpacing:0, fontSize:8.5, color:'var(--t3)' }}>— {t.cpH}</span>
              </div>
              {(result.suggested_replies||[]).map((rep,i)=>(
                <div key={i} onClick={()=>copyReply(rep.text, rep.type)} style={{ padding:'7px 9px', borderRadius:7, cursor:'pointer', marginBottom:3, border:'0.5px solid', borderColor: copiedReply===rep.type ? 'rgba(58,184,160,0.22)' : 'transparent', background: copiedReply===rep.type ? 'rgba(58,184,160,0.08)' : 'transparent', transition:'all .12s' }}>
                  <div style={{ fontSize:8.5, fontWeight:500, letterSpacing:'1px', textTransform:'uppercase', color: rCls[rep.type]||'var(--t3)', marginBottom:2 }}>
                    {copiedReply===rep.type ? (lang==='fr'?'Copié !':'Copied!') : t.rT[rep.type as keyof typeof t.rT]||rep.type}
                  </div>
                  <div style={{ fontSize:11.5, color:'var(--t2)', lineHeight:1.5 }}>{rep.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FOLLOWUP */}
          {fups.length > 0 && (
            <div style={{ padding:'9px 16px', borderTop:'0.5px solid var(--b1)' }}>
              <div style={{ fontSize:9, color:'var(--t3)', marginBottom:5, letterSpacing:'.3px', textTransform:'uppercase', fontWeight:500 }}>{t.cont}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {fups.map((q,i)=>(
                  <button key={i} onClick={()=>onFollowup(q)} style={{ fontSize:10.5, color:'var(--t2)', border:'0.5px solid var(--b1)', borderRadius:20, padding:'4px 9px', cursor:'pointer', fontFamily:'Inter, sans-serif', background:'transparent', transition:'all .12s' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
