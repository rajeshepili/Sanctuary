import { useEffect, useRef } from 'react'

export function useEventListener<TKey extends keyof WindowEventMap>(
  eventName: TKey,
  handler: (event: WindowEventMap[TKey]) => void,
  element: Window | HTMLElement | null = typeof window !== 'undefined'
    ? window
    : null,
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[TKey])
    }

    element.addEventListener(eventName, eventListener)

    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}
