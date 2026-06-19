import { Profile, ScoreBreakdown } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function calculateScore(profile: Profile): Promise<ScoreBreakdown> {
  const response = await fetch(`${API_URL}/api/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      monthlyIncome: profile.monthlyIncome,
      appearanceScore: profile.appearanceScore,
      lifestyle: profile.lifestyle,
      hasOwnHome: profile.hasOwnHome,
      hasChildren: profile.hasChildren,
      educationLevel: profile.educationLevel,
    }),
  })

  if (!response.ok) {
    throw new Error('Erro ao calcular score')
  }

  return response.json()
}