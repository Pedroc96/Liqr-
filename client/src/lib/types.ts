export type Lifestyle = 'modesto' | 'básico' | 'premium' | 'luxo'
export type Phenomenon = 'normal' | 'chatfishing' | 'pig_butchering'

export interface Profile {
  id: string
  emoji: string      
  imageUrl: string  
  name: string
  age: number
  role: string
  bio: string
  monthlyIncome: number
  lifestyle: Lifestyle
  appearanceScore: number
  hasOwnHome: boolean
  hasChildren: boolean
  educationLevel: number
  phenomenon: Phenomenon
}

export interface ScoreBreakdown {
  total: number
  interpretation: string
  breakdown: {
    income: number
    appearance: number
    lifestyle: number
    assets: number
    education: number
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function incomeToLabel(monthlyIncome: number): string {
  if (monthlyIncome < 1000) return 'Risco alto'
  if (monthlyIncome < 2000) return 'Risco moderado'
  if (monthlyIncome < 3500) return 'Equilibrado'
  if (monthlyIncome < 6000) return 'Baixo risco'
  return 'Activo premium'
}