'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import type { PaymentNumber, SocialLinks } from '@/db/schema'
import {
  audit,
  failure,
  jsonField,
  optionalInt,
  optionalText,
  refresh,
  success,
  text,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'
import { normalizeCongoPhone } from '@/lib/phone'

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const SOCIALS = ['instagram', 'facebook', 'tiktok', 'youtube', 'snapchat'] as const

const url = z.url({ message: 'Lien invalide (doit commencer par https://)' })

export async function saveSettings(_state: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}

  const businessName = text(fd, 'businessName')
  if (!businessName) errors.businessName = 'Indiquez le nom du salon'

  const whatsapp = normalizeCongoPhone(text(fd, 'whatsappNumber'))
  if (!whatsapp) errors.whatsappNumber = 'Numéro WhatsApp invalide (ex. 0850 871 455)'

  const phoneRaw = text(fd, 'phone')
  const phone = phoneRaw ? normalizeCongoPhone(phoneRaw) : null
  if (phoneRaw && !phone) errors.phone = 'Numéro invalide'

  const emails = jsonField<string[]>(fd, 'emails', [])
  if (emails.some((e) => !z.email().safeParse(e).success))
    errors.emails = 'Une adresse e-mail est invalide'

  const googleMapsUrl = optionalText(fd, 'googleMapsUrl')
  if (googleMapsUrl && !url.safeParse(googleMapsUrl).success) errors.googleMapsUrl = 'Lien invalide'

  const socialLinks: SocialLinks = {}
  for (const key of SOCIALS) {
    const value = optionalText(fd, `social_${key}`)
    if (value && !url.safeParse(value).success)
      errors[`social_${key}`] = 'Lien invalide (https://…)'
    socialLinks[key] = value
  }

  const paymentNumbers = jsonField<PaymentNumber[]>(fd, 'paymentNumbers', [])
    .map((p) => ({ provider: p.provider.trim(), number: p.number.trim(), holder: p.holder.trim() }))
    .filter((p) => p.provider || p.number)
  if (paymentNumbers.some((p) => !p.provider || !p.number)) {
    errors.paymentNumbers = 'Indiquez l’opérateur et le numéro sur chaque ligne'
  }

  const usdToCdfRate = optionalInt(fd, 'usdToCdfRate')
  if (usdToCdfRate !== null && usdToCdfRate <= 0) errors.usdToCdfRate = 'Taux invalide'

  if (Object.keys(errors).length) return failure(errors)

  const values = {
    businessName,
    tagline: optionalText(fd, 'tagline'),
    phone,
    whatsappNumber: whatsapp!.replace('+', ''),
    emails,
    address: optionalText(fd, 'address'),
    googleMapsUrl,
    openingHours: Object.fromEntries(
      DAYS.map((d) => [d, text(fd, `hours_${d}`)]).filter(([, v]) => v),
    ),
    socialLinks,
    paymentNumbers,
    usdToCdfRate,
  }

  const db = getDb()
  const [before] = await db.select().from(schema.settings).where(eq(schema.settings.id, 1))
  if (before) await db.update(schema.settings).set(values).where(eq(schema.settings.id, 1))
  else await db.insert(schema.settings).values({ id: 1, ...values })

  await audit('settings', null, before ? 'UPDATE' : 'INSERT', user.id, before ?? null, values)
  refresh([CACHE_TAGS.settings], '/admin/parametres')
  return success('Coordonnées enregistrées')
}
