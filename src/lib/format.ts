import type { Currency } from './pricing/types'
import { SALON_TIME_ZONE } from './pricing'

const NBSP = ' '

const groupFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const usdFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' })

/** Remplace les espaces fines de Intl par des espaces insécables classiques. */
function withNbsp(value: string): string {
  return value.replace(/[  \s]/g, NBSP)
}

/**
 * Montant affichable : « 75 000 FC » ou « 12,50 $US ».
 * CDF : montant en francs. USD : montant en cents.
 */
export function formatAmount(amount: number, currency: Currency): string {
  if (currency === 'USD') return withNbsp(usdFormatter.format(amount / 100))
  return `${withNbsp(groupFormatter.format(amount))}${NBSP}FC`
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** « mardi 13 octobre », à l'heure de Kinshasa. */
export function formatDate(date: Date): string {
  return dateFormatter.format(date)
}

/** « +243850871455 » -> « +243 850 871 455 ». */
export function formatPhone(phone: string): string {
  return phone.replace(/^\+243(\d{3})(\d{3})(\d{3})$/, '+243 $1 $2 $3')
}

const WEEK = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const

/**
 * Regroupe les jours consécutifs ayant le même horaire :
 * [{ days: 'Lundi - samedi', hours: '9h00 - 19h00' }, { days: 'Dimanche', hours: 'Sur rendez-vous' }]
 */
export function groupOpeningHours(
  hours: Record<string, string>,
): { days: string; hours: string }[] {
  const groups: { from: string; to: string; hours: string }[] = []
  for (const day of WEEK) {
    const value = hours[day]
    if (!value) continue
    const last = groups.at(-1)
    if (
      last &&
      last.hours === value &&
      WEEK.indexOf(last.to as (typeof WEEK)[number]) === WEEK.indexOf(day) - 1
    ) {
      last.to = day
    } else {
      groups.push({ from: day, to: day, hours: value })
    }
  }
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return groups.map((g) => ({
    days: g.from === g.to ? capitalize(g.from) : `${capitalize(g.from)} - ${g.to}`,
    hours: g.hours,
  }))
}
