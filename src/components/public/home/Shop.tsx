import Link from 'next/link'
import { getPageSections, getProductCategories, getPublishedProducts } from '@/lib/data/public'
import { ButtonLink } from '../ButtonLink'
import { PhotoSlot } from '../PhotoSlot'

export async function Shop() {
  const [categories, products, { home_shop: section }] = await Promise.all([
    getProductCategories(),
    getPublishedProducts(),
    getPageSections(),
  ])
  // Seules les catégories qui ont des produits publiés.
  const shown = categories.filter((c) => products.some((p) => p.categoryId === c.id)).slice(0, 4)
  if (shown.length === 0) return null

  return (
    <section className="border-line bg-cream-deep border-y">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[0.8fr_2fr] lg:items-start">
        <div data-reveal className="lg:sticky lg:top-28">
          <h2 className="font-display text-5xl leading-none font-medium tracking-tight md:text-6xl">
            {section?.title ?? 'La boutique'}
          </h2>
          {section?.body && <p className="text-ink-soft mt-5 max-w-[34ch]">{section.body}</p>}
          <ButtonLink href={section?.buttonHref ?? '/boutique'} variant="outline" className="mt-8">
            {section?.buttonLabel ?? 'Voir la boutique'}
          </ButtonLink>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0">
          {shown.map((category, i) => {
            // Image de la catégorie, sinon celle de son premier produit.
            const image =
              category.imageUrl ??
              products.find((p) => p.categoryId === category.id && p.images[0])?.images[0]
            return (
              <li
                key={category.id}
                data-reveal
                className={`w-[70%] shrink-0 snap-start md:w-auto ${i % 2 === 1 ? 'md:translate-y-12' : ''}`}
              >
                <Link href={`/boutique?categorie=${category.slug}`} className="group block">
                  <div className="overflow-hidden">
                    <PhotoSlot
                      src={image}
                      alt={category.name}
                      brief={`produits ${category.name.toLowerCase()}`}
                      className="aspect-[4/5] transition duration-700 group-hover:scale-[1.03] md:aspect-[5/4]"
                      sizes="(min-width: 768px) 33vw, 70vw"
                    />
                  </div>
                  <h3 className="font-display group-hover:text-accent mt-4 text-2xl font-semibold transition-colors">
                    {category.name}
                  </h3>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
