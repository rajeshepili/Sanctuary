import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import { IconButton } from '#/components/ui/icon-button'
import {
  Image as ImageIcon,
  HelpCircle,
  Feather,
  Maximize2,
} from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'

import { AutoSaveIndicator } from './AutoSaveIndicator'
import type { DraftStatus } from '#/hooks/use-draft'
import { readFilesAsBase64 } from '#/utils/file'

import { JournalBubbleMenu } from './editor/JournalBubbleMenu'
import { JournalMarkdownGuide } from './editor/JournalMarkdownGuide'
import { JournalDraftBanner } from './editor/JournalDraftBanner'
import { JournalPendingMedia } from './editor/JournalPendingMedia'

interface JournalEditorProps {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  onSave: () => void
  pendingMedia?: { file: File; base64: string }[]
  setPendingMedia?: React.Dispatch<
    React.SetStateAction<{ file: File; base64: string }[]>
  >
  draftStatus?: DraftStatus
  draftError?: string | null
  retryDraftSave?: () => void
  copyDraft?: () => void
  isExpandedPage?: boolean
}

export function JournalEditor({
  value,
  setValue,
  onSave,
  pendingMedia = [],
  setPendingMedia,
  draftStatus,
  draftError,
  retryDraftSave,
  copyDraft,
  isExpandedPage = false,
}: JournalEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMounted = useRef(true)
  const [showMdGuide, setShowMdGuide] = useState(false)

  const isMac = navigator.platform.toLowerCase().includes('mac')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: 'Start writing… anything you want to remember.',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base prose-p:my-2 prose-headings:mb-3 prose-headings:mt-6 prose-hr:my-6 dark:prose-invert text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-code:text-primary prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary prose-li:text-foreground max-w-none focus:outline-none tiptap ${isExpandedPage ? 'prose-lg sm:prose-xl leading-relaxed min-h-[60vh] py-4' : 'leading-8 min-h-[220px] px-4 py-4 rounded-[1.4rem] border border-border/70 bg-background/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/20'}`,
      },
      handleKeyDown: (view, event) => {
        const ctrl = event.metaKey || event.ctrlKey
        if (ctrl && event.key === 'Enter') {
          event.preventDefault()
          if (view.state.doc.textContent.trim() || pendingMedia.length > 0)
            onSave()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: e }) => {
      setValue(e.getMarkdown())
    },
  })

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (value !== editor.getMarkdown()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !setPendingMedia) return

    const newMedia = await readFilesAsBase64(files)

    if (isMounted.current) {
      setPendingMedia((prev) => [...prev, ...newMedia])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeMedia = (index: number) => {
    setPendingMedia?.((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <div
        className={`
          transition-all duration-300 flex flex-col relative
          ${
            isExpandedPage
              ? 'flex-1'
              : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(15,23,42,0.04))] backdrop-blur-2xl hover:border-primary/20 p-5 sm:p-6 rounded-[1.75rem] border border-border/70 shadow-[0_24px_80px_rgba(15,23,42,0.14)] space-y-4'
          }
        `}
      >
        {!isExpandedPage && (
          <div className="flex items-center justify-end border-b border-border/20 pb-3">
            <IconButton asChild tooltip="Expand to dedicated page">
              <Link
                to="/write"
                className="p-1 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-foreground/8 w-6 h-6 shrink-0 flex items-center justify-center transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
            </IconButton>
          </div>
        )}

        <div
          className={`relative ${isExpandedPage ? 'flex-1 flex flex-col min-h-0 pt-16 sm:pt-20' : ''}`}
        >
          <JournalBubbleMenu editor={editor} />

          <EditorContent
            editor={editor}
            className={isExpandedPage ? 'flex-1 overflow-y-visible' : ''}
          />

          <AnimatePresence>
            {showMdGuide && (
              <JournalMarkdownGuide isExpandedPage={isExpandedPage} />
            )}
          </AnimatePresence>
        </div>

        {draftStatus === 'error' && (
          <JournalDraftBanner
            draftError={draftError}
            retryDraftSave={retryDraftSave}
            copyDraft={copyDraft}
          />
        )}

        <JournalPendingMedia media={pendingMedia} onRemove={removeMedia} />

        <div
          className={`flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between ${isExpandedPage ? 'mt-8' : 'border-t border-border/10 mt-4'}`}
        >
          <div className="flex items-center gap-1 relative">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mr-3">
              <Feather className="w-3.5 h-3.5" />
              {
                editor.getMarkdown().trim().split(/\s+/).filter(Boolean).length
              }{' '}
              words
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <IconButton
              tooltip="Attach image"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4" />
            </IconButton>

            <IconButton
              tooltip={
                showMdGuide ? 'Hide markdown guide' : 'Show markdown guide'
              }
              active={showMdGuide}
              onClick={() => setShowMdGuide((v) => !v)}
            >
              <HelpCircle className="w-4 h-4" />
            </IconButton>
          </div>

          {!isExpandedPage && (
            <div className="flex flex-col items-end gap-2">
              <AutoSaveIndicator
                status={draftStatus ?? 'idle'}
                error={draftError}
              />
              <Button
                onClick={() => onSave()}
                disabled={!value.trim() && pendingMedia.length === 0}
              >
                Save entry
                <Kbd className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-1 py-0 text-[10px]">
                  {isMac ? '⌘' : 'Ctrl'} ↵
                </Kbd>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
