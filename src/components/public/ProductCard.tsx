import Link from 'next/link'
import type { EffectivePrice } from '@/lib/pricing/types'
import type { Product } from '@/types/content'
import { AddToCart } from './cart/AddToCart'
import { PhotoSlot } from './PhotoSlot'
import { PriceTag } from './PriceTag'

export function ProductCard({ product, price }: { product: Product; price: EffectivePrice }) {
  return (
    <article className="flex h-full flex-col">
      <Link href={`/boutique/${product.slug}`} className="group block overflow-hidden">
        <PhotoSlot
          src={product.images[0]}
          alt={product.name}
          brief={`photo produit ${product.name}`}
          className="aspect-[4/5] transition duration-700 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 50vw"
        />
      </Link>
      <h3 className="font-display mt-4 text-2xl leading-tight font-semibold">
        <Link href={`/boutique/${product.slug}`} className="hover:text-accent">
          {product.name}
        </Link>
      </h3>
      <PriceTag price={price} className="mt-1" />
      <div className="mt-auto pt-4">
        <AddToCart
          compact
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
    </article>
  )
}
