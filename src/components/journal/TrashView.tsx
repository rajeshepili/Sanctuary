import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RotateCcw, X, ChevronDown, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { trashQueryOptions } from '#/features/journal/journal.options'
import { useJournalMutations } from '#/features/journal/journal.mutations'
import { differenceInDays } from 'date-fns'
import { formatEntryDate } from '#/utils/journal'
import { Card } from '#/components/ui/card'
import { IconButton } from '#/components/ui/icon-button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '#/components/ui/alert-dialog'
import type { Entry } from '#/types'
import { TRASH_GRACE_DAYS } from '#/lib/constants'

export function TrashView() {
  const { data: deleted = [] } = useQuery(trashQueryOptions())
  const { restoreEntry, permanentDeleteEntry } = useJournalMutations()
  const [open, setOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  if (deleted.length === 0) return null

  const handleRestore = async (id: number) => {
    await restoreEntry(id)
  }

  const handlePermanentDelete = async (id: number) => {
    try {
      await permanentDeleteEntry(id)
    } finally {
      setConfirmDeleteId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-10"
    >
      {/* Collapsible header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-4 group cursor-pointer"
      >
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
          <Trash2 className="w-3.5 h-3.5" />
          <span>Recently Deleted</span>
          <span className="px-1.5 py-0.5 rounded-full bg-foreground/8 text-[10px]">
            {deleted.length}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground/50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="trash-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-3"
          >
            {/* Warning banner */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Deleted entries are kept for {TRASH_GRACE_DAYS} days. After that
                they are gone forever.
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {deleted.map((entry: Entry) => {
                const deletedAt = new Date(entry.deletedAt!)
                const daysLeft =
                  TRASH_GRACE_DAYS - differenceInDays(new Date(), deletedAt)
                const isUrgent = daysLeft <= 3

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card className="p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-md opacity-70 hover:opacity-100 transition-opacity group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                              Reflection
                            </span>
                            <span className="text-muted-foreground/30 text-[10px]">
                              ·
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {formatEntryDate(entry.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">
                            {entry.content}
                          </p>
                          <p
                            className={`text-[10px] mt-2 font-semibold ${isUrgent ? 'text-red-500' : 'text-muted-foreground/50'}`}
                          >
                            {daysLeft <= 0
                              ? 'Deleting soon…'
                              : `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconButton
                            tooltip="Restore entry"
                            onClick={() => handleRestore(entry.id)}
                            className="hover:text-emerald-500 hover:bg-emerald-500/10"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </IconButton>
                          <IconButton
                            tooltip="Delete forever"
                            variant="danger"
                            onClick={() => setConfirmDeleteId(entry.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(isOpen) => !isOpen && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This entry will be permanently
              removed from your sanctuary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmDeleteId && handlePermanentDelete(confirmDeleteId)
              }
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
