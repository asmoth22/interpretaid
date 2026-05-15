import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InterpretAid — Décryptez chaque message',
  description: "Analysez le ton, les intentions cachées et les émotions de n'importe quel message grâce à l'IA. Red Flag Score, suivi de personnes, analyse de screenshots.",
  keywords: ['que veut dire ce message', 'message passif agressif', 'interpréter un mail', 'red flag', 'analyser message IA'],
  openGraph: {
    title: 'InterpretAid',
    description: "L'IA qui lit entre les lignes.",
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
