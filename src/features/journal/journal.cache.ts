import type { QueryClient } from '@tanstack/react-query'
import type { Entry } from '#/types'
import { journalKeys } from './journal.keys'

/**
 * Low-level cache operations for journal entries.
 * Used by mutations for optimistic updates and rollbacks.
 */
export const journalCache = {
  /** Snapshot the current list for rollback */
  snapshot(queryClient: QueryClient): Entry[] | undefined {
    return queryClient.getQueryData<Entry[]>(journalKeys.entries)
  },

  /** Restore a previously snapshotted list */
  restore(queryClient: QueryClient, snapshot: Entry[] | undefined) {
    queryClient.setQueryData(journalKeys.entries, snapshot)
  },

  /** Prepend a new entry to the cached list */
  insert(queryClient: QueryClient, entry: Entry) {
    queryClient.setQueryData<Entry[]>(journalKeys.entries, (old) =>
      old ? [entry, ...old] : [entry],
    )
  },

  /** Remove an entry from the cached list by id */
  remove(queryClient: QueryClient, id: number) {
    queryClient.setQueryData<Entry[]>(journalKeys.entries, (old) =>
      old?.filter((e) => e.id !== id),
    )
  },

  /** Patch specific fields on a cached entry */
  update(queryClient: QueryClient, id: number, patch: Partial<Entry>) {
    queryClient.setQueryData<Entry[]>(journalKeys.entries, (old) =>
      old?.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    )
  },

  /** Toggle the isPinned flag and re-sort (pinned first) */
  togglePin(queryClient: QueryClient, id: number) {
    queryClient.setQueryData<Entry[]>(journalKeys.entries, (old) => {
      if (!old) return old
      const updated = old.map((e) =>
        e.id === id ? { ...e, isPinned: !e.isPinned } : e,
      )
      return [...updated].sort(
        (a, b) => Number(b.isPinned) - Number(a.isPinned),
      )
    })
  },

  /** Optimistically move an entry to the trash cache on soft-delete */
  moveToTrash(queryClient: QueryClient, entry: Entry) {
    const trashed: Entry = { ...entry, deletedAt: new Date() }
    queryClient.setQueryData<Entry[]>(journalKeys.trash, (old) =>
      old ? [trashed, ...old] : [trashed],
    )
  },

  /** Remove an entry from the trash cache (on restore or permanent delete) */
  removeFromTrash(queryClient: QueryClient, id: number) {
    queryClient.setQueryData<Entry[]>(journalKeys.trash, (old) =>
      old?.filter((e) => e.id !== id),
    )
  },

  /** Move a trashed entry back into the live entries cache on restore */
  restoreFromTrash(queryClient: QueryClient, id: number) {
    const trash = queryClient.getQueryData<Entry[]>(journalKeys.trash)
    const restored = trash?.find((e) => e.id === id)
    if (restored) {
      const live: Entry = { ...restored, deletedAt: null }
      queryClient.setQueryData<Entry[]>(journalKeys.entries, (old) => {
        const list = old ? [live, ...old] : [live]
        return [...list].sort((a, b) => {
          if (a.isPinned !== b.isPinned)
            return Number(b.isPinned) - Number(a.isPinned)
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        })
      })
      journalCache.removeFromTrash(queryClient, id)
    }
  },

  /** Invalidate all journal queries (entries + trash) to force a fresh fetch */
  invalidateAll(queryClient: QueryClient) {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: journalKeys.entries }),
      queryClient.invalidateQueries({ queryKey: journalKeys.trash }),
    ])
  },
}
