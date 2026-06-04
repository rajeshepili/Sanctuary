import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type { ThemeMood } from '#/types'
import { useMood } from '#/hooks/use-mood'

const MoodContext = createContext<ThemeMood>('day')

export function MoodProvider({
  children,
  lat,
  lng,
}: {
  children: ReactNode
  lat?: number | null
  lng?: number | null
}) {
  const mood = useMood({ lat, lng })
  return <MoodContext.Provider value={mood}>{children}</MoodContext.Provider>
}

export function useMoodContext() {
  return useContext(MoodContext)
}
