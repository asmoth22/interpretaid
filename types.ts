'use client'
import Link from 'next/link'

const features = [
  { icon: '🧠', title: 'Multi-interprétations', desc: '3 lectures possibles avec probabilités — jamais une vérité absolue.' },
  { icon: '🚩', title: 'Red Flag Score', desc: 'Un score 0-100 visuel et partageable. Vert, orange ou rouge.' },
  { icon: '👤', title: 'Suivi de personnes', desc: "Suis l'évolution d'une personne dans le temps. Tendance RF sur 6 analyses." },
  { icon: '📷', title: 'Analyse screenshot', desc: "Glisse une capture d'écran. L'IA voit tout le contexte visuel." },
  { icon: '🔬', title: 'Méthodes expertes', desc: 'Ekman, Gottman, Cialdini, PNL — pas du ChatGPT générique.' },
  { icon: '🌐', title: 'Bilingue', desc: 'Français et anglais. Interface et analyse dans ta langue.' },
]

const examples = [
  { msg: '"Ok, c\'est cool."', label: 'Passif-agressif ?', mode: 'conflit', rf: 74 },
  { msg: '"Je suis juste occupé en ce moment."', label: 'Il s\'éloigne ?', mode: 'relationnel', rf: 58 },
  { msg: '"Bien reçu. On en reparlera."', label: 'Mail froid ?', mode: 'professionnel', rf: 31 },
  { msg: '"T\'as un truc."', label: 'Flirt ou non ?', mode: 'flirt', rf: 18 },
]

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--tx)' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '0.5px solid var(--b1)', position: 'sticky', top: 0, background: 'rgba(15,14,13,0.92)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="9" fill="#1e1c1a"/><path d="M7 11 Q16 7 25 11 L25 21 Q16 25 7 21 Z" fill="none" stroke="#d4a847" strokeWidth="1.1"/><circle cx="12" cy="16" r="1.6" fill="#d4a847" opacity=".9"/><circle cx="16" cy="15.3" r="1.2" fill="#d4a847" opacity=".5"/><circle cx="20" cy="16" r="1.6" fill="#d4a847" opacity=".9"/></svg>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>Interpret<span style={{ color: 'var(--gold)' }}>Aid</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{ fontSize: 13, color: 'var(--t2)', textDecoration: 'none' }}>Connexion</Link>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, background: 'var(--gold)', color: '#1a1410', padding: '7px 16px', borderRadius: 8, textDecoration: 'none' }}>
            Essayer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 500, letterSpacing: '1.3px', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(212,168,71,0.13)', padding: '4px 12px', borderRadius: 20, marginBottom: 20 }}>
          5 analyses gratuites par jour
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.15, marginBottom: 16, letterSpacing: -1 }}>
          Ce que ce message<br />veut <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>vraiment</em> dire
        </h1>
        <p style={{ fontSize: 16, color: 'var(--t2)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
          InterpretAid analyse le ton, les émotions cachées et les intentions de n'importe quel message. Red Flag Score, suivi de personnes, méthodes d'experts.
        </p>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold)', color: '#1a1410', fontSize: 15, fontWeight: 600, padding: '13px 28px', borderRadius: 12, textDecoration: 'none', fontFamily: 'Syne, sans-serif' }}>
          Analyser un message →
        </Link>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 12 }}>Sans carte bancaire · 5 analyses offertes</p>
      </section>

      {/* Examples */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          {examples.map((ex, i) => {
            const rfC = ex.rf > 65 ? '#e05a5a' : ex.rf > 35 ? '#d4a847' : '#5ab87a'
            return (
              <Link key={i} href={`/dashboard?text=${encodeURIComponent(ex.msg)}&mode=${ex.mode}`}
                style={{ background: 'var(--s1)', border: '0.5px solid var(--b2)', borderRadius: 12, padding: '14px 16px', textDecoration: 'none', display: 'block', transition: 'border-color 0.15s' }}>
                <p style={{ fontSize: 13, color: 'var(--tx)', marginBottom: 6, lineHeight: 1.4 }}>« {ex.msg} »</p>
                <p style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 10 }}>{ex.label}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.8px', textTransform: 'uppercase', color: rfC }}>RF {ex.rf}/100</span>
                  <span style={{ fontSize: 11, color: 'var(--gold)' }}>Analyser →</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'var(--s1)', borderTop: '0.5px solid var(--b1)', borderBottom: '0.5px solid var(--b1)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>
            Pas un chatbot. Un expert.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: 'var(--s2)', border: '0.5px solid var(--b1)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 500, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
          Commence maintenant
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 24 }}>
          5 analyses gratuites par jour. Aucune carte requise. Bilingue FR / EN.
        </p>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold)', color: '#1a1410', fontSize: 14, fontWeight: 600, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
          Analyser un message →
        </Link>
      </section>

      <footer style={{ borderTop: '0.5px solid var(--b1)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, color: 'var(--t3)' }}>InterpretAid</span>
        <span style={{ fontSize: 11, color: 'var(--t3)' }}>⚠️ Analyse estimative, non scientifique</span>
      </footer>
    </main>
  )
}
