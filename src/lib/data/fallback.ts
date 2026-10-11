/**
 * Contenus de repli, construits à partir de src/db/seed-data.ts.
 * Utilisés uniquement tant que DATABASE_URL n'est pas renseignée (développement local).
 */
import {
  seedPageSections,
  seedProductCategories,
  seedProducts,
  seedPromotions,
  seedServiceCategories,
  seedServices,
  seedSettings,
} from '@/db/seed-data'
import type {
  Category,
  PageSection,
  Product,
  PromotionCard,
  Service,
  SiteSettings,
} from '@/types/content'

export const fallbackSettings: SiteSettings = seedSettings

export const fallbackServiceCategories: Category[] = seedServiceCategories.map((c) => ({
  id: `seed-${c.key}`,
  name: c.name,
  slug: c.slug,
  imageUrl: null,
}))

export const fallbackServices: Service[] = seedServices.map(({ category, ...s }, i) => ({
  ...s,
  id: `seed-${s.slug}`,
  categoryId: `seed-${category}`,
  currency: 'CDF',
  priceIsFrom: true,
  imageUrl: null,
  gallery: [],
  isFeatured: i < 4,
}))

export const fallbackProductCategories: Category[] = seedProductCategories.map((c) => ({
  id: `seed-${c.key}`,
  name: c.name,
  slug: c.slug,
  imageUrl: null,
}))

export const fallbackProducts: Product[] = seedProducts.map(
  ([category, name, slug, description, priceAmount], i) => ({
    id: `seed-${slug}`,
    slug,
    name,
    description,
    categoryId: `seed-${category}`,
    priceAmount,
    currency: 'CDF',
    compareAtAmount: null,
    stock: null,
    variants: {},
    images: [],
    isFeatured: i % 2 === 0,
  }),
)

export const fallbackPromotions: PromotionCard[] = seedPromotions.map((p, i) => ({
  id: `seed-promo-${i}`,
  title: p.title,
  subtitle: p.subtitle ?? null,
  description: p.description ?? null,
  badge: p.badge ?? null,
  bannerUrl: null,
  ctaLabel: p.ctaLabel ?? null,
  ctaHref: p.ctaHref ?? null,
  showBanner: p.showBanner ?? false,
  discountType: p.discountType,
  discountValue: p.discountValue ?? 0,
  scope: p.scope,
  targets: [],
  startsAt: null,
  endsAt: null,
  weekdays: p.weekdays ?? null,
  isActive: p.isActive ?? false,
  priority: p.priority ?? 0,
}))

export const fallbackPageSections: PageSection[] = seedPageSections.map((s) => ({
  key: s.key,
  title: s.title ?? null,
  subtitle: s.subtitle ?? null,
  body: s.body ?? null,
  imageUrl: null,
  secondaryImageUrl: null,
  buttonLabel: s.buttonLabel ?? null,
  buttonHref: s.buttonHref ?? null,
}))
