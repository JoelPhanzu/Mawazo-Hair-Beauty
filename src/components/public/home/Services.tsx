import Link from 'next/link'
import { connection } from 'next/server'
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/ssr'
import { getPromotions, getPublishedServices } from '@/lib/data/public'
import { servicePrice } from '@/lib/pricing/items'
import { PhotoSlot } from '../PhotoSlot'
import { PriceTag } from '../PriceTag'

/**
 * Prestations de l'accueil. Rendu à la requête (connection) car le prix effectif
 * dépend du jour à Kinshasa ; les données, elles, viennent du cache.
 */
export async function Services() {
  await connection()
  const now = new Date()
  const [services, promotions] = await Promise.all([getPublishedServices(), getPromotions()])

  if (services.length === 0) {
    return (
      <p className="text-ink-soft mt-12 max-w-md">
        Les prestations seront affichées ici dès leur publication.
      </p>
    )
  }

  const featured = services.filter((s) => s.isFeatured)
  const others = services.filter((s) => !s.isFeatured)

  return (
    <>
      {/* Mobile : défilement horizontal. Desktop : grille à rythme décalé. */}
      <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-12 md:overflow-visible md:px-0 lg:grid-cols-4">
        {featured.map((service, i) => (
          <li
            key={service.id}
            data-reveal
            className={`w-[78%] shrink-0 snap-start md:w-auto ${i % 2 === 1 ? 'lg:mt-16' : ''}`}
          >
            <Link href={`/prestations/${service.slug}`} className="group block">
              <div className="overflow-hidden">
                <PhotoSlot
                  src={service.imageUrl}
                  alt={service.name}
                  brief={`réalisation ${service.name.toLowerCase()}`}
                  className="aspect-[3/4] transition duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 24vw, (min-width: 768px) 45vw, 78vw"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-display text-[1.75rem] leading-tight font-semibold">
                  {service.name}
                </h3>
                <ArrowUpRight
                  size={20}
                  className="text-ink-soft group-hover:text-accent mt-2 shrink-0 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </div>
              {service.shortDescription && (
                <p className="text-ink-soft mt-1 text-sm">{service.shortDescription}</p>
              )}
              <PriceTag
                price={servicePrice(service, promotions, now)}
                isFrom={service.priceIsFrom}
                className="mt-3"
              />
            </Link>
          </li>
        ))}
      </ul>

      {others.length > 0 && (
        <ul className="bg-line mt-14 grid gap-px md:grid-cols-2">
          {others.map((service) => (
            <li key={service.id} className="bg-cream">
              <Link
                href={`/prestations/${service.slug}`}
                className="group md:hover:bg-cream-deep flex min-h-24 items-center justify-between gap-6 py-6 transition-colors md:px-6"
              >
                <div>
                  <h3 className="font-display text-2xl font-semibold">{service.name}</h3>
                  {service.shortDescription && (
                    <p className="text-ink-soft text-sm">{service.shortDescription}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-right">
                  <PriceTag
                    price={servicePrice(service, promotions, now)}
                    isFrom={service.priceIsFrom}
                    className="max-w-[16ch]"
                  />
                  <ArrowRight
                    size={18}
                    className="text-ink-soft group-hover:text-accent shrink-0 transition group-hover:translate-x-1"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

/** Squelette de même forme pendant le calcul des prix. */
export function ServicesSkeleton() {
  return (
    <ul
      className="-mx-4 mt-12 flex gap-4 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-4"
      aria-hidden
    >
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className={`w-[78%] shrink-0 md:w-auto ${i % 2 === 1 ? 'lg:mt-16' : ''}`}>
          <div className="bg-cream-deep aspect-[3/4] animate-pulse" />
          <div className="bg-cream-deep mt-4 h-7 w-2/3 animate-pulse" />
          <div className="bg-cream-deep mt-3 h-4 w-1/2 animate-pulse" />
        </li>
      ))}
    </ul>
  )
}
