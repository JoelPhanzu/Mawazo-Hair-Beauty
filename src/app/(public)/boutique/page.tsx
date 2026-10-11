import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { PageHeader } from '@/components/public/PageHeader'
import { ProductCard } from '@/components/public/ProductCard'
import {
  getPageSections,
  getProductCategories,
  getPromotions,
  getPublishedProducts,
} from '@/lib/data/public'
import { productPrice } from '@/lib/pricing/items'

export const metadata: Metadata = {
  title: 'Boutique',
  description:
    'Wings, perruques, chaussures dames et kits beauté. Commande sur WhatsApp, livraison à Kinshasa ou retrait au salon.',
}

async function Catalog({ searchParams }: Pick<PageProps<'/boutique'>, 'searchParams'>) {
  const { categorie } = await searchParams
  await connection()
  const now = new Date()
  const [products, categories, promotions] = await Promise.all([
    getPublishedProducts(),
    getProductCategories(),
    getPromotions(),
  ])

  const visibleCategories = categories.filter((c) => products.some((p) => p.categoryId === c.id))
  const active = visibleCategories.find((c) => c.slug === categorie)
  const shown = active ? products.filter((p) => p.categoryId === active.id) : products

  const pill = (selected: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium transition ${
      selected ? 'bg-ink text-cream border-ink' : 'border-line hover:border-ink'
    }`

  return (
    <>
      {visibleCategories.length > 1 && (
        <nav
          aria-label="Catégories"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
        >
          <Link
            href="/boutique"
            className={pill(!active)}
            aria-current={!active ? 'page' : undefined}
          >
            Tout
          </Link>
          {visibleCategories.map((c) => (
            <Link
              key={c.id}
              href={`/boutique?categorie=${c.slug}`}
              className={pill(active?.id === c.id)}
              aria-current={active?.id === c.id ? 'page' : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      {shown.length === 0 ? (
        <p className="text-ink-soft mt-10">Aucun produit dans cette catégorie pour le moment.</p>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
          {shown.map((product) => (
            <li key={product.id} data-reveal>
              <ProductCard product={product} price={productPrice(product, promotions, now)} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default async function ShopPage({ searchParams }: PageProps<'/boutique'>) {
  const { shop_intro: intro } = await getPageSections()
  return (
    <>
      <PageHeader title={intro?.title ?? 'Notre Boutique'} intro={intro?.body} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <Suspense fallback={<div className="bg-cream-deep h-96 animate-pulse" />}>
          <Catalog searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  )
}
