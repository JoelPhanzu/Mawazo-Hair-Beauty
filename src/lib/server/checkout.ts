/**
 * Enregistrement des réservations et commandes publiques.
 * Les prix sont TOUJOURS recalculés ici (getEffectivePrice), jamais repris du navigateur.
 */
import 'server-only'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import {
  getPromotions,
  getPublishedProducts,
  getPublishedServices,
  getSiteSettings,
} from '@/lib/data/public'
import { buildBookingMessage, buildOrderMessage, PAYMENT_LABELS } from '@/lib/messages'
import { productPrice } from '@/lib/pricing/items'
import { generateReference } from '@/lib/reference'
import { bookingSchema, orderSchema } from '@/lib/validation/public'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { kinshasaDateString } from '@/lib/dates'
import type { EffectivePrice } from '@/lib/pricing/types'
import type { Product } from '@/types/content'

export type CheckoutResult =
  | { ok: true; reference: string | null; whatsappUrl: string; saved: boolean }
  | { ok: false; status: number; errors: Record<string, string> }

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] ??= issue.message
  }
  return errors
}

/** Insère avec une référence unique (nouvel essai en cas de collision). */
async function withUniqueReference<T>(prefix: 'R' | 'C', insert: (ref: string) => Promise<T>) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const reference = generateReference(prefix)
    try {
      await insert(reference)
      return reference
    } catch (error) {
      const duplicate = (error as { code?: string }).code === 'ER_DUP_ENTRY'
      if (!duplicate || attempt === 3) throw error
    }
  }
  throw new Error('Référence introuvable')
}

export async function createBooking(input: unknown): Promise<CheckoutResult> {
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 422, errors: fieldErrors(parsed.error.issues) }
  const data = parsed.data

  if (data.requestedDate < kinshasaDateString(new Date())) {
    return { ok: false, status: 422, errors: { requestedDate: 'Choisissez une date à venir' } }
  }

  const [services, settings] = await Promise.all([getPublishedServices(), getSiteSettings()])
  const service = services.find((s) => s.slug === data.serviceSlug)
  if (!service) return { ok: false, status: 422, errors: { serviceSlug: 'Prestation inconnue' } }

  let reference: string | null = null
  if (isDatabaseConfigured()) {
    try {
      reference = await withUniqueReference('R', (ref) =>
        getDb()
          .insert(schema.bookings)
          .values({
            reference: ref,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            serviceId: service.id,
            serviceName: service.name,
            requestedDate: data.requestedDate,
            requestedTime: data.requestedTime,
            message: data.message || null,
            source: 'site',
          }),
      )
    } catch (error) {
      // La cliente ne doit jamais perdre un rendez-vous : WhatsApp s'ouvre quand même.
      console.error('[réservation] enregistrement impossible', error)
    }
  }

  const message = buildBookingMessage({ ...data, reference, serviceName: service.name })
  return {
    ok: true,
    reference,
    saved: reference !== null,
    whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message),
  }
}

export async function createOrder(input: unknown): Promise<CheckoutResult> {
  const parsed = orderSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 422, errors: fieldErrors(parsed.error.issues) }
  const data = parsed.data

  const [products, promotions, settings] = await Promise.all([
    getPublishedProducts(),
    getPromotions(),
    getSiteSettings(),
  ])
  const now = new Date()

  const lines: {
    product: Product
    item: (typeof data.items)[number]
    price: EffectivePrice
  }[] = []
  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) {
      return {
        ok: false,
        status: 422,
        errors: { items: 'Un produit du panier n’est plus disponible' },
      }
    }
    if (product.stock !== null && product.stock < item.quantity) {
      return {
        ok: false,
        status: 422,
        errors: { items: `Stock insuffisant pour « ${product.name} »` },
      }
    }
    const price = productPrice(product, promotions, now)
    lines.push({ product, item, price })
  }

  const currency = lines[0].price.currency
  if (lines.some((l) => l.price.currency !== currency)) {
    return { ok: false, status: 422, errors: { items: 'Panier en devises différentes' } }
  }
  const totalAmount = lines.reduce((sum, l) => sum + l.price.amount * l.item.quantity, 0)

  let reference: string | null = null
  if (isDatabaseConfigured()) {
    try {
      const db = getDb()
      reference = await withUniqueReference('C', (ref) =>
        db.transaction(async (tx) => {
          const orderId = crypto.randomUUID()
          await tx.insert(schema.orders).values({
            id: orderId,
            reference: ref,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            deliveryCommune: data.deliveryCommune || null,
            deliveryAddress: data.deliveryAddress || null,
            totalAmount,
            currency,
            paymentMethod: data.paymentMethod,
            message: data.message || null,
          })
          await tx.insert(schema.orderItems).values(
            lines.map(({ product, item, price }) => ({
              orderId,
              productId: product.id,
              productName: product.name,
              variant: item.variant,
              quantity: item.quantity,
              unitPriceAmount: price.amount,
              discountAmount: price.discountAmount,
              promotionId: price.appliedPromotion?.id ?? null,
              currency,
            })),
          )
        }),
      )
    } catch (error) {
      console.error('[commande] enregistrement impossible', error)
    }
  }

  const message = buildOrderMessage({
    reference,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryCommune: data.deliveryCommune,
    deliveryAddress: data.deliveryAddress,
    paymentLabel: PAYMENT_LABELS[data.paymentMethod],
    message: data.message,
    lines: lines.map(({ product, item, price }) => ({
      name: product.name,
      variant: item.variant,
      quantity: item.quantity,
      unitAmount: price.amount,
    })),
    totalAmount,
    currency,
  })

  return {
    ok: true,
    reference,
    saved: reference !== null,
    whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message),
  }
}
