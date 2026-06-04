import { useEventListener } from './use-event-listener'

type Key = 'Enter' | 'Escape' | string

interface ShortcutOptions {
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  mod?: boolean // cross-platform: true if either ctrl or meta is pressed
  preventDefault?: boolean
}

/**
 * A centralized hook for binding keyboard shortcuts.
 */
export function useKeyboardShortcut(
  key: Key,
  callback: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {},
) {
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (options.mod !== undefined) {
      const hasMod = e.ctrlKey || e.metaKey
      if (hasMod !== options.mod) return
    } else {
      if (options.ctrl !== undefined && e.ctrlKey !== options.ctrl) return
      if (options.meta !== undefined && e.metaKey !== options.meta) return
    }

    if (options.shift !== undefined && e.shiftKey !== options.shift) return
    if (options.alt !== undefined && e.altKey !== options.alt) return

    if (e.key.toLowerCase() === key.toLowerCase()) {
      if (options.preventDefault) {
        e.preventDefault()
      }
      callback(e)
    }
  })
}
