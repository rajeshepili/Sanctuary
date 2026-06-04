import { useSuspenseQuery } from '@tanstack/react-query'
import { promptsQueryOptions } from './prompts.options'

export function usePromptsQueries() {
  const { data: prompts } = useSuspenseQuery(promptsQueryOptions())
  return { prompts }
}
