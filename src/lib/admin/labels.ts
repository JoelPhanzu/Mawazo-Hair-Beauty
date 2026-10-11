import type { BOOKING_STATUSES, ORDER_STATUSES } from '@/db/schema'

type Tone = 'neutral' | 'success' | 'warning' | 'muted'

export const BOOKING_TONES: Record<(typeof BOOKING_STATUSES)[number], Tone> = {
  nouvelle: 'warning',
  confirmée: 'success',
  honorée: 'neutral',
  annulée: 'muted',
  absente: 'muted',
}

export const ORDER_TONES: Record<(typeof ORDER_STATUSES)[number], Tone> = {
  nouvelle: 'warning',
  confirmée: 'neutral',
  payée: 'success',
  livrée: 'muted',
  annulée: 'muted',
}

export const ROLE_LABELS = {
  owner: 'Gérante',
  editor: 'Équipe',
  lean_admin: 'Lean Market',
} as const
