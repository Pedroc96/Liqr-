'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ProfileCard from '@/components/ProfileCard'
import Mirror from '@/components/Mirror'
import { PROFILES } from '@/lib/profiles'
import { useSession } from '@/hooks/useSession'

export default function Home() {
  const [index, setIndex] = useState(0)
  const { history, recordSwipe, reset } = useSession()
  const profile = PROFILES[index]

  const handleSwipe = (action: 'like' | 'skip') => {
    if (!profile) return
    recordSwipe(profile, action)
    setIndex((i) => i + 1)
  }

  const handleRestart = () => {
    reset()
    setIndex(0)
  }

  if (!profile) {
    return <Mirror history={history} onRestart={handleRestart} />
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6 overflow-hidden">
      <h1 className="text-2xl text-amber-100 italic font-serif">Liqr</h1>

      <div className="relative w-full max-w-sm h-[560px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSkip={() => handleSwipe('skip')}
            onLike={() => handleSwipe('like')}
          />
        </AnimatePresence>
      </div>

      <p className="text-xs text-zinc-600">
        Perfil {index + 1} de {PROFILES.length}
      </p>
    </main>
  )
}