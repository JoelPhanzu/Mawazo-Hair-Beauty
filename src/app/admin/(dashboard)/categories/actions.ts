'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  failure,
  optionalText,
  refresh,
  success,
  text,
  uniqueSlug,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

export type CategoryKind = 'prestations' | 'boutique'

const config = {
  prestations: {
    table: schema.serviceCategories,
    name: 'service_categories',
    tag: CACHE_TAGS.services,
  },
  boutique: {
    table: schema.productCategories,
    name: 'product_categories',
    tag: CACHE_TAGS.products,
  },
} as const

export async function saveCategory(
  kind: CategoryKind,
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const { table, name: tableName, tag } = config[kind]
  const name = text(fd, 'name')
  if (!name) return failure({ name: 'Indiquez un nom' })
  const values = { name, imageUrl: optionalText(fd, 'imageUrl') }

  const db = getDb()
  if (id) {
    const [before] = await db.select().from(table).where(eq(table.id, id))
    if (!before) return failure({}, 'Catégorie introuvable')
    const slug = before.name === name ? before.slug : await uniqueSlug(table, name, id)
    await db
      .update(table)
      .set({ ...values, slug })
      .where(eq(table.id, id))
    await audit(tableName, id, 'UPDATE', user.id, before, values)
    refresh([tag], '/admin/categories')
    return success()
  }

  const newId = crypto.randomUUID()
  await db.insert(table).values({
    ...values,
    id: newId,
    slug: await uniqueSlug(table, name),
    position: await nextPosition(table),
  })
  await audit(tableName, newId, 'INSERT', user.id, null, values)
  refresh([tag], '/admin/categories')
  return success('Catégorie créée', newId)
}

/** Les prestations / produits de la catégorie restent en ligne, simplement « sans catégorie ». */
export async function deleteCategory(kind: CategoryKind, id: string): Promise<ActionState> {
  const user = await requireUser()
  const { table, name: tableName, tag } = config[kind]
  const db = getDb()
  const [before] = await db.select().from(table).where(eq(table.id, id))
  await db.delete(table).where(eq(table.id, id))
  await audit(tableName, id, 'DELETE', user.id, before ?? null, null)
  refresh([tag], '/admin/categories')
  return success('Catégorie supprimée')
}

export async function moveCategory(
  kind: CategoryKind,
  id: string,
  direction: 'up' | 'down',
): Promise<void> {
  await requireUser()
  const { table, tag } = config[kind]
  if (await moveItem(table, id, direction)) refresh([tag])
}
