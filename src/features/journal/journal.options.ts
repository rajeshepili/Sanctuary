import { queryOptions } from '@tanstack/react-query'
import { journalKeys } from './journal.keys'
import { getAllEntries, getDeletedEntries } from './journal.api'
import { withTimeout } from '#/lib/with-timeout'

export const entriesQueryOptions = () =>
  queryOptions({
    queryKey: journalKeys.entries,
    queryFn: () =>
      withTimeout(() => getAllEntries(), { name: 'getAllEntries' }),
  })

export const trashQueryOptions = () =>
  queryOptions({
    queryKey: journalKeys.trash,
    queryFn: () =>
      withTimeout(() => getDeletedEntries(), { name: 'getDeletedEntries' }),
  })
