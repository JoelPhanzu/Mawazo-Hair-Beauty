import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/ssr'
import { getGalleryItems, getPageSections } from '@/lib/data/public'
import { BeforeAfter } from '../BeforeAfter'
import { PhotoSlot } from '../PhotoSlot'

/** Avant / après de l'accueil : réalisations mises en avant depuis l'admin. */
export async function Gallery() {
  const [items, { home_gallery: section }] = await Promise.all([
    getGalleryItems(),
    getPageSections(),
  ])
  const shown = (items.some((i) => i.isFeatured) ? items.filter((i) => i.isFeatured) : items).slice(
    0,
    3,
  )
  if (shown.length === 0) return null

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-20 md:px-8 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div data-reveal>
          <h2 className="font-display text-5xl leading-none font-medium tracking-tight md:text-6xl">
            {section?.title ?? 'Avant / Après'}
          </h2>
          {section?.body && <p className="text-ink-soft mt-4 max-w-[48ch]">{section.body}</p>}
        </div>
        <Link
          href="/galerie"
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          Toutes nos transformations
          <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>

      {/* 1 réalisation : pleine largeur. 2 ou 3 : la première plus grande. */}
      <ul
        className={`mt-10 grid gap-4 md:gap-6 ${
          shown.length === 1
            ? ''
            : shown.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-[1.4fr_1fr]'
        }`}
      >
        {shown.map((item, i) => (
          <li
            key={item.id}
            data-reveal
            className={shown.length === 3 && i === 0 ? 'md:row-span-2' : ''}
          >
            <figure className="flex h-full flex-col">
              {item.beforeImageUrl ? (
                <BeforeAfter
                  beforeSrc={item.beforeImageUrl}
                  afterSrc={item.afterImageUrl}
                  alt={item.title ?? 'Transformation'}
                  className={`w-full grow ${shown.length === 3 && i === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              ) : (
                <PhotoSlot
                  src={item.afterImageUrl}
                  alt={item.title ?? 'Réalisation du salon'}
                  brief=""
                  className="aspect-[4/3] w-full grow"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              )}
              {(item.title || item.caption) && (
                <figcaption className="mt-3 text-sm">
                  {item.title && <span className="font-semibold">{item.title}</span>}
                  {item.caption && <span className="text-ink-soft"> {item.caption}</span>}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
