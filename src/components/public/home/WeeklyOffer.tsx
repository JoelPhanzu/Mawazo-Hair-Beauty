import { getPromotions } from '@/lib/data/public'
import { ButtonLink } from '../ButtonLink'
import { WeekdayDots, weekdayNames } from '../WeekdayDots'

/** Offre récurrente (ex. « Mardi Promo »), affichée avec ses jours dans la semaine. */
export async function WeeklyOffer() {
  const promotions = await getPromotions()
  const offer = promotions
    .filter((p) => p.weekdays && p.weekdays.length > 0)
    .sort((a, b) => b.priority - a.priority)[0]
  if (!offer?.weekdays) return null

  return (
    <section className="bg-accent-soft">
      <div
        data-reveal
        className="mx-auto grid max-w-[1320px] gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:items-end md:px-8 md:py-24"
      >
        <div>
          <h2 className="font-display text-accent text-6xl leading-[0.95] font-medium tracking-tight md:text-[7.5rem]">
            {offer.title}
          </h2>
          {offer.subtitle && (
            <p className="font-display mt-5 text-2xl md:text-3xl">{offer.subtitle}</p>
          )}
        </div>
        <div>
          <WeekdayDots days={offer.weekdays} />
          <p className="mt-6 max-w-[44ch] text-lg">
            {/* Évite « Chaque mardi. Chaque mardi, … » si la description le dit déjà. */}
            {!offer.description?.startsWith('Chaque') && (
              <span className="font-semibold">Chaque {weekdayNames(offer.weekdays)}. </span>
            )}
            {offer.description && <span className="text-ink-soft">{offer.description}</span>}
          </p>
          <ButtonLink href="/promotions" variant="outline" className="mt-8">
            Voir toutes les promos
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
