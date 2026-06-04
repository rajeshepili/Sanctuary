import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import type { Client } from '@libsql/client'
import * as schema from '#/database/schema'
import { applyTestSchemaAsync } from '#/test/apply-test-schema'

const clientByOrm = new WeakMap<LibSQLDatabase<typeof schema>, Client>()

let sharedTestDb: LibSQLDatabase<typeof schema> | null = null

/**
 * Creates an in-memory SQLite database for integration tests (libsql).
 */
export async function createTestDatabase(): Promise<
  LibSQLDatabase<typeof schema>
> {
  if (sharedTestDb) {
    return sharedTestDb
  }

  const client = createClient({ url: ':memory:' })
  await applyTestSchemaAsync((sql) => client.execute(sql))

  const orm = drizzle(client, { schema })
  clientByOrm.set(orm, client)
  sharedTestDb = orm
  return orm
}

/**
 * Resets the test database by clearing all tables
 */
export async function resetTestDatabase(
  db: LibSQLDatabase<typeof schema> | undefined,
) {
  if (!db) return

  const client = clientByOrm.get(db)
  if (!client) return

  await client.executeMultiple(`
    DELETE FROM habit_completions;
    DELETE FROM entry_media;
    DELETE FROM habits;
    DELETE FROM journal_entries;
    DELETE FROM custom_prompts;
    DELETE FROM user_preferences;
  `)
}
