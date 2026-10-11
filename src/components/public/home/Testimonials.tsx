import { Star } from '@phosphor-icons/react/ssr'
import { getPageSections, getTestimonials } from '@/lib/data/public'

/** Avis réels uniquement (publiés avec accord de la cliente). Section masquée s'il n'y en a aucun. */
export async function Testimonials() {
  const [testimonials, { home_testimonials: section }] = await Promise.all([
    getTestimonials(),
    getPageSections(),
  ])
  if (testimonials.length === 0) return null

  return (
    <section className="border-line border-y">
      <div className="mx-auto max-w-[1320px] px-4 py-20 md:px-8 md:py-28">
        <div data-reveal className="max-w-2xl">
          <h2 className="font-display text-5xl leading-none font-medium tracking-tight md:text-6xl">
            {section?.title ?? 'Témoignages'}
          </h2>
          {section?.body && <p className="text-ink-soft mt-4">{section.body}</p>}
        </div>

        <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
          {testimonials.slice(0, 6).map((t) => (
            <li key={t.id} data-reveal className="w-[82%] shrink-0 snap-start md:w-auto">
              <figure className="flex h-full flex-col">
                {t.rating && (
                  <p className="text-accent flex gap-0.5" aria-label={`${t.rating} sur 5`}>
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} size={16} weight="fill" aria-hidden />
                    ))}
                  </p>
                )}
                <blockquote className="font-display mt-4 line-clamp-4 text-2xl leading-snug">
                  “{t.body}”
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{t.displayName}</span>
                  {t.serviceName && <span className="text-ink-soft"> - {t.serviceName}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
