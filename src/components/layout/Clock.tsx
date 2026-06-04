import { memo, useEffect, useMemo, useState } from 'react'
import { useMood } from '#/hooks/use-mood'

interface LiveClockProps {
  use24Hour?: boolean
}

const moodStyles = {
  morning: {
    time: 'text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
    date: 'text-foreground/60',
  },
  day: {
    time: 'text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.18)]',
    date: 'text-foreground/70',
  },
  evening: {
    time: 'text-foreground/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]',
    date: 'text-foreground/60',
  },
  night: {
    time: 'text-foreground/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]',
    date: 'text-foreground/40',
  },
} as const

export const LiveClock = memo(function LiveClockComponent({
  use24Hour = false,
}: LiveClockProps) {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState(() => new Date())
  const mood = useMood()

  const currentMoodStyle = moodStyles[mood]

  useEffect(() => {
    let interval: number

    const sync = () => {
      setTime(new Date())

      interval = window.setInterval(() => {
        setTime(new Date())
      }, 60000)
    }

    const now = new Date()
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    const timeout = window.setTimeout(sync, delay)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [],
  )

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !use24Hour,
      }),
    [use24Hour],
  )

  const formattedTime = timeFormatter.format(time)

  const formattedDate = dateFormatter.format(time)

  if (!mounted) return <div className="h-[72px]" />

  return (
    <div
      className="
        flex flex-col items-center
        text-center
        select-none
        space-y-1
    "
    >
      {/* Time */}
      <span
        className={`
            font-black
            text-3xl md:text-4xl
            tracking-tight
            ${currentMoodStyle.time}

        `}
      >
        {formattedTime}
      </span>

      {/* Date */}
      <span
        className={`
            text-xs
            font-medium
            tracking-wide
            ${currentMoodStyle.date}
            uppercase
            drop-shadow-sm
        `}
      >
        {formattedDate}
      </span>
    </div>
  )
})
