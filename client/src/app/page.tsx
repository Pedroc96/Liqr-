'use client'

import { useState } from 'react'
import ProfileCard from '@/components/ProfileCard'
import { PROFILES } from '@/lib/profiles'

export default function Home() {
  const [index, setIndex] = useState(0)
  const profile = PROFILES[index]

  const next = () => {
    setIndex((i) => (i + 1 < PROFILES.length ? i + 1 : 0))
  }

  if (!profile) return null

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl text-amber-100 italic font-serif">Liqr</h1>
      <ProfileCard
        profile={profile}
        onSkip={next}
        onLike={next}
      />
      <p className="text-xs text-zinc-600">
        Perfil {index + 1} de {PROFILES.length}
      </p>
    </main>
  )
}