import type { Product, Service } from '@/types/content'
import { getEffectivePrice } from '.'
import type { EffectivePrice, PricedItem, Promotion } from './types'

export function serviceItem(service: Service): PricedItem {
  return {
    kind: 'service',
    id: service.id,
    categoryId: service.categoryId,
    priceAmount: service.priceAmount,
    currency: service.currency,
  }
}

export function productItem(product: Product): PricedItem {
  return {
    kind: 'product',
    id: product.id,
    categoryId: product.categoryId,
    priceAmount: product.priceAmount,
    currency: product.currency,
  }
}

export function servicePrice(service: Service, promotions: Promotion[], now: Date): EffectivePrice {
  return getEffectivePrice(serviceItem(service), promotions, now)
}

/** Prix d'un produit ; un « prix barré » saisi à la main sert de prix de référence affiché. */
export function productPrice(product: Product, promotions: Promotion[], now: Date): EffectivePrice {
  const price = getEffectivePrice(productItem(product), promotions, now)
  if (
    !price.appliedPromotion &&
    product.compareAtAmount &&
    product.compareAtAmount > price.amount
  ) {
    return { ...price, baseAmount: product.compareAtAmount }
  }
  return price
}
