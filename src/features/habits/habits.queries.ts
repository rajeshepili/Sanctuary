import { useSuspenseQuery } from '@tanstack/react-query'
import { habitsQueryOptions } from './habits.options'

export function useHabitsQueries() {
  const { data } = useSuspenseQuery(habitsQueryOptions())
  return {
    habits: data.habits,
    completions: data.completions,
  }
}
