import type { HabitCompletion } from '#/types'

export function buildCompletionMap(completions: HabitCompletion[]) {
  const map = new Map<number, Set<string>>()

  for (const completion of completions) {
    if (!map.has(completion.habitId)) {
      map.set(completion.habitId, new Set())
    }

    map.get(completion.habitId)!.add(completion.completedAt)
  }

  return map
}
