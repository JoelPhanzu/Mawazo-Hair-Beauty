import { getPageSections } from '@/lib/data/public'
import { ButtonLink } from '../ButtonLink'

export async function FinalCta() {
  const { home_cta: cta } = await getPageSections()
  if (!cta?.title) return null

  return (
    <section className="px-4 pb-24 md:px-8">
      <div
        data-reveal
        className="border-line mx-auto flex max-w-[1320px] flex-col items-center border px-6 py-16 text-center md:py-24"
      >
        <h2 className="font-display max-w-[16ch] text-5xl leading-[1.02] font-medium tracking-tight md:text-7xl">
          {cta.title}
        </h2>
        {cta.body && <p className="text-ink-soft mt-6 max-w-[46ch] text-lg">{cta.body}</p>}
        <ButtonLink href={cta.buttonHref ?? '/reservation'} className="mt-10 px-10">
          {cta.buttonLabel ?? 'Réserver'}
        </ButtonLink>
      </div>
    </section>
  )
}
