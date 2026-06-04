import { getDb } from '#/database'
import { userPreferences } from '#/database/schema'
import { eq } from 'drizzle-orm'

export async function getPreferencesService() {
  const db = await getDb()
  const results = await db.select().from(userPreferences).limit(1)

  if (results.length === 0) {
    throw new Error(
      'User preferences not found. The database may not have seeded correctly.',
    )
  }

  return results[0]
}

export async function updatePreferencesService(
  data: typeof userPreferences.$inferInsert,
) {
  const db = await getDb()
  const results = await db.select().from(userPreferences).limit(1)

  if (results.length === 0) {
    throw new Error(
      'User preferences not found. The database may not have seeded correctly.',
    )
  }

  const prefs = results[0]

  const updateData = { ...data }

  /** Immutable field: set onboardedAt exactly once upon initial disclaimer agreement. */
  if (data.disclaimerAgreed && !prefs.onboardedAt) {
    updateData.onboardedAt = new Date()
  }

  const [updated] = await db
    .update(userPreferences)
    .set(updateData)
    .where(eq(userPreferences.id, prefs.id))
    .returning()

  return updated
}
