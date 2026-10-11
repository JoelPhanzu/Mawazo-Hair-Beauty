import { MapPin, Phone } from '@phosphor-icons/react/ssr'
import { getPageSections, getSiteSettings } from '@/lib/data/public'
import { formatPhone, groupOpeningHours } from '@/lib/format'
import { ButtonLink } from '../ButtonLink'
import { PhotoSlot } from '../PhotoSlot'

export async function Visit() {
  const [settings, { home_visit: visit }] = await Promise.all([
    getSiteSettings(),
    getPageSections(),
  ])
  const hours = groupOpeningHours(settings.openingHours)

  return (
    <section className="mx-auto grid max-w-[1320px] gap-10 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:gap-20">
      <PhotoSlot
        src={visit?.imageUrl}
        alt="Le salon Mawazo à Lingwala"
        brief="intérieur du salon ou devanture, format paysage"
        className="aspect-[4/3] lg:order-2 lg:aspect-auto lg:min-h-[480px]"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />

      <div data-reveal className="flex flex-col justify-center">
        <h2 className="font-display text-5xl leading-none font-medium tracking-tight md:text-6xl">
          {visit?.title ?? 'Visitez-nous'}
        </h2>
        {settings.address && (
          <p className="mt-8 flex items-start gap-3 text-lg">
            <MapPin size={22} className="text-accent mt-1 shrink-0" aria-hidden />
            {settings.address}
          </p>
        )}

        <dl className="border-line mt-8 grid gap-4 border-t pt-8 sm:grid-cols-2">
          {hours.map((group) => (
            <div key={group.days}>
              <dt className="text-ink-soft text-sm">{group.days}</dt>
              <dd className="font-display mt-1 text-2xl font-semibold">{group.hours}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          {settings.googleMapsUrl && (
            <ButtonLink
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              <MapPin size={18} aria-hidden />
              Itinéraire
            </ButtonLink>
          )}
          {settings.phone && (
            <ButtonLink href={`tel:${settings.phone}`} variant="outline">
              <Phone size={18} aria-hidden />
              {formatPhone(settings.phone)}
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  )
}
