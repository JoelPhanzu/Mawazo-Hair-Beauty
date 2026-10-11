import { getPageSections } from '@/lib/data/public'
import { ButtonLink } from '../ButtonLink'
import { Emphasis } from '../Emphasis'
import { PhotoSlot } from '../PhotoSlot'

export async function Hero() {
  const { home_hero: hero, home_shop: shop } = await getPageSections()

  return (
    <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-4 pt-8 pb-16 md:px-8 lg:min-h-[calc(100dvh-68px)] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-12">
      <div className="max-w-xl">
        <h1 className="rise font-display pb-1 text-[3.1rem] leading-[1.04] font-medium tracking-tight sm:text-6xl lg:text-[5rem]">
          <Emphasis text={hero?.title ?? 'Mawazo Hair & Beauty'} />
        </h1>
        {hero?.body && (
          <p
            className="rise text-ink-soft mt-6 max-w-[42ch] text-lg"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            {hero.body}
          </p>
        )}
        <div className="rise mt-9 flex flex-wrap gap-3" style={{ '--i': 2 } as React.CSSProperties}>
          <ButtonLink href={hero?.buttonHref ?? '/reservation'}>
            {hero?.buttonLabel ?? 'Prendre rendez-vous'}
          </ButtonLink>
          <ButtonLink href={shop?.buttonHref ?? '/boutique'} variant="outline">
            {shop?.buttonLabel ?? 'Commander un produit'}
          </ButtonLink>
        </div>
      </div>

      {/* Composition photo : portrait principal + détail en surimpression (desktop). */}
      <div className="rise lg:flex lg:justify-end" style={{ '--i': 2 } as React.CSSProperties}>
        <div className="relative">
          <PhotoSlot
            src={hero?.imageUrl}
            alt="Cliente du salon Mawazo"
            brief="portrait d'une cliente du salon, coiffure terminée, lumière naturelle (format vertical 4:5)"
            className="aspect-[4/5] w-full lg:h-[min(72dvh,660px)] lg:w-auto"
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
          />
          <PhotoSlot
            src={hero?.secondaryImageUrl}
            alt="Détail d'une réalisation du salon"
            brief="gros plan sur une réalisation (tresses, boucles ou finitions)"
            className="border-cream absolute -bottom-10 -left-20 hidden aspect-square w-[44%] border-[6px] lg:flex"
            sizes="18vw"
          />
        </div>
      </div>
    </section>
  )
}
