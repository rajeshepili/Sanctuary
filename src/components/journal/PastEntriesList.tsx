import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, History, Search, Tag, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { IconButton } from '#/components/ui/icon-button'
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '#/components/ui/empty'
import type { Entry } from '#/types'
import {
  useState,
  useMemo,
  useDeferredValue,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { format } from 'date-fns'
import { MarkdownRenderer } from '#/utils/markdown'
import { MediaGrid } from '#/components/journal/MediaGrid'
import { EntryCard } from '#/components/journal/EntryCard'
import { useKeyboardShortcut } from '#/hooks/use-keyboard-shortcut'
import { parseCommaList } from '#/utils/string'

interface PastEntriesListProps {
  entries: Entry[]
  onDelete: (id: number) => Promise<void>
  onUpdate: (
    id: number,
    content: string,
    addedMedia?: { file: File; base64: string }[],
    removedMediaIds?: number[],
  ) => Promise<Omit<Entry, 'media'>>
  onTogglePin: (id: number) => Promise<Omit<Entry, 'media'>>
}

export function PastEntriesList({
  entries,
  onDelete,
  onUpdate,
  onTogglePin,
}: PastEntriesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [readingId, setReadingId] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(15)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (intersectionEntries) => {
        if (intersectionEntries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 15)
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setVisibleCount(15)
  }, [deferredSearchQuery, selectedTag])

  useKeyboardShortcut('Escape', () => {
    if (readingId !== null) setReadingId(null)
  })

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag(tag)
  }, [])

  const handleReadEntry = useCallback((id: number) => {
    setReadingId(id)
  }, [])

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    entries.forEach((entry) => {
      parseCommaList(entry.tags).forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet)
  }, [entries])

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Tag filter
      if (selectedTag) {
        const tagsList = parseCommaList(entry.tags)
        if (!tagsList.includes(selectedTag)) return false
      }

      // 2. Search query filter
      if (deferredSearchQuery.trim()) {
        const query = deferredSearchQuery.toLowerCase().trim()
        const contentMatch = entry.content.toLowerCase().includes(query)
        const tagsMatch = entry.tags
          ? entry.tags.toLowerCase().includes(query)
          : false

        const dateStr = new Date(entry.createdAt)
          .toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          .toLowerCase()
        const dateMatch = dateStr.includes(query)

        if (!contentMatch && !tagsMatch && !dateMatch) return false
      }

      return true
    })
  }, [entries, selectedTag, deferredSearchQuery])

  const readingEntry =
    readingId !== null
      ? (entries.find((e) => e.id === readingId) ?? null)
      : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Search and Filters panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <History className="w-3.5 h-3.5" />
            <span>Past Reflections</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredEntries.length} reflection
            {filteredEntries.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search reflections, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-9 pr-8 py-2 rounded-xl text-sm
                border border-border/40 bg-card/60 backdrop-blur-md
                text-foreground placeholder:text-muted-foreground/75
                focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40
                transition-all duration-300
              "
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <IconButton
                  tooltip="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-3 h-3" />
                </IconButton>
              </div>
            )}
          </div>

          {/* Tag Pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center pt-1">
              <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" /> Filters:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTag(selectedTag === tag ? null : tag)
                  }
                  className={`
                    px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide
                    transition-all duration-300 cursor-pointer
                    ${
                      selectedTag === tag
                        ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                        : 'bg-card/40 border border-border/40 text-muted-foreground hover:bg-card/75 hover:text-foreground'
                    }
                  `}
                >
                  #{tag}
                </button>
              ))}
              {selectedTag && (
                <IconButton
                  tooltip="Clear tag filter"
                  onClick={() => setSelectedTag(null)}
                  className="p-1 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </IconButton>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="sync">
          {filteredEntries.slice(0, visibleCount).map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onTogglePin={onTogglePin}
              onReadEntry={handleReadEntry}
              onTagClick={handleTagClick}
            />
          ))}
        </AnimatePresence>

        {filteredEntries.length > visibleCount && (
          <div
            ref={observerTarget}
            className="h-10 w-full flex items-center justify-center"
          >
            <span className="text-xs text-muted-foreground/50 animate-pulse">
              Loading more reflections...
            </span>
          </div>
        )}

        {filteredEntries.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Empty className="py-16 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen className="w-12 h-12 text-accent-foreground/80" />
                </EmptyMedia>
                <EmptyTitle>
                  {entries.length === 0
                    ? 'Your private sanctuary is currently empty.'
                    : 'No reflections match your current filters.'}
                </EmptyTitle>
                <EmptyDescription>
                  {entries.length === 0
                    ? 'Write reflections in the card above to begin your journal.'
                    : 'Try adjusting your search keywords or active tags.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </motion.div>
        )}
      </div>

      {/* Reading Dialog */}
      <Dialog
        open={readingId !== null}
        onOpenChange={(open) => !open && setReadingId(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/70 rounded-2xl p-8 shadow-2xl">
          {readingEntry && (
            <div className="space-y-8">
              <DialogHeader className="text-left space-y-4">
                <DialogTitle className="flex items-center gap-3 text-sm font-semibold tracking-wider uppercase text-muted-foreground">
                  Reflection
                  <span className="text-muted-foreground/40">•</span>
                  {format(readingEntry.createdAt, 'EEEE, MMMM d, yyyy')} at{' '}
                  {format(readingEntry.createdAt, 'h:mm a')}
                </DialogTitle>
              </DialogHeader>

              <div className="text-base text-foreground/95 leading-relaxed whitespace-pre-wrap font-medium">
                <MarkdownRenderer
                  content={readingEntry.content}
                  onTagClick={(tag) => {
                    setReadingId(null)
                    setSelectedTag(tag)
                  }}
                />
              </div>

              <MediaGrid media={readingEntry.media} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
