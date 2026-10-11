import { describe, expect, it } from 'vitest'
import {
  getActivePromotions,
  getEffectivePrice,
  getKinshasaWeekday,
  roundDiscountedAmount,
  type PricedItem,
  type Promotion,
} from '.'

const braids: PricedItem = {
  kind: 'service',
  id: 'svc-braids',
  categoryId: 'cat-coiffure',
  priceAmount: 25000,
  currency: 'CDF',
}

const wing: PricedItem = {
  kind: 'product',
  id: 'prd-wing',
  categoryId: 'cat-wings',
  priceAmount: 75000,
  currency: 'CDF',
}

function promo(overrides: Partial<Promotion>): Promotion {
  return {
    id: 'promo',
    title: 'Promo',
    discountType: 'percentage',
    discountValue: 20,
    scope: 'all_services',
    targets: [],
    startsAt: null,
    endsAt: null,
    weekdays: null,
    isActive: true,
    priority: 0,
    ...overrides,
  }
}

// Le 13 octobre 2026 est un mardi. Kinshasa = UTC+1, sans heure d'été.
const TUESDAY_NOON = new Date('2026-10-13T11:00:00Z')
const WEDNESDAY_NOON = new Date('2026-10-14T11:00:00Z')

const mardiPromo = promo({ id: 'mardi', title: 'Mardi Promo', weekdays: [2] })

describe('getKinshasaWeekday', () => {
  it('renvoie le jour ISO à l’heure de Kinshasa', () => {
    expect(getKinshasaWeekday(TUESDAY_NOON)).toBe(2)
    expect(getKinshasaWeekday(WEDNESDAY_NOON)).toBe(3)
    expect(getKinshasaWeekday(new Date('2026-10-11T11:00:00Z'))).toBe(7)
  })
})

describe('getEffectivePrice', () => {
  it('applique le Mardi Promo le mardi', () => {
    const price = getEffectivePrice(braids, [mardiPromo], TUESDAY_NOON)
    expect(price.amount).toBe(20000)
    expect(price.baseAmount).toBe(25000)
    expect(price.discountAmount).toBe(5000)
    expect(price.appliedPromotion?.id).toBe('mardi')
  })

  it('n’applique pas le Mardi Promo le mercredi', () => {
    const price = getEffectivePrice(braids, [mardiPromo], WEDNESDAY_NOON)
    expect(price.amount).toBe(25000)
    expect(price.appliedPromotion).toBeNull()
  })

  it('bascule à minuit heure de Kinshasa, pas à minuit UTC', () => {
    // Lundi 23h30 UTC = mardi 00h30 à Kinshasa : promo active.
    expect(getEffectivePrice(braids, [mardiPromo], new Date('2026-10-12T23:30:00Z')).amount).toBe(
      20000,
    )
    // Lundi 22h30 UTC = lundi 23h30 à Kinshasa : pas encore.
    expect(getEffectivePrice(braids, [mardiPromo], new Date('2026-10-12T22:30:00Z')).amount).toBe(
      25000,
    )
    // Mardi 23h30 UTC = mercredi 00h30 à Kinshasa : terminée.
    expect(getEffectivePrice(braids, [mardiPromo], new Date('2026-10-13T23:30:00Z')).amount).toBe(
      25000,
    )
  })

  it('ignore une promotion expirée ou pas encore commencée', () => {
    const expired = promo({ endsAt: '2026-10-01T00:00:00Z' })
    const future = promo({ startsAt: '2026-11-01T00:00:00Z' })
    expect(getEffectivePrice(braids, [expired, future], TUESDAY_NOON).amount).toBe(25000)
  })

  it('ignore une promotion désactivée', () => {
    expect(getEffectivePrice(braids, [promo({ isActive: false })], TUESDAY_NOON).amount).toBe(25000)
  })

  it('ne cumule pas : garde la promotion donnant le prix le plus bas', () => {
    const tenPercent = promo({ id: 'p10', discountValue: 10, priority: 99 })
    const thirtyPercent = promo({ id: 'p30', discountValue: 30, priority: 1 })
    const price = getEffectivePrice(braids, [tenPercent, thirtyPercent], TUESDAY_NOON)
    expect(price.amount).toBe(17500)
    expect(price.appliedPromotion?.id).toBe('p30')
  })

  it('à prix égal, garde la priorité la plus haute', () => {
    const percent = promo({ id: 'pct', discountValue: 20, priority: 1 })
    const fixed = promo({
      id: 'fix',
      discountType: 'fixed_amount',
      discountValue: 5000,
      priority: 5,
    })
    expect(getEffectivePrice(braids, [percent, fixed], TUESDAY_NOON).appliedPromotion?.id).toBe(
      'fix',
    )
  })

  it('ne descend jamais sous 0 avec un montant fixe supérieur au prix', () => {
    const huge = promo({ discountType: 'fixed_amount', discountValue: 40000 })
    const price = getEffectivePrice(braids, [huge], TUESDAY_NOON)
    expect(price.amount).toBe(0)
    expect(price.discountAmount).toBe(25000)
  })

  it('arrondit le prix remisé en FC à la centaine inférieure', () => {
    const item = { ...braids, priceAmount: 47650 * 2 }
    const half = promo({ discountValue: 50 })
    expect(getEffectivePrice(item, [half], TUESDAY_NOON).amount).toBe(47600)
  })

  it('ne modifie pas le prix pour une promotion « affichage seul »', () => {
    const packMariee = promo({ discountType: 'display_only', discountValue: 0 })
    const price = getEffectivePrice(braids, [packMariee], TUESDAY_NOON)
    expect(price.amount).toBe(25000)
    expect(price.appliedPromotion).toBeNull()
  })

  it('respecte la portée : prestations, produits, catégorie, articles choisis', () => {
    expect(getEffectivePrice(wing, [promo({ scope: 'all_services' })], TUESDAY_NOON).amount).toBe(
      75000,
    )
    expect(getEffectivePrice(wing, [promo({ scope: 'all_products' })], TUESDAY_NOON).amount).toBe(
      60000,
    )

    const wingsCategory = promo({
      scope: 'product_category',
      targets: [{ targetType: 'product_category', targetId: 'cat-wings' }],
    })
    expect(getEffectivePrice(wing, [wingsCategory], TUESDAY_NOON).amount).toBe(60000)
    expect(getEffectivePrice(braids, [wingsCategory], TUESDAY_NOON).amount).toBe(25000)

    const onlyBraids = promo({
      scope: 'items',
      targets: [{ targetType: 'service', targetId: 'svc-braids' }],
    })
    expect(getEffectivePrice(braids, [onlyBraids], TUESDAY_NOON).amount).toBe(20000)
    expect(getEffectivePrice(wing, [onlyBraids], TUESDAY_NOON).amount).toBe(75000)
  })
})

describe('roundDiscountedAmount', () => {
  it('arrondit les FC à la centaine et les cents USD à l’unité', () => {
    expect(roundDiscountedAmount(47650, 'CDF')).toBe(47600)
    expect(roundDiscountedAmount(1999.7, 'USD')).toBe(1999)
  })
})

describe('getActivePromotions', () => {
  it('inclut les promotions « affichage seul » et trie par priorité', () => {
    const display = promo({ id: 'display', discountType: 'display_only', priority: 1 })
    const active = getActivePromotions([display, { ...mardiPromo, priority: 10 }], TUESDAY_NOON)
    expect(active.map((p) => p.id)).toEqual(['mardi', 'display'])
    expect(getActivePromotions([mardiPromo], WEDNESDAY_NOON)).toEqual([])
  })
})
