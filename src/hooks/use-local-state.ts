import { useState, useCallback } from 'react'
import { localStore } from '#/lib/storage'
import { useEventListener } from './use-event-listener'

export function useLocalState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    const stored = localStore.get(key)
    if (stored !== null) {
      try {
        return JSON.parse(stored) as T
      } catch {
        return defaultValue
      }
    }
    return defaultValue
  })

  const setPersistentState = useCallback(
    (valueOrUpdater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const nextValue =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (prev: T) => T)(prev)
            : valueOrUpdater
        localStore.set(key, JSON.stringify(nextValue))
        localStore.dispatchStorageEvent()
        return nextValue
      })
    },
    [key],
  )

  useEventListener('storage', (e: StorageEvent) => {
    if (e.key === key && e.newValue !== null) {
      try {
        const newValue = JSON.parse(e.newValue) as T
        setState(newValue)
      } catch {}
    }
  })

  return [state, setPersistentState] as const
}
