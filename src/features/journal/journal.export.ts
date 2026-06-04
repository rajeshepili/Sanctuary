import { getDb } from '#/database'
import { journalEntries } from '#/database/schema'
import { createServerFn } from '@tanstack/react-start'
import { desc, isNull } from 'drizzle-orm'
import { parseCommaList } from '#/utils/string'

async function getEntriesForExport() {
  const db = await getDb()
  return db.query.journalEntries.findMany({
    with: { media: true },
    where: isNull(journalEntries.deletedAt),
    orderBy: [desc(journalEntries.createdAt)],
  })
}

export const exportAllData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const allEntries = await getEntriesForExport()

    return {
      exportedAt: new Date().toISOString(),
      version: 1,
      entries: allEntries,
    }
  },
)

export const exportMarkdown = createServerFn({ method: 'GET' }).handler(
  async () => {
    const allEntries = await getEntriesForExport()

    let allMarkdown = ''

    for (const entry of allEntries) {
      const date = new Date(entry.createdAt)

      const parsedTags = parseCommaList(entry.tags)
      const tags =
        parsedTags.length > 0 ? parsedTags.map((t) => `"${t}"`).join(', ') : ''

      const attachmentsList =
        entry.media.length > 0
          ? '\n\n---\n\n## Memories Attached\n\n' +
            entry.media.map((m) => `- ![Memory](${m.filePath})`).join('\n')
          : ''

      const frontmatter = [
        '---',
        `date: "${date.toISOString()}"`,
        tags ? `tags: [${tags}]` : 'tags: []',
        `pinned: ${entry.isPinned}`,
        '---',
        '',
      ].join('\n')

      allMarkdown += frontmatter + entry.content + attachmentsList + '\n\n\n'
    }

    return { content: allMarkdown, count: allEntries.length }
  },
)
