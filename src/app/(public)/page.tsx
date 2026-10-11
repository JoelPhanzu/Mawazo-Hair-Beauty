import { Suspense } from 'react'
import { ButtonLink } from '@/components/public/ButtonLink'
import { About } from '@/components/public/home/About'
import { FinalCta } from '@/components/public/home/FinalCta'
import { Gallery } from '@/components/public/home/Gallery'
import { Hero } from '@/components/public/home/Hero'
import { Services, ServicesSkeleton } from '@/components/public/home/Services'
import { Shop } from '@/components/public/home/Shop'
import { Testimonials } from '@/components/public/home/Testimonials'
import { Visit } from '@/components/public/home/Visit'
import { WeeklyOffer } from '@/components/public/home/WeeklyOffer'
import { getPageSections } from '@/lib/data/public'

export default async function HomePage() {
  const { home_services: services } = await getPageSections()

  return (
    <>
      <Hero />
      <About />

      <section className="mx-auto max-w-[1320px] px-4 py-20 md:px-8 md:py-28">
        <div data-reveal className="max-w-2xl">
          <h2 className="font-display text-5xl leading-none font-medium tracking-tight md:text-6xl">
            {services?.title ?? 'Nos Services'}
          </h2>
          {services?.body && <p className="text-ink-soft mt-5 max-w-[48ch]">{services.body}</p>}
        </div>
        <Suspense fallback={<ServicesSkeleton />}>
          <Services />
        </Suspense>
        <ButtonLink
          href={services?.buttonHref ?? '/prestations'}
          variant="outline"
          className="mt-12"
        >
          {services?.buttonLabel ?? 'Toutes les prestations'}
        </ButtonLink>
      </section>

      <WeeklyOffer />
      <Gallery />
      <Shop />
      <Testimonials />
      <Visit />
      <FinalCta />
    </>
  )
}
