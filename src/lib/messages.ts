/**
 * Messages WhatsApp pré-remplis, lisibles par la gérante.
 * Les prix passés ici viennent toujours de getEffectivePrice(), calculé côté serveur.
 */
import { formatIsoDate } from './dates'
import { formatAmount } from './format'
import type { Currency } from './pricing/types'

export interface BookingMessageInput {
  reference: string | null
  customerName: string
  customerPhone: string
  serviceName: string
  requestedDate: string
  requestedTime: string
  message?: string | null
}

export function buildBookingMessage(input: BookingMessageInput): string {
  const lines = [
    'Bonjour Mawazo, je souhaite prendre rendez-vous.',
    '',
    `Prestation : ${input.serviceName}`,
    `Date souhaitée : ${formatIsoDate(input.requestedDate)} à ${input.requestedTime.replace(':', 'h')}`,
    `Nom : ${input.customerName}`,
    `Téléphone : ${input.customerPhone}`,
  ]
  if (input.message) lines.push(`Message : ${input.message}`)
  if (input.reference) lines.push('', `Référence : ${input.reference}`)
  return lines.join('\n')
}

export interface OrderMessageLine {
  name: string
  variant?: Record<string, string>
  quantity: number
  unitAmount: number
}

export interface OrderMessageInput {
  reference: string | null
  customerName: string
  customerPhone: string
  deliveryCommune?: string | null
  deliveryAddress?: string | null
  paymentLabel: string
  lines: OrderMessageLine[]
  totalAmount: number
  currency: Currency
  message?: string | null
}

export function buildOrderMessage(input: OrderMessageInput): string {
  const items = input.lines.map((line) => {
    const variant = line.variant && Object.values(line.variant).filter(Boolean).join(', ')
    const label = variant ? `${line.name} (${variant})` : line.name
    return `- ${line.quantity} x ${label} : ${formatAmount(line.unitAmount * line.quantity, input.currency)}`
  })
  const lines = [
    'Bonjour Mawazo, je souhaite passer commande.',
    '',
    ...items,
    '',
    `Total : ${formatAmount(input.totalAmount, input.currency)}`,
    `Paiement : ${input.paymentLabel}`,
    `Nom : ${input.customerName}`,
    `Téléphone : ${input.customerPhone}`,
  ]
  const delivery = [input.deliveryCommune, input.deliveryAddress].filter(Boolean).join(', ')
  if (delivery) lines.push(`Livraison : ${delivery}`)
  if (input.message) lines.push(`Message : ${input.message}`)
  if (input.reference) lines.push('', `Référence : ${input.reference}`)
  return lines.join('\n')
}

export const PAYMENT_LABELS = {
  cash_livraison: 'Paiement à la livraison (cash)',
  mobile_money: 'Mobile money',
  sur_place: 'Paiement au salon',
} as const

export type PaymentMethod = keyof typeof PAYMENT_LABELS
