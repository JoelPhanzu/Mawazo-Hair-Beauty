import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { Clock } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { PageHeader } from '@/components/public/PageHeader'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { PriceTag } from '@/components/public/PriceTag'
import {
  getPageSections,
  getPromotions,
  getPublishedServices,
  getServiceCategories,
} from '@/lib/data/public'
import { formatDuration } from '@/lib/dates'
import { servicePrice } from '@/lib/pricing/items'

export const metadata: Metadata = {
  title: 'Prestations et tarifs',
  description:
    'Wings, perruques, tissages, tresses, make-up et ongles : prestations et tarifs du salon Mawazo Hair & Beauty à Kinshasa.',
}

async function ServiceList() {
  await connection()
  const now = new Date()
  const [services, categories, promotions] = await Promise.all([
    getPublishedServices(),
    getServiceCategories(),
    getPromotions(),
  ])

  if (services.length === 0) {
    return <p className="text-ink-soft">Les prestations seront bientôt en ligne.</p>
  }

  // Regroupement par catégorie ; les prestations sans catégorie à la fin.
  const groups = [
    ...categories.map((c) => ({
      name: c.name,
      items: services.filter((s) => s.categoryId === c.id),
    })),
    {
      name: 'Autres prestations',
      items: services.filter((s) => !categories.some((c) => c.id === s.categoryId)),
    },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="space-y-20">
      {groups.map((group) => (
        <section key={group.name}>
          {groups.length > 1 && (
            <h2 className="font-display border-line border-b pb-4 text-4xl font-medium">
              {group.name}
            </h2>
          )}
          <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2">
            {group.items.map((service) => {
              const duration = formatDuration(
                service.durationMinMinutes,
                service.durationMaxMinutes,
              )
              return (
                <li
                  key={service.id}
                  data-reveal
                  className="grid grid-cols-[38%_1fr] gap-5 sm:gap-7"
                >
                  <Link href={`/prestations/${service.slug}`} className="block overflow-hidden">
                    <PhotoSlot
                      src={service.imageUrl}
                      alt={service.name}
                      brief={`réalisation ${service.name.toLowerCase()}`}
                      className="aspect-[3/4] transition duration-700 hover:scale-[1.03]"
                      sizes="(min-width: 768px) 18vw, 38vw"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <h3 className="font-display text-3xl leading-tight font-semibold">
                      <Link href={`/prestations/${service.slug}`} className="hover:text-accent">
                        {service.name}
                      </Link>
                    </h3>
                    <PriceTag
                      price={servicePrice(service, promotions, now)}
                      isFrom={service.priceIsFrom}
                      className="mt-2 text-base"
                    />
                    {(service.longDescription ?? service.shortDescription) && (
                      <p className="text-ink-soft mt-3 text-sm">
                        {service.longDescription ?? service.shortDescription}
                      </p>
                    )}
                    {duration && (
                      <p className="text-ink-soft mt-3 flex items-center gap-1.5 text-sm">
                        <Clock size={16} aria-hidden />
                        {duration}
                      </p>
                    )}
                    <div className="mt-auto pt-5">
                      <ButtonLink
                        href={`/reservation?prestation=${service.slug}`}
                        variant="outline"
                        className="min-h-11 px-5"
                      >
                        Réserver
                      </ButtonLink>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default async function ServicesPage() {
  const { services_intro: intro } = await getPageSections()
  return (
    <>
      <PageHeader title={intro?.title ?? 'Nos Services'} intro={intro?.body} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <Suspense fallback={<div className="bg-cream-deep h-96 animate-pulse" />}>
          <ServiceList />
        </Suspense>
      </div>
    </>
  )
}
