'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    if (!email || !password) return
    setLoading(true); setError(''); setSuccess('')
    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      setSuccess('Compte créé ! Vérifie ton email pour confirmer.')
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError('Email ou mot de passe incorrect.'); setLoading(false); return }
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const inp = { width: '100%', background: 'transparent', border: 'none', borderBottom: '0.5px solid rgba(255,255,255,0.1)', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--tx)', padding: '8px 0', marginBottom: 16 } as React.CSSProperties

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Link href="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--tx)', textDecoration: 'none', marginBottom: 32 }}>
        Interpret<span style={{ color: 'var(--gold)' }}>Aid</span>
      </Link>

      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b2)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', background: 'var(--s2)', borderRadius: 10, padding: 3, marginBottom: 24 }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
              style={{ flex: 1, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif', padding: '7px 0', borderRadius: 8, border: 'none', background: mode === m ? 'var(--s3)' : 'transparent', color: mode === m ? 'var(--tx)' : 'var(--t2)', cursor: 'pointer' }}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inp} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" style={inp} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

        {error && <p style={{ fontSize: 12.5, color: 'var(--rose)', background: 'rgba(224,90,90,0.1)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ fontSize: 12.5, color: 'var(--teal)', background: 'rgba(58,184,160,0.1)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{success}</p>}

        <button onClick={handleSubmit} disabled={loading || !email || !password}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--gold)', color: '#1a1410', fontSize: 14, fontWeight: 600, fontFamily: 'Syne, sans-serif', padding: '11px 0', borderRadius: 10, border: 'none', cursor: 'pointer', opacity: loading || !email || !password ? 0.4 : 1 }}>
          {loading && <div style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a1410', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
          {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
        </button>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '0.5px solid var(--b1)', textAlign: 'center' }}>
          <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--t2)', textDecoration: 'underline' }}>
            Continuer sans compte (5 analyses/jour)
          </Link>
        </div>
      </div>
    </main>
  )
}
