import { describe, expect, it } from 'vitest'
import { formatAmount } from './format'
import { normalizeCongoPhone } from './phone'
import { buildWhatsAppUrl } from './whatsapp'

describe('formatAmount', () => {
  it('affiche les FC avec espace insécable', () => {
    expect(formatAmount(75000, 'CDF')).toBe('75 000 FC')
    expect(formatAmount(500, 'CDF')).toBe('500 FC')
  })
  it('affiche les USD à partir des cents', () => {
    expect(formatAmount(1250, 'USD')).toBe('12,50 $US')
  })
})

describe('normalizeCongoPhone', () => {
  it.each([
    ['0850871455', '+243850871455'],
    ['085 087 14 55', '+243850871455'],
    ['+243 850 871 455', '+243850871455'],
    ['243850871455', '+243850871455'],
    ['00243850871455', '+243850871455'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeCongoPhone(input)).toBe(expected)
  })
  it('refuse les numéros invalides', () => {
    expect(normalizeCongoPhone('12345')).toBeNull()
    expect(normalizeCongoPhone('08abc')).toBeNull()
    expect(normalizeCongoPhone('+2430850871455')).toBeNull()
  })
})

describe('buildWhatsAppUrl', () => {
  it('construit un lien wa.me encodé', () => {
    expect(buildWhatsAppUrl('+243 850 871 455', 'Bonjour à vous')).toBe(
      'https://wa.me/243850871455?text=Bonjour%20%C3%A0%20vous',
    )
    expect(buildWhatsAppUrl('243850871455')).toBe('https://wa.me/243850871455')
  })
})

describe('groupOpeningHours', () => {
  it('regroupe les jours consécutifs identiques', async () => {
    const { groupOpeningHours } = await import('./format')
    const week = {
      lundi: '9h-19h',
      mardi: '9h-19h',
      mercredi: '9h-19h',
      jeudi: '9h-19h',
      vendredi: '9h-19h',
      samedi: '9h-19h',
      dimanche: 'Sur rendez-vous',
    }
    expect(groupOpeningHours(week)).toEqual([
      { days: 'Lundi - samedi', hours: '9h-19h' },
      { days: 'Dimanche', hours: 'Sur rendez-vous' },
    ])
  })
})
