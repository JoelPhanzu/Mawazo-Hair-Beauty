import { getPageSections } from '@/lib/data/public'
import { PhotoSlot } from '../PhotoSlot'

/** « L'Excellence à votre Service » : texte de présentation éditable dans l'admin. */
export async function About() {
  const { home_about: about } = await getPageSections()
  if (!about?.body) return null

  return (
    <section className="mx-auto grid max-w-[1320px] gap-10 px-4 py-20 md:grid-cols-[0.9fr_1.4fr] md:items-center md:gap-16 md:px-8 md:py-28">
      <PhotoSlot
        src={about.imageUrl}
        alt="L'équipe du salon Mawazo"
        brief="l'équipe au travail dans le salon (format vertical)"
        className="aspect-[4/5] md:order-none"
        sizes="(min-width: 768px) 38vw, 100vw"
      />
      <div data-reveal>
        {about.title && (
          <h2 className="font-display text-5xl leading-none font-medium tracking-tight md:text-6xl">
            {about.title}
          </h2>
        )}
        <p className="font-display text-ink/90 mt-8 text-2xl leading-snug md:text-[1.9rem]">
          {about.body}
        </p>
      </div>
    </section>
  )
}
