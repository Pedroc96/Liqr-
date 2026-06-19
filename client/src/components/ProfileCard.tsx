'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Profile, ScoreBreakdown } from '@/lib/types'
import { calculateScore } from '@/lib/api'

interface ProfileCardProps {
  profile: Profile
  onSkip: () => void
  onLike: () => void
}

export default function ProfileCard({ profile, onSkip, onLike }: ProfileCardProps) {
  const [score, setScore] = useState<ScoreBreakdown | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    calculateScore(profile)
      .then(setScore)
      .catch(() => setScore(null))
      .finally(() => setLoading(false))
  }, [profile])

  const scoreColor = score
    ? score.total >= 80
      ? 'text-green-400'
      : score.total >= 60
        ? 'text-amber-400'
        : 'text-red-400'
    : 'text-gray-500'

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden w-full max-w-sm">
      {/* Imagem */}
      <div className="relative h-72 bg-zinc-900">
        <Image
          src={profile.imageUrl}
          alt={profile.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3 bg-black/70 border border-zinc-700 rounded px-2 py-1">
          <span className={`text-sm font-medium ${scoreColor}`}>
            {loading ? '...' : score ? `Score ${score.total}` : '—'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h2 className="text-xl font-serif italic text-amber-50">
          {profile.name}, {profile.age}
        </h2>
        <p className="text-sm text-zinc-500 mt-1">{profile.role}</p>
        <p className="text-sm text-zinc-400 mt-3 italic border-t border-zinc-800 pt-3">
          {profile.bio}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 border border-zinc-800 rounded">
          <div className="p-2 text-center border-r border-zinc-800">
            <div className="text-amber-200 text-sm font-medium">
              €{profile.monthlyIncome}
            </div>
            <div className="text-[10px] text-zinc-600 uppercase mt-1">Rendimento</div>
          </div>
          <div className="p-2 text-center border-r border-zinc-800">
            <div className="text-amber-200 text-sm font-medium capitalize">
              {profile.lifestyle}
            </div>
            <div className="text-[10px] text-zinc-600 uppercase mt-1">Estilo</div>
          </div>
          <div className="p-2 text-center">
            <div className="text-amber-200 text-sm font-medium">
              {profile.appearanceScore}/10
            </div>
            <div className="text-[10px] text-zinc-600 uppercase mt-1">Aparência</div>
          </div>
        </div>

        {score && (
          <p className="text-xs text-zinc-600 mt-3 italic">
            {score.interpretation}
          </p>
        )}
      </div>

      {/* Acções */}
      <div className="grid grid-cols-2 border-t border-zinc-800">
        <button
          onClick={onSkip}
          className="py-3 text-red-500 hover:bg-red-950 transition-colors text-sm uppercase tracking-wide"
        >
          Descartar
        </button>
        <button
          onClick={onLike}
          className="py-3 text-green-500 hover:bg-green-950 transition-colors text-sm uppercase tracking-wide"
        >
          Investir
        </button>
      </div>
    </div>
  )
}