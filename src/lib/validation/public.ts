import { z } from 'zod'
import { normalizeCongoPhone } from '../phone'

export const phoneField = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const normalized = normalizeCongoPhone(value)
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'Numéro invalide (ex. 0850 871 455)' })
      return z.NEVER
    }
    return normalized
  })

const name = z.string().trim().min(2, 'Indiquez votre nom').max(120)

export const bookingSchema = z.object({
  customerName: name,
  customerPhone: phoneField,
  serviceSlug: z.string().trim().min(1, 'Choisissez une prestation').max(140),
  requestedDate: z.iso.date('Choisissez une date'),
  requestedTime: z.string().regex(/^\d{2}:\d{2}$/, 'Choisissez un créneau'),
  message: z.string().trim().max(1000).optional().default(''),
})

export type BookingInput = z.input<typeof bookingSchema>

export const orderSchema = z.object({
  customerName: name,
  customerPhone: phoneField,
  deliveryCommune: z.string().trim().max(80).optional().default(''),
  deliveryAddress: z.string().trim().max(255).optional().default(''),
  paymentMethod: z.enum(['cash_livraison', 'mobile_money', 'sur_place']),
  message: z.string().trim().max(1000).optional().default(''),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(20),
        variant: z.record(z.string().max(40), z.string().max(60)).optional().default({}),
      }),
    )
    .min(1, 'Votre panier est vide')
    .max(30),
})

export type OrderInput = z.input<typeof orderSchema>
