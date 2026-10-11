import type { Metadata } from 'next'
import { BeforeAfter } from '@/components/public/BeforeAfter'
import { ButtonLink } from '@/components/public/ButtonLink'
import { PageHeader } from '@/components/public/PageHeader'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { getGalleryItems, getPageSections } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Avant / Après',
  description: 'Les transformations réalisées au salon Mawazo Hair & Beauty, à Kinshasa.',
}

export default async function GalleryPage() {
  const [items, { gallery_intro: intro }] = await Promise.all([
    getGalleryItems(),
    getPageSections(),
  ])

  return (
    <>
      <PageHeader title={intro?.title ?? 'Avant / Après'} intro={intro?.body} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        {items.length === 0 ? (
          <div className="border-line border p-6 md:p-10">
            <p className="font-display text-3xl">Nos transformations arrivent très bientôt.</p>
            <ButtonLink href="/reservation" className="mt-6">
              Prendre rendez-vous
            </ButtonLink>
          </div>
        ) : (
          <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2">
            {items.map((item) => (
              <li key={item.id} data-reveal>
                <figure>
                  {item.beforeImageUrl ? (
                    <BeforeAfter
                      beforeSrc={item.beforeImageUrl}
                      afterSrc={item.afterImageUrl}
                      alt={item.title ?? 'Transformation'}
                      className="aspect-[4/5] w-full"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  ) : (
                    <PhotoSlot
                      src={item.afterImageUrl}
                      alt={item.title ?? 'Réalisation du salon'}
                      brief=""
                      className="aspect-[4/5] w-full"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  )}
                  {(item.title || item.caption) && (
                    <figcaption className="mt-3">
                      {item.title && (
                        <span className="font-display text-2xl font-semibold">{item.title}</span>
                      )}
                      {item.caption && <p className="text-ink-soft text-sm">{item.caption}</p>}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
