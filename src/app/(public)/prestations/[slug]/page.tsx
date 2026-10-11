import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ArrowLeft, Clock } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { PriceTag } from '@/components/public/PriceTag'
import { getPromotions, getPublishedServices, getServiceBySlug } from '@/lib/data/public'
import { formatDuration } from '@/lib/dates'
import { servicePrice } from '@/lib/pricing/items'
import { slugParams } from '@/lib/static-params'

export async function generateStaticParams() {
  return slugParams((await getPublishedServices()).map((s) => s.slug))
}

export async function generateMetadata({
  params,
}: PageProps<'/prestations/[slug]'>): Promise<Metadata> {
  const service = await getServiceBySlug((await params).slug)
  if (!service) return {}
  return {
    title: service.name,
    description: service.shortDescription ?? service.longDescription ?? undefined,
    openGraph: service.imageUrl ? { images: [service.imageUrl] } : undefined,
  }
}

async function Price({ slug }: { slug: string }) {
  await connection()
  const [service, promotions] = await Promise.all([getServiceBySlug(slug), getPromotions()])
  if (!service) return null
  return (
    <PriceTag
      price={servicePrice(service, promotions, new Date())}
      isFrom={service.priceIsFrom}
      className="text-lg"
    />
  )
}

async function ServiceDetail({ params }: Pick<PageProps<'/prestations/[slug]'>, 'params'>) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()
  const duration = formatDuration(service.durationMinMinutes, service.durationMaxMinutes)

  return (
    <article className="mx-auto max-w-[1320px] px-4 pt-8 pb-24 md:px-8">
      <Link
        href="/prestations"
        className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} aria-hidden />
        Toutes les prestations
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-16">
        <PhotoSlot
          src={service.imageUrl}
          alt={service.name}
          brief={`réalisation ${service.name.toLowerCase()} (format vertical)`}
          className="aspect-[4/5]"
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
        <div className="md:pt-8">
          <h1 className="rise font-display text-5xl leading-none font-medium tracking-tight md:text-7xl">
            {service.name}
          </h1>
          <div className="mt-6">
            <Suspense fallback={<div className="bg-cream-deep h-7 w-48 animate-pulse" />}>
              <Price slug={slug} />
            </Suspense>
          </div>
          {duration && (
            <p className="text-ink-soft mt-3 flex items-center gap-2">
              <Clock size={18} aria-hidden />
              Durée indicative : {duration}
            </p>
          )}
          {(service.longDescription ?? service.shortDescription) && (
            <p className="mt-8 max-w-[52ch] text-lg">
              {service.longDescription ?? service.shortDescription}
            </p>
          )}
          <ButtonLink href={`/reservation?prestation=${service.slug}`} className="mt-10">
            Prendre rendez-vous
          </ButtonLink>
        </div>
      </div>

      {service.gallery.length > 0 && (
        <ul className="mt-20 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {service.gallery.map((src) => (
            <li key={src} data-reveal className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={src}
                alt={`${service.name}, réalisation du salon`}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default function ServicePage({ params }: PageProps<'/prestations/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1320px]" />}>
      <ServiceDetail params={params} />
    </Suspense>
  )
}
