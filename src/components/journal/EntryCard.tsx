import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '#/components/ui/card'
import { Pin, Maximize2, Edit3, Trash2 } from 'lucide-react'
import { formatEntryDate } from '#/utils/journal'
import { IconButton } from '#/components/ui/icon-button'
import { MarkdownRenderer } from '#/utils/markdown'
import { MediaGrid } from '#/components/journal/MediaGrid'
import { EntryEditForm } from '#/components/journal/EntryEditForm'
import type { Entry, EntryMedia } from '#/types'

interface EntryCardProps {
  entry: Entry
  onDelete: (id: number) => Promise<void>
  onUpdate: (
    id: number,
    content: string,
    addedMedia?: { file: File; base64: string }[],
    removedMediaIds?: number[],
  ) => Promise<Omit<Entry, 'media'>>
  onTogglePin: (id: number) => Promise<Omit<Entry, 'media'>>
  onReadEntry: (id: number) => void
  onTagClick: (tag: string) => void
}

export const EntryCard = memo(
  function EntryCardComponent({
    entry,
    onDelete,
    onUpdate,
    onTogglePin,
    onReadEntry,
    onTagClick,
  }: EntryCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState('')
    const [editPendingMedia, setEditPendingMedia] = useState<
      { file: File; base64: string }[]
    >([])
    const [editRemovedMediaIds, setEditRemovedMediaIds] = useState<number[]>([])

    const isPinned = entry.isPinned

    const startEdit = () => {
      setIsEditing(true)
      setEditContent(entry.content)
      setEditPendingMedia([])
      setEditRemovedMediaIds([])
    }

    const cancelEdit = () => setIsEditing(false)

    const handleSaveEdit = async () => {
      await onUpdate(
        entry.id,
        editContent.trim(),
        editPendingMedia,
        editRemovedMediaIds,
      )
      setIsEditing(false)
    }

    const isSaveDisabled =
      !editContent.trim() &&
      entry.media.filter((m: EntryMedia) => !editRemovedMediaIds.includes(m.id))
        .length === 0 &&
      editPendingMedia.length === 0

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            className={`
            p-5 rounded-xl border border-border/70
            bg-card/90 backdrop-blur-md shadow-xs
            transition-all duration-500 relative group overflow-hidden
            ${isPinned ? 'ring-1 ring-amber-500/30' : ''}
          `}
            style={{
              boxShadow: isPinned
                ? `0 10px 30px -15px var(--primary), 0 0 0 1px var(--primary)`
                : undefined,
              borderColor: isPinned ? 'var(--primary)' : undefined,
            }}
          >
            {/* Top metadata bar */}
            <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground/85 font-medium">
              <div className="flex items-center gap-2">
                <span className="capitalize font-semibold">Reflection</span>
                {isPinned && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold tracking-wide uppercase">
                    <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                  </span>
                )}
                <span className="text-muted-foreground/40">•</span>
                <span>{formatEntryDate(entry.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Pin / Unpin */}
                <IconButton
                  tooltip={isPinned ? 'Unpin entry' : 'Pin to top'}
                  onClick={() => onTogglePin(entry.id)}
                  className={
                    isPinned
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-amber-500 hover:bg-amber-500/10'
                  }
                >
                  <Pin
                    className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`}
                  />
                </IconButton>

                {/* Expand / Read full entry */}
                <IconButton
                  tooltip="Read full reflection"
                  onClick={() => onReadEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </IconButton>

                {/* Edit entry */}
                {!isEditing && (
                  <IconButton
                    tooltip="Edit entry"
                    onClick={startEdit}
                    className="opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </IconButton>
                )}

                <IconButton
                  tooltip="Delete entry"
                  variant="danger"
                  onClick={() => onDelete(entry.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </IconButton>
              </div>
            </div>

            {/* Inline edit vs read view */}
            {isEditing ? (
              <EntryEditForm
                content={editContent}
                onContentChange={setEditContent}
                existingMedia={entry.media}
                pendingMedia={editPendingMedia}
                removedMediaIds={editRemovedMediaIds}
                onAddMedia={(items) =>
                  setEditPendingMedia((prev) => [...prev, ...items])
                }
                onRemovePending={(idx) =>
                  setEditPendingMedia((prev) =>
                    prev.filter((_, i) => i !== idx),
                  )
                }
                onRemoveExisting={(id) =>
                  setEditRemovedMediaIds((prev) => [...prev, id])
                }
                onSave={handleSaveEdit}
                onCancel={cancelEdit}
                isSaveDisabled={isSaveDisabled}
              />
            ) : (
              <>
                <div
                  className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap line-clamp-6 cursor-pointer group-hover:text-foreground transition-colors"
                  onClick={() => onReadEntry(entry.id)}
                  title="Click to read full reflection"
                >
                  <MarkdownRenderer
                    content={entry.content}
                    onTagClick={onTagClick}
                  />
                </div>

                {(entry.content.split('\n').length > 6 ||
                  entry.content.length > 300) && (
                  <div
                    className="mt-2 text-xs font-semibold text-primary/70 hover:text-primary cursor-pointer transition-colors w-fit"
                    onClick={() => onReadEntry(entry.id)}
                  >
                    Read full reflection
                  </div>
                )}

                <MediaGrid media={entry.media} />
              </>
            )}
          </Card>
        </motion.div>
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.entry === nextProps.entry &&
      prevProps.onReadEntry === nextProps.onReadEntry &&
      prevProps.onTagClick === nextProps.onTagClick
    )
  },
)
