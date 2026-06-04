import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import { AutoSaveIndicator } from '#/components/journal/AutoSaveIndicator'
import { JournalEditor } from '#/components/journal/JournalEditor'
import { useJournalEntryState } from '#/hooks/use-journal-entry-state'
import { useKeyboardShortcut } from '#/hooks/use-keyboard-shortcut'

export const Route = createFileRoute('/__app/write')({
  head: () => ({ meta: [{ title: 'Write — Sanctuary' }] }),
  component: WritePage,
})

function WritePage() {
  const navigate = useNavigate()

  const {
    value,
    setValue,
    pendingMedia,
    setPendingMedia,
    draftStatus,
    draftError,
    handleRetryDraftSave,
    handleCopyDraft,
    handleSave,
  } = useJournalEntryState(() => navigate({ to: '/' }))

  useKeyboardShortcut('Escape', () => navigate({ to: '/' }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 overflow-y-auto bg-background/90 backdrop-blur-3xl"
    >
      {/* Full-screen atmospheric blurred background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Top Left Navigation */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-20">
        <button
          onClick={() => {
            if (window.history.length > 2) {
              window.history.back()
            } else {
              navigate({ to: '/' })
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-foreground/5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-20 flex items-center gap-4">
        <AutoSaveIndicator status={draftStatus} error={draftError} />
        <Button
          onClick={() => handleSave()}
          disabled={!value.trim() && pendingMedia.length === 0}
        >
          Save entry
          <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">
            {typeof navigator !== 'undefined' &&
            ((navigator as any).userAgentData?.platform ?? navigator.platform)
              .toLowerCase()
              .includes('mac')
              ? '⌘'
              : 'Ctrl'}
            ↵
          </Kbd>
        </Button>
      </div>

      <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-4 sm:px-8 py-24 sm:py-32 space-y-6">
        <JournalEditor
          value={value}
          setValue={setValue}
          onSave={handleSave}
          pendingMedia={pendingMedia}
          setPendingMedia={setPendingMedia}
          draftStatus={draftStatus}
          draftError={draftError}
          retryDraftSave={handleRetryDraftSave}
          copyDraft={handleCopyDraft}
          isExpandedPage={true}
        />
      </div>
    </motion.div>
  )
}
