'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  optionalText,
  refresh,
  success,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

const TAGS = [CACHE_TAGS.gallery]

export async function saveGalleryItem(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const afterImageUrl = optionalText(fd, 'afterImageUrl')
  if (!afterImageUrl) return failure({ afterImageUrl: 'Ajoutez au moins la photo « après »' })

  const values = {
    title: optionalText(fd, 'title'),
    caption: optionalText(fd, 'caption'),
    beforeImageUrl: optionalText(fd, 'beforeImageUrl'),
    afterImageUrl,
    serviceId: optionalText(fd, 'serviceId'),
    isPublished: checked(fd, 'isPublished'),
    isFeatured: checked(fd, 'isFeatured'),
  }

  const db = getDb()
  if (id) {
    const [before] = await db
      .select()
      .from(schema.galleryItems)
      .where(eq(schema.galleryItems.id, id))
    await db.update(schema.galleryItems).set(values).where(eq(schema.galleryItems.id, id))
    await audit('gallery_items', id, 'UPDATE', user.id, before ?? null, values)
    refresh(TAGS, '/admin/galerie')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.galleryItems)
    .values({ ...values, id: newId, position: await nextPosition(schema.galleryItems) })
  await audit('gallery_items', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/galerie')
  return success('Réalisation ajoutée', newId)
}

export async function deleteGalleryItem(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.galleryItems).where(eq(schema.galleryItems.id, id))
  await db.delete(schema.galleryItems).where(eq(schema.galleryItems.id, id))
  await audit('gallery_items', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/galerie')
  return success('Réalisation supprimée')
}

export async function moveGalleryItem(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.galleryItems, id, direction)) refresh(TAGS)
}
