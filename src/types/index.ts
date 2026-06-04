import type { getPreferencesService } from '#/features/preferences/preferences.service'
import type { getAllHabitsService } from '#/features/habits/habits.service'
import type { getActivePromptsService } from '#/features/prompts/prompts.service'
import type { journalEntries, habits } from '#/database/schema'

// ─── Type Helpers ────────────────────────────────────────────────────────────

// Extract array element type
type ArrayElement<TArray extends readonly unknown[]> =
  TArray extends readonly (infer TElement)[] ? TElement : never

// ─── Inferred Enums (From DB Schema) ─────────────────────────────────────────

export type ThemeMood = 'morning' | 'day' | 'evening' | 'night'
export type HabitFrequency = (typeof habits.$inferSelect)['frequency']
export type HabitPriority = (typeof habits.$inferSelect)['priority']
export type HabitCategory = (typeof habits.$inferSelect)['category']
export type HabitStatus = (typeof habits.$inferSelect)['status']

// ─── UI Entity Types (Inferred from Services) ────────────────────────────────

// Preferences
export type UserPreferences = NonNullable<
  Awaited<ReturnType<typeof getPreferencesService>>
>

// Habits
export type HabitsData = NonNullable<
  Awaited<ReturnType<typeof getAllHabitsService>>
>
export type Habit = ArrayElement<HabitsData['habits']>
export type HabitCompletion = ArrayElement<HabitsData['completions']>

// Journal
export type EntryMediaList = {
  id: number
  entryId: number | null
  filePath: string
  thumbnailPath: string
}

export type Entry = typeof journalEntries.$inferSelect & {
  media: EntryMediaList[]
}

export type EntriesData = Entry[]
export type EntryMedia = EntryMediaList

// Prompts
export type CustomPromptsData = NonNullable<
  Awaited<ReturnType<typeof getActivePromptsService>>
>
export type CustomPrompt = ArrayElement<CustomPromptsData>
