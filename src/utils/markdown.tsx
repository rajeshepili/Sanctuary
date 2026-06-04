import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { Root, Text, Link } from 'mdast'
import { visit } from 'unist-util-visit'

interface MarkdownProps {
  content: string
  onTagClick?: (tag: string) => void
}

/**
 * Safe URL validation
 */
const isSafeUrl = (url?: string): boolean => {
  if (!url) return false

  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('mailto:') ||
    url.startsWith('hashtag://')
  )
}

/**
 * Remark plugin:
 * Converts hashtags in plain text nodes into markdown links
 *
 * Avoids:
 * - code blocks
 * - inline code
 * - headings
 * - existing links
 * - URLs
 */
function remarkHashtags() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number') return

      /**
       * Skip unsafe parent types
       */
      const excludedParents = [
        'link',
        'linkReference',
        'inlineCode',
        'code',
        'heading',
      ]

      if (excludedParents.includes(parent.type)) {
        return
      }

      const value = node.value

      /**
       * Matches:
       * #tag
       * #my-tag
       *
       * Avoids:
       * words#tag
       * urls#fragment
       */
      const regex = /(^|\s)(#[a-zA-Z0-9-]+\b)/g

      let match
      let lastIndex = 0

      const newNodes: any[] = []

      while ((match = regex.exec(value)) !== null) {
        const fullMatch = match[0]
        const hashtag = match[2]

        const start = match.index + fullMatch.indexOf(hashtag)

        /**
         * Push text before hashtag
         */
        if (start > lastIndex) {
          newNodes.push({
            type: 'text',
            value: value.slice(lastIndex, start),
          })
        }

        const tag = hashtag.slice(1)

        /**
         * Push hashtag link node
         */
        const linkNode: Link = {
          type: 'link',
          url: `hashtag://${tag}`,
          children: [
            {
              type: 'text',
              value: hashtag,
            },
          ],
        }

        newNodes.push(linkNode)

        lastIndex = start + hashtag.length
      }

      /**
       * Push remaining text
       */
      if (lastIndex < value.length) {
        newNodes.push({
          type: 'text',
          value: value.slice(lastIndex),
        })
      }

      /**
       * Replace only if hashtags were found
       */
      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes)

        return index + newNodes.length
      }

      return
    })
  }
}

export function MarkdownRenderer({ content, onTagClick }: MarkdownProps) {
  const components: Components = useMemo(
    () => ({
      a: ({ href, children, ...props }) => {
        /**
         * Internal hashtag action
         */
        if (href?.startsWith('hashtag://')) {
          const tag = href.replace('hashtag://', '')

          return (
            <button
              type="button"
              aria-label={`Filter by tag ${tag}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onTagClick?.(tag.toLowerCase())
              }}
              className="
              inline-flex
              items-center
              align-baseline
              px-1.5
              py-0.5
              rounded-md
              bg-primary/10
              text-primary
              hover:bg-primary/20
              transition-colors
              cursor-pointer
              font-semibold
              text-xs
              mx-0.5
            "
            >
              {children}
            </button>
          )
        }

        /**
         * Block unsafe links
         */
        if (!isSafeUrl(href)) {
          return <span className="text-muted-foreground">{children}</span>
        }

        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="
            text-primary
            hover:underline
            hover:text-primary/80
            transition-colors
            wrap-break-word
          "
            {...props}
          >
            {children}
          </a>
        )
      },

      p: ({ children }) => (
        <p className="mb-4 last:mb-0 leading-7">{children}</p>
      ),

      blockquote: ({ children }) => (
        <blockquote
          className="
          border-l-4
          border-primary/50
          pl-4
          py-1
          my-3
          italic
          text-muted-foreground
          bg-primary/5
          rounded-r-lg
        "
        >
          {children}
        </blockquote>
      ),

      h1: ({ children }) => (
        <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
      ),

      h2: ({ children }) => (
        <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
      ),

      h3: ({ children }) => (
        <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>
      ),

      code: ({ className, children, ...props }) => {
        const isInline = !className

        if (isInline) {
          return (
            <code
              className="
              px-1.5
              py-0.5
              bg-foreground/10
              text-foreground/80
              rounded
              font-mono
              text-[11px]
              border
              border-foreground/5
              wrap-break-word
            "
              {...props}
            >
              {children}
            </code>
          )
        }

        return (
          <pre
            className="
            p-4
            bg-foreground/5
            rounded-xl
            overflow-x-auto
            text-xs
            font-mono
            mb-4
            border
            border-border/40
          "
          >
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        )
      },

      ul: ({ children }) => (
        <ul
          className="
          ml-4
          list-disc
          marker:text-primary
          mb-4
          space-y-1
        "
        >
          {children}
        </ul>
      ),

      ol: ({ children }) => (
        <ol
          className="
          ml-4
          list-decimal
          marker:text-primary
          mb-4
          space-y-1
        "
        >
          {children}
        </ol>
      ),

      li: ({ children }) => <li className="leading-7">{children}</li>,

      hr: () => <hr className="my-6 border-t border-border/40" />,

      table: ({ children }) => (
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),

      th: ({ children }) => (
        <th
          className="
          border
          border-border/40
          bg-foreground/5
          px-3
          py-2
          text-left
          font-semibold
        "
        >
          {children}
        </th>
      ),

      td: ({ children }) => (
        <td
          className="
          border
          border-border/40
          px-3
          py-2
        "
        >
          {children}
        </td>
      ),
    }),
    [onTagClick],
  )

  const plugins = useMemo(() => [remarkGfm, remarkHashtags], [])

  return (
    <div
      className="
        prose
        prose-sm
        dark:prose-invert
        max-w-none
        text-foreground/90
        leading-relaxed
        marker:text-primary
      "
    >
      <ReactMarkdown remarkPlugins={plugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
