import { format } from 'date-fns'

export function formatEntryDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, h:mm a')
}

export function injectPromptIntoContent(
  currentContent: string,
  prompt: string,
): string {
  return currentContent.trim()
    ? `${currentContent}\n\n## ${prompt}\n\n`
    : `## ${prompt}\n\n`
}
