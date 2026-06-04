import { useSuspenseQuery } from '@tanstack/react-query'
import { entriesQueryOptions } from './journal.options'

export function useJournalQueries() {
  const { data: entries } = useSuspenseQuery(entriesQueryOptions())
  return { entries }
}
