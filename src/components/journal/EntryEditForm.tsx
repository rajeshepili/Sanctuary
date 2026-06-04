import React, { useRef } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { IconButton } from '#/components/ui/icon-button'
import { MediaImage } from '#/components/journal/MediaImage'
import { readFilesAsBase64 } from '#/utils/file'
import type { EntryMedia } from '#/types'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { JournalBubbleMenu } from './editor/JournalBubbleMenu'
import { Button } from '#/components/ui/button'

interface EntryEditFormProps {
  content: string
  onContentChange: (v: string) => void
  existingMedia: EntryMedia[]
  pendingMedia: { file: File; base64: string }[]
  removedMediaIds: number[]
  onAddMedia: (items: { file: File; base64: string }[]) => void
  onRemovePending: (index: number) => void
  onRemoveExisting: (id: number) => void
  onSave: () => void
  onCancel: () => void
  isSaveDisabled: boolean
}

export function EntryEditForm({
  content,
  onContentChange,
  existingMedia,
  pendingMedia,
  removedMediaIds,
  onAddMedia,
  onRemovePending,
  onRemoveExisting,
  onSave,
  onCancel,
  isSaveDisabled,
}: EntryEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const results = await readFilesAsBase64(files)
    onAddMedia(results)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const visibleExisting = existingMedia.filter(
    (m) => !removedMediaIds.includes(m.id),
  )
  const hasMedia = visibleExisting.length > 0 || pendingMedia.length > 0

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: 'Reflect on this moment…',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base prose-p:my-2 prose-headings:mb-3 prose-headings:mt-6 prose-hr:my-6 dark:prose-invert text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-code:text-primary prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary prose-li:text-foreground max-w-none focus:outline-none tiptap leading-8 min-h-[120px] px-4 py-4 rounded-xl border border-border/80 bg-background/50 focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/40`,
      },
      handleKeyDown: (_view, event) => {
        const ctrl = event.metaKey || event.ctrlKey
        if (ctrl && event.key === 'Enter') {
          event.preventDefault()
          if (!isSaveDisabled) onSave()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: e }) => {
      onContentChange(e.getMarkdown())
    },
  })

  return (
    <div className="space-y-4 pt-1">
      <div className="relative">
        <JournalBubbleMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {hasMedia && (
        <div className="flex flex-wrap gap-2">
          {visibleExisting.map((m) => (
            <div
              key={m.id}
              className="relative group w-16 h-16 rounded overflow-hidden border border-border/50"
            >
              <MediaImage mediaId={m.id} />
              <IconButton
                tooltip="Remove image"
                onClick={() => onRemoveExisting(m.id)}
                className="absolute top-0.5 right-0.5 p-0.5 w-5 h-5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </IconButton>
            </div>
          ))}
          {pendingMedia.map((media, idx) => (
            <div
              key={`pending-${idx}`}
              className="relative group w-16 h-16 rounded overflow-hidden border border-border/50"
            >
              <img
                src={media.base64}
                className="w-full h-full object-cover"
                alt="Pending attachment"
              />
              <IconButton
                tooltip="Remove image"
                onClick={() => onRemovePending(idx)}
                className="absolute top-0.5 right-0.5 p-0.5 w-5 h-5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-4 text-muted-foreground font-semibold">
          <span>
            {content.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <IconButton
            tooltip="Attach image"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="flex gap-2">
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaveDisabled} size="sm">
            Save Changes
          </Button>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  )
}
