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