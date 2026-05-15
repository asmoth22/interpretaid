# InterpretAid — Setup Guide

> L'IA qui lit entre les lignes.

---

## Lancer en 10 minutes

### 1. Installer Node.js
Va sur [nodejs.org](https://nodejs.org) → bouton LTS → installe → redémarre ton PC.

### 2. Installer les dépendances
```bash
cd interpretaid
npm install
```

### 3. Variables d'environnement
```bash
cp .env.local.example .env.local
```
Remplis `.env.local` avec :

| Variable | Où la trouver |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com → Settings → API |

### 4. Créer la base de données
Sur [supabase.com](https://supabase.com) → SQL Editor → colle `supabase-schema.sql` → Run.

### 5. Lancer
```bash
npm run dev
```
Ouvre [http://localhost:3000](http://localhost:3000)

---

## Déployer sur Vercel
```bash
npx vercel --prod
```
Ajoute les 4 variables d'env dans Vercel → Settings → Environment Variables.

---

## Structure
```
interpretaid/
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── dashboard/page.tsx          ← App principale
│   ├── login/page.tsx              ← Auth
│   └── api/
│       ├── analyze/route.ts        ← Appel Claude (sécurisé serveur)
│       ├── credits/route.ts        ← Gestion crédits
│       └── followup/route.ts       ← Questions de suivi
├── components/
│   └── InterpretAidApp.tsx         ← App complète React
├── lib/
│   ├── types.ts                    ← Types TypeScript
│   ├── prompt.ts                   ← Prompts experts (Ekman, Gottman, Cialdini)
│   ├── supabase.ts                 ← Clients Supabase
│   └── credits.ts                  ← Logique freemium
└── supabase-schema.sql             ← Schema DB
```

---

## Features
- **Red Flag Score** 0-100 avec jauge visuelle et carte partageable
- **Multi-interprétations** avec probabilités (3 lectures possibles)
- **Suivi de personnes** — mémoire relationnelle dans le temps
- **Analyse screenshot** — glisse une image directement
- **Méthodes expertes** — Ekman, Gottman, Cialdini, PNL
- **Bilingue** FR / EN
- **5 suggestions de réponse** avec copie en un clic
- **Questions de suivi** — conversation continue avec l'IA
- **Freemium** — 5 analyses/jour gratuites
