import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useDraft } from '#/hooks/use-draft'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { useKeyboardShortcut } from '#/hooks/use-keyboard-shortcut'

export function useJournalEntryState(onSaveSuccess?: () => void) {
  const [value, setValue] = useState('')
  const [pendingMedia, setPendingMedia] = useState<
    { file: File; base64: string }[]
  >([])

  const { createEntry } = useJournalMutations()

  const {
    status: draftStatus,
    error: draftError,
    retrySave,
    clearDraft,
  } = useDraft({
    key: 'journal-entry',
    value,
    onRestore: setValue,
    debounceMs: 400,
  })

  const handleRetryDraftSave = useCallback(() => {
    retrySave()
  }, [retrySave])

  const handleCopyDraft = useCallback(async () => {
    if (!value.trim()) return

    try {
      await navigator.clipboard.writeText(value)
      toast.success('Draft copied to clipboard.')
    } catch {
      toast.error('Could not copy draft.')
    }
  }, [value])

  const handleSave = useCallback(() => {
    if (!value.trim() && pendingMedia.length === 0) return

    return createEntry(value, pendingMedia).then(() => {
      setValue('')
      setPendingMedia([])
      clearDraft()
      onSaveSuccess?.()
    })
  }, [value, pendingMedia, createEntry, clearDraft, onSaveSuccess])

  useKeyboardShortcut(
    'Enter',
    () => {
      handleSave()
    },
    { mod: true, preventDefault: true },
  )

  return {
    value,
    setValue,
    pendingMedia,
    setPendingMedia,
    draftStatus,
    draftError,
    handleRetryDraftSave,
    handleCopyDraft,
    handleSave,
  }
}
