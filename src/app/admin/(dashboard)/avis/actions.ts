'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  optionalInt,
  optionalText,
  refresh,
  success,
  text,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

const TAGS = [CACHE_TAGS.testimonials]

export async function saveTestimonial(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const displayName = text(fd, 'displayName')
  if (!displayName) errors.displayName = 'Indiquez le prénom et l’initiale (ex. Nadège K.)'
  const body = text(fd, 'body')
  if (!body) errors.body = 'Indiquez le texte de l’avis'
  const rating = optionalInt(fd, 'rating')
  if (rating !== null && (rating < 1 || rating > 5)) errors.rating = 'Note entre 1 et 5'
  const consentObtained = checked(fd, 'consentObtained')
  const isPublished = checked(fd, 'isPublished')
  if (isPublished && !consentObtained) {
    errors.consentObtained = 'Un avis ne peut être publié qu’avec l’accord de la cliente'
  }
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    displayName,
    body,
    rating,
    serviceId: optionalText(fd, 'serviceId'),
    consentObtained,
    isPublished,
  }
  const db = getDb()
  if (id) {
    const [before] = await db
      .select()
      .from(schema.testimonials)
      .where(eq(schema.testimonials.id, id))
    await db.update(schema.testimonials).set(values).where(eq(schema.testimonials.id, id))
    await audit('testimonials', id, 'UPDATE', user.id, before ?? null, values)
    refresh(TAGS, '/admin/avis')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.testimonials)
    .values({ ...values, id: newId, position: await nextPosition(schema.testimonials) })
  await audit('testimonials', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/avis')
  return success('Avis ajouté', newId)
}

export async function deleteTestimonial(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.testimonials).where(eq(schema.testimonials.id, id))
  await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id))
  await audit('testimonials', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/avis')
  return success('Avis supprimé')
}

export async function moveTestimonial(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.testimonials, id, direction)) refresh(TAGS)
}
