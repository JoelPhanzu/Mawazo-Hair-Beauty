'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  jsonField,
  optionalInt,
  optionalText,
  refresh,
  success,
  text,
  uniqueSlug,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

const TAGS = [CACHE_TAGS.services]

export async function saveService(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}

  const name = text(fd, 'name')
  if (!name) errors.name = 'Indiquez le nom de la prestation'
  const priceAmount = optionalInt(fd, 'priceAmount')
  if (priceAmount === null || priceAmount < 0) errors.priceAmount = 'Indiquez un prix en FC'
  const durationMin = optionalInt(fd, 'durationMinMinutes')
  const durationMax = optionalInt(fd, 'durationMaxMinutes')
  if (durationMin !== null && durationMax !== null && durationMin > durationMax) {
    errors.durationMaxMinutes = 'La durée maximale doit être supérieure à la durée minimale'
  }
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    name,
    categoryId: optionalText(fd, 'categoryId'),
    shortDescription: optionalText(fd, 'shortDescription'),
    longDescription: optionalText(fd, 'longDescription'),
    durationMinMinutes: durationMin,
    durationMaxMinutes: durationMax,
    priceAmount: priceAmount!,
    currency: 'CDF' as const,
    priceIsFrom: checked(fd, 'priceIsFrom'),
    imageUrl: optionalText(fd, 'imageUrl'),
    gallery: jsonField<string[]>(fd, 'gallery', []),
    isPublished: checked(fd, 'isPublished'),
    isFeatured: checked(fd, 'isFeatured'),
  }

  const db = getDb()
  if (id) {
    const [before] = await db.select().from(schema.services).where(eq(schema.services.id, id))
    if (!before) return failure({}, 'Prestation introuvable')
    const slug = before.name === name ? before.slug : await uniqueSlug(schema.services, name, id)
    await db
      .update(schema.services)
      .set({ ...values, slug })
      .where(eq(schema.services.id, id))
    await audit('services', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/prestations')
    return success()
  }

  const newId = crypto.randomUUID()
  await db.insert(schema.services).values({
    ...values,
    id: newId,
    slug: await uniqueSlug(schema.services, name),
    position: await nextPosition(schema.services),
  })
  await audit('services', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/prestations')
  return success('Prestation créée', newId)
}

export async function deleteService(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.services).where(eq(schema.services.id, id))
  await db.delete(schema.services).where(eq(schema.services.id, id))
  await audit('services', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/prestations')
  return success('Prestation supprimée')
}

export async function moveService(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.services, id, direction)) refresh(TAGS)
}
