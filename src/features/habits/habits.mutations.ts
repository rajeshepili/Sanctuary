import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toastAsync } from '#/lib/toast-async'
import { toast } from 'sonner'
import { withOptimistic } from '#/lib/with-optimistic'
import type { HabitStatus } from '#/types'
import type { CreateHabitInput } from './habits.schema'
import { habitsCache } from './habits.cache'
import { habitsKeys } from './habits.keys'
import {
  createHabit as createHabitApi,
  deleteHabit as deleteHabitApi,
  updateHabitStatus as updateHabitStatusApi,
  toggleHabitCompletion as toggleHabitCompletionApi,
} from './habits.api'

export function useHabitsMutations() {
  const queryClient = useQueryClient()

  const createHabit = useCallback(
    (data: CreateHabitInput) =>
      toastAsync(
        async () => {
          const habit = await createHabitApi({ data })
          habitsCache.insertHabit(queryClient, habit)
          return habit
        },
        {
          loading: 'Establishing habit…',
          success: 'Habit created.',
          error: 'Failed.',
        },
      ),
    [queryClient],
  )

  const updateHabitStatus = useCallback(
    (id: number, status: HabitStatus) =>
      toastAsync(
        () =>
          withOptimistic(
            {
              snapshot: (qc) => habitsCache.snapshot(qc),
              apply: (qc) => habitsCache.patchHabitStatus(qc, id, status),
              execute: () => {
                const restUntilDate = new Date()
                restUntilDate.setDate(restUntilDate.getDate() + 7)
                const restUntil = status === 'resting' ? restUntilDate : null
                return updateHabitStatusApi({ data: { id, status, restUntil } })
              },
              restore: (qc, snap) => habitsCache.restore(qc, snap),
            },
            queryClient,
          ).then((res) => {
            queryClient.invalidateQueries({ queryKey: habitsKeys.all })
            return res
          }),
        {
          loading: 'Updating habit…',
          success:
            status === 'resting'
              ? 'Habit resting for 7 days.'
              : 'Habit awakened.',
          error: 'Failed.',
        },
      ),
    [queryClient],
  )

  const deleteHabit = useCallback(
    (id: number) =>
      toastAsync(
        async () => {
          await deleteHabitApi({ data: { id } })
          habitsCache.removeHabit(queryClient, id)
        },
        {
          loading: 'Removing habit…',
          success: 'Habit removed.',
          error: 'Failed.',
        },
      ),
    [queryClient],
  )

  const toggleCompletion = useCallback(
    async (habitId: number, date: string) => {
      try {
        const res = await withOptimistic(
          {
            snapshot: (qc) => habitsCache.snapshot(qc),
            apply: (qc) => habitsCache.toggleCompletion(qc, habitId, date),
            execute: () =>
              toggleHabitCompletionApi({ data: { habitId, date } }),
            restore: (qc, snap) => habitsCache.restore(qc, snap),
          },
          queryClient,
        )
        queryClient.invalidateQueries({ queryKey: habitsKeys.all })
        return res
      } catch (error) {
        toast.error('Failed to update habit completion')
        throw error
      }
    },
    [queryClient],
  )

  return { createHabit, updateHabitStatus, deleteHabit, toggleCompletion }
}
