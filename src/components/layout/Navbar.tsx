import { Link } from '@tanstack/react-router'
import { SanctuarySettings } from './SanctuarySettings'
import { usePreferencesQueries } from '#/features/preferences/preferences.queries'
import { usePreferencesMutations } from '#/features/preferences/preferences.mutations'
import { APP_NAME, NAV_LINKS } from '#/config/branding'
import { useMoodContext } from '#/contexts/mood-context'
import { Sun, Moon, Sunrise, Sunset, BookOpen } from 'lucide-react'

function MoodIcon({ mood }: { mood: string }) {
  switch (mood) {
    case 'morning':
      return <Sunrise className="w-3.5 h-3.5" />
    case 'day':
      return <Sun className="w-3.5 h-3.5" />
    case 'evening':
      return <Sunset className="w-3.5 h-3.5" />
    case 'night':
      return <Moon className="w-3.5 h-3.5" />
    default:
      return null
  }
}

export function Navbar() {
  const { prefs } = usePreferencesQueries()
  const { updatePreferences } = usePreferencesMutations()
  const mood = useMoodContext()

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-2.5 rounded-full border border-border/20 bg-background/20 backdrop-blur-xl shadow-lg hover:bg-background/60 hover:shadow-primary/5 transition-all duration-500 w-[90%] sm:w-auto sm:min-w-[560px]">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <span className="font-bold text-sm tracking-wide text-foreground/90">
          {APP_NAME}
        </span>
        <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-foreground/5 text-xs text-muted-foreground/70 font-medium">
          <MoodIcon mood={mood} />
          Good {mood.charAt(0).toUpperCase() + mood.slice(1)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeProps={{ className: 'font-bold text-primary' }}
            inactiveProps={{
              className: 'font-semibold hover:text-primary text-foreground/80',
            }}
            className="text-sm transition-colors"
          >
            {link.label}
          </Link>
        ))}

        <div className="w-px h-4 bg-border/60" />

        <SanctuarySettings prefs={prefs} onUpdatePrefs={updatePreferences} />
      </div>
    </div>
  )
}
