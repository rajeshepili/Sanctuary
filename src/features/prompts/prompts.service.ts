import { getDb } from '#/database'
import { customPrompts } from '#/database/schema'
import { eq, desc } from 'drizzle-orm'
import type {
  AddPromptInput,
  UpdatePromptInput,
  DeletePromptInput,
} from './prompts.schema'

export async function getActivePromptsService() {
  const db = await getDb()

  return db.query.customPrompts.findMany({
    orderBy: [desc(customPrompts.createdAt)],
  })
}

export async function addPromptService(data: AddPromptInput) {
  const db = await getDb()
  const [prompt] = await db
    .insert(customPrompts)
    .values({ text: data.text })
    .returning()
  return prompt
}

export async function updatePromptService(data: UpdatePromptInput) {
  const db = await getDb()
  const [prompt] = await db
    .update(customPrompts)
    .set({ text: data.text })
    .where(eq(customPrompts.id, data.id))
    .returning()
  return prompt
}

export async function deletePromptService(
  data: DeletePromptInput,
): Promise<void> {
  const db = await getDb()
  await db.delete(customPrompts).where(eq(customPrompts.id, data.id))
}
