'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb, schema } from '@/db'
import { BOOKING_STATUSES } from '@/db/schema'
import { audit, failure, optionalText, success, text, type ActionState } from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { normalizeCongoPhone } from '@/lib/phone'
import { generateReference } from '@/lib/reference'

type Status = (typeof BOOKING_STATUSES)[number]

export async function setBookingStatus(id: string, status: Status): Promise<ActionState> {
  const user = await requireUser()
  if (!BOOKING_STATUSES.includes(status)) return failure({}, 'Statut inconnu')
  const db = getDb()
  const [before] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id))
  if (!before) return failure({}, 'Réservation introuvable')
  await db.update(schema.bookings).set({ status }).where(eq(schema.bookings.id, id))
  await audit('bookings', id, 'UPDATE', user.id, { status: before.status }, { status })
  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return success(`Réservation ${status}`)
}

export async function saveBooking(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}

  const customerName = text(fd, 'customerName')
  if (!customerName) errors.customerName = 'Indiquez le nom de la cliente'
  const customerPhone = normalizeCongoPhone(text(fd, 'customerPhone'))
  if (!customerPhone) errors.customerPhone = 'Numéro invalide'
  const requestedDate = text(fd, 'requestedDate')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) errors.requestedDate = 'Choisissez une date'
  const requestedTime = text(fd, 'requestedTime')
  if (!/^\d{2}:\d{2}$/.test(requestedTime)) errors.requestedTime = 'Choisissez une heure'

  const db = getDb()
  const serviceId = optionalText(fd, 'serviceId')
  const [service] = serviceId
    ? await db.select().from(schema.services).where(eq(schema.services.id, serviceId))
    : []
  if (!service) errors.serviceId = 'Choisissez une prestation'
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    customerName,
    customerPhone: customerPhone!,
    serviceId: service.id,
    serviceName: service.name,
    requestedDate,
    requestedTime,
    message: optionalText(fd, 'message'),
    internalNote: optionalText(fd, 'internalNote'),
  }

  if (id) {
    const [before] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id))
    await db.update(schema.bookings).set(values).where(eq(schema.bookings.id, id))
    await audit('bookings', id, 'UPDATE', user.id, before ?? null, values)
    revalidatePath('/admin/reservations')
    return success()
  }

  const newId = crypto.randomUUID()
  await db.insert(schema.bookings).values({
    ...values,
    id: newId,
    reference: generateReference('R'),
    source: (text(fd, 'source') === 'whatsapp' ? 'whatsapp' : 'manuelle') as
      'whatsapp' | 'manuelle',
    status: 'confirmée',
  })
  await audit('bookings', newId, 'INSERT', user.id, null, values)
  revalidatePath('/admin/reservations')
  return success('Rendez-vous enregistré', newId)
}
