import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/ssr'
import { AddToCart } from '@/components/public/cart/AddToCart'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { PriceTag } from '@/components/public/PriceTag'
import { getProductBySlug, getPromotions, getPublishedProducts } from '@/lib/data/public'
import { productPrice } from '@/lib/pricing/items'
import { slugParams } from '@/lib/static-params'

export async function generateStaticParams() {
  return slugParams((await getPublishedProducts()).map((p) => p.slug))
}

export async function generateMetadata({
  params,
}: PageProps<'/boutique/[slug]'>): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  }
}

/** Prix et ajout au panier : calculés à la requête (promotions du jour). */
async function Purchase({ slug }: { slug: string }) {
  await connection()
  const [product, promotions] = await Promise.all([getProductBySlug(slug), getPromotions()])
  if (!product) return null
  const price = productPrice(product, promotions, new Date())
  return (
    <>
      <PriceTag price={price} className="text-xl" />
      <div className="mt-8">
        <AddToCart
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.images[0] ?? null,
            unitAmount: price.amount,
            currency: price.currency,
            variants: product.variants,
            outOfStock: product.stock === 0,
          }}
        />
      </div>
    </>
  )
}

async function ProductDetail({ params }: Pick<PageProps<'/boutique/[slug]'>, 'params'>) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  const [cover, ...others] = product.images

  return (
    <article className="mx-auto max-w-[1320px] px-4 pt-8 pb-24 md:px-8">
      <Link
        href="/boutique"
        className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} aria-hidden />
        Toute la boutique
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-3">
          <PhotoSlot
            src={cover}
            alt={product.name}
            brief={`photo produit ${product.name}`}
            className="aspect-[4/5]"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          {others.length > 0 && (
            <ul className="grid grid-cols-3 gap-3">
              {others.map((src) => (
                <li key={src} className="relative aspect-square overflow-hidden">
                  <Image src={src} alt={product.name} fill sizes="16vw" className="object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:pt-8">
          <h1 className="rise font-display text-5xl leading-none font-medium tracking-tight md:text-6xl">
            {product.name}
          </h1>
          <div className="mt-6">
            <Suspense fallback={<div className="bg-cream-deep h-40 animate-pulse" />}>
              <Purchase slug={slug} />
            </Suspense>
          </div>
          {product.description && (
            <p className="mt-10 max-w-[52ch] text-lg">{product.description}</p>
          )}
          <p className="text-ink-soft mt-8 max-w-[52ch] text-sm">
            Commande confirmée sur WhatsApp. Paiement à la livraison, par mobile money ou au salon.
          </p>
        </div>
      </div>
    </article>
  )
}

export default function ProductPage({ params }: PageProps<'/boutique/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1320px]" />}>
      <ProductDetail params={params} />
    </Suspense>
  )
}
