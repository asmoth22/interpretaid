'use client'
import { Suspense } from 'react'
import InterpretAidApp from '@/components/InterpretAidApp'

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', fontSize: 13 }}>
        Chargement…
      </div>
    }>
      <InterpretAidApp />
    </Suspense>
  )
}
