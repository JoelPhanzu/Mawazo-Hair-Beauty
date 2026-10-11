import { describe, expect, it } from 'vitest'
import { bookingTimeSlots, formatDuration, kinshasaDateString } from './dates'
import { buildBookingMessage, buildOrderMessage } from './messages'
import { generateReference } from './reference'
import { bookingSchema } from './validation/public'

describe('buildBookingMessage', () => {
  it('produit un message lisible avec la référence', () => {
    const text = buildBookingMessage({
      reference: 'R-7K3QF',
      customerName: 'Nadège',
      customerPhone: '+243850871455',
      serviceName: 'Tissages',
      requestedDate: '2026-10-13',
      requestedTime: '10:30',
      message: '',
    })
    expect(text).toContain('Prestation : Tissages')
    expect(text).toContain('mardi 13 octobre 2026 à 10h30')
    expect(text).toContain('Référence : R-7K3QF')
  })

  it('reste valable sans référence (enregistrement échoué)', () => {
    const text = buildBookingMessage({
      reference: null,
      customerName: 'Nadège',
      customerPhone: '+243850871455',
      serviceName: 'Tissages',
      requestedDate: '2026-10-13',
      requestedTime: '10:30',
    })
    expect(text).not.toContain('Référence')
  })
})

describe('buildOrderMessage', () => {
  it('récapitule lignes, total et paiement', () => {
    const text = buildOrderMessage({
      reference: 'C-9XMP2',
      customerName: 'Grâce',
      customerPhone: '+243850871455',
      deliveryCommune: 'Gombe',
      paymentLabel: 'Mobile money',
      lines: [
        {
          name: 'Wing Premium',
          variant: { longueur: '14 pouces' },
          quantity: 2,
          unitAmount: 75000,
        },
      ],
      totalAmount: 150000,
      currency: 'CDF',
    })
    expect(text).toContain('- 2 x Wing Premium (14 pouces) : 150 000 FC')
    expect(text).toContain('Total : 150 000 FC')
    expect(text).toContain('Livraison : Gombe')
  })
})

describe('bookingSchema', () => {
  const valid = {
    customerName: 'Nadège',
    customerPhone: '085 087 14 55',
    serviceSlug: 'tissages',
    requestedDate: '2026-10-13',
    requestedTime: '10:30',
  }
  it('normalise le téléphone', () => {
    expect(bookingSchema.parse(valid).customerPhone).toBe('+243850871455')
  })
  it('refuse un téléphone invalide', () => {
    expect(bookingSchema.safeParse({ ...valid, customerPhone: '12' }).success).toBe(false)
  })
})

describe('dates', () => {
  it('donne la date de Kinshasa, pas celle d’UTC', () => {
    expect(kinshasaDateString(new Date('2026-10-12T23:30:00Z'))).toBe('2026-10-13')
  })
  it('formate les durées', () => {
    expect(formatDuration(240, 360)).toBe('4 à 6 h')
    expect(formatDuration(60, 90)).toBe('1 h à 1 h 30')
    expect(formatDuration(45, null)).toBe('45 min')
  })
  it('propose des créneaux de 9h à 18h', () => {
    const slots = bookingTimeSlots()
    expect(slots[0]).toBe('09:00')
    expect(slots.at(-1)).toBe('18:00')
  })
})

describe('generateReference', () => {
  it('produit une référence courte sans caractères ambigus', () => {
    expect(generateReference('R')).toMatch(/^R-[A-HJKMNP-Z2-9]{5}$/)
  })
})
