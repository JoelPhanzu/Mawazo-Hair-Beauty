import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { BookingForm } from '@/components/public/form/BookingForm'
import { PageHeader } from '@/components/public/PageHeader'
import { getPageSections, getPublishedServices, getSiteSettings } from '@/lib/data/public'
import { bookingTimeSlots, kinshasaDateString } from '@/lib/dates'
import { groupOpeningHours } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Prendre rendez-vous',
  description:
    'Réservez votre prestation au salon Mawazo Hair & Beauty. Confirmation sur WhatsApp.',
}

async function Form({ searchParams }: Pick<PageProps<'/reservation'>, 'searchParams'>) {
  const { prestation } = await searchParams
  await connection()
  const [services, settings] = await Promise.all([getPublishedServices(), getSiteSettings()])
  return (
    <BookingForm
      services={services.map((s) => ({ slug: s.slug, name: s.name }))}
      slots={bookingTimeSlots()}
      minDate={kinshasaDateString(new Date())}
      defaultService={typeof prestation === 'string' ? prestation : undefined}
      whatsappNumber={settings.whatsappNumber}
    />
  )
}

export default async function BookingPage({ searchParams }: PageProps<'/reservation'>) {
  const [{ booking_intro: intro }, settings] = await Promise.all([
    getPageSections(),
    getSiteSettings(),
  ])
  return (
    <>
      <PageHeader title={intro?.title ?? 'Prendre rendez-vous'} intro={intro?.body} />
      <div className="mx-auto grid max-w-[1320px] gap-14 px-4 pb-24 md:px-8 lg:grid-cols-[1.6fr_1fr]">
        <Suspense fallback={<div className="bg-cream-deep h-[520px] animate-pulse" />}>
          <Form searchParams={searchParams} />
        </Suspense>
        <aside className="bg-cream-deep self-start p-6 md:p-8">
          <h2 className="font-display text-3xl font-medium">Horaires</h2>
          <dl className="mt-5 grid gap-4">
            {groupOpeningHours(settings.openingHours).map((g) => (
              <div key={g.days}>
                <dt className="text-ink-soft text-sm">{g.days}</dt>
                <dd className="font-semibold">{g.hours}</dd>
              </div>
            ))}
          </dl>
          {settings.address && <p className="text-ink-soft mt-6 text-sm">{settings.address}</p>}
        </aside>
      </div>
    </>
  )
}
