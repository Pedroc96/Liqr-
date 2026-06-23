import { useState, useCallback } from 'react'
import { Profile } from '@/lib/types'

export interface SwipeRecord {
  profile: Profile
  action: 'like' | 'skip'
  timestamp: number
}

export function useSession() {
  const [history, setHistory] = useState<SwipeRecord[]>([])

  const recordSwipe = useCallback((profile: Profile, action: 'like' | 'skip') => {
    setHistory((prev) => [...prev, { profile, action, timestamp: Date.now() }])
  }, [])

  const liked = history.filter((h) => h.action === 'like').map((h) => h.profile)
  const skipped = history.filter((h) => h.action === 'skip').map((h) => h.profile)

  const reset = useCallback(() => setHistory([]), [])

  return { history, liked, skipped, recordSwipe, reset }
}