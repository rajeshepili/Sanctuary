import { AnimatePresence } from 'framer-motion'
import type { ThemeMood } from '#/types'

import { sceneRegistry } from './scenes/shared/scene-registry'

interface Props {
  mood: ThemeMood
}

export function Background({ mood }: Props) {
  const Scene = sceneRegistry[mood].component

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden
    >
      <AnimatePresence mode="sync">
        <Scene key={mood} />
      </AnimatePresence>
    </div>
  )
}
