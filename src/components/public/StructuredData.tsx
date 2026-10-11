import { getSiteSettings } from '@/lib/data/public'

const DAY_CODES: Record<string, string> = {
  lundi: 'Monday',
  mardi: 'Tuesday',
  mercredi: 'Wednesday',
  jeudi: 'Thursday',
  vendredi: 'Friday',
  samedi: 'Saturday',
  dimanche: 'Sunday',
}

/** « 9h00 - 19h00 » -> ['09:00', '19:00'] ; null pour « Sur rendez-vous », « Fermé »… */
function parseHours(value: string): [string, string] | null {
  const match = value.match(/(\d{1,2})h(\d{2})?\s*-\s*(\d{1,2})h(\d{2})?/)
  if (!match) return null
  const pad = (h: string, m?: string) => `${h.padStart(2, '0')}:${m ?? '00'}`
  return [pad(match[1], match[2]), pad(match[3], match[4])]
}

/** Données structurées BeautySalon (Google : adresse, horaires, téléphone). */
export async function StructuredData() {
  const settings = await getSiteSettings()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const openingHoursSpecification = Object.entries(settings.openingHours).flatMap(
    ([day, value]) => {
      const hours = parseHours(value)
      return hours && DAY_CODES[day]
        ? [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: DAY_CODES[day],
              opens: hours[0],
              closes: hours[1],
            },
          ]
        : []
    },
  )

  const data = {
    '@context': 'https://schema.org',
    '@type': ['BeautySalon', 'HairSalon'],
    name: settings.businessName,
    description: settings.tagline,
    url: site,
    image: `${site}/opengraph-image`,
    telephone: settings.phone,
    email: settings.emails[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressLocality: 'Kinshasa',
      addressCountry: 'CD',
    },
    openingHoursSpecification,
    priceRange: '$$',
    currenciesAccepted: 'CDF',
    sameAs: Object.values(settings.socialLinks).filter(Boolean),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
