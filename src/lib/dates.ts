import { SALON_TIME_ZONE } from './pricing'

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SALON_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Date du jour à Kinshasa au format AAAA-MM-JJ. */
export function kinshasaDateString(date: Date): string {
  return isoDateFormatter.format(date)
}

/** Créneaux proposés à la réservation (indicatifs : le salon confirme sur WhatsApp). */
export function bookingTimeSlots(): string[] {
  const slots: string[] = []
  for (let minutes = 9 * 60; minutes <= 18 * 60; minutes += 30) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0')
    const m = String(minutes % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
  }
  return slots
}

const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** « 2026-10-13 » -> « mardi 13 octobre 2026 ». */
export function formatIsoDate(isoDate: string): string {
  return longDateFormatter.format(new Date(`${isoDate}T12:00:00Z`))
}

/** Durée indicative : « 4 à 6 h », « 1 h à 1 h 30 », « 45 min ». */
export function formatDuration(min: number | null, max: number | null): string | null {
  const one = (m: number) => {
    const h = Math.floor(m / 60)
    const rest = m % 60
    if (h === 0) return `${rest} min`
    return rest ? `${h} h ${rest}` : `${h} h`
  }
  if (min && max && min !== max) {
    if (min % 60 === 0 && max % 60 === 0) return `${min / 60} à ${max / 60} h`
    return `${one(min)} à ${one(max)}`
  }
  const value = min ?? max
  return value ? one(value) : null
}
