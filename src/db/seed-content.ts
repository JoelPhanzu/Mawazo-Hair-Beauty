/**
 * Remplit une base vide avec les contenus de départ (seed-data.ts).
 * Utilisé au démarrage du site (bootstrap.ts) et par le script db/seed.ts.
 */
import type { MySql2Database } from 'drizzle-orm/mysql2'
import * as schema from './schema'
import {
  seedPageSections,
  seedPost,
  seedProductCategories,
  seedProducts,
  seedPromotions,
  seedServiceCategories,
  seedServices,
  seedSettings,
} from './seed-data'

/** Renvoie false si la base contenait déjà des paramètres (rien n'est modifié). */
export async function seedContentIfEmpty(db: MySql2Database<typeof schema>): Promise<boolean> {
  const existing = await db.select({ id: schema.settings.id }).from(schema.settings).limit(1)
  if (existing.length > 0) return false

  await db.transaction(async (tx) => {
    await tx.insert(schema.settings).values({ id: 1, ...seedSettings, defaultCurrency: 'CDF' })

    const serviceCategoryIds: Record<string, string> = Object.fromEntries(
      seedServiceCategories.map((c) => [c.key, crypto.randomUUID()]),
    )
    await tx.insert(schema.serviceCategories).values(
      seedServiceCategories.map((c, i) => ({
        id: serviceCategoryIds[c.key],
        name: c.name,
        slug: c.slug,
        position: i + 1,
      })),
    )
    await tx.insert(schema.services).values(
      seedServices.map(({ category, ...s }, i) => ({
        ...s,
        categoryId: serviceCategoryIds[category],
        currency: 'CDF' as const,
        priceIsFrom: true,
        gallery: [],
        isPublished: true,
        isFeatured: i < 4,
        position: i + 1,
      })),
    )

    const productCategoryIds: Record<string, string> = Object.fromEntries(
      seedProductCategories.map((c) => [c.key, crypto.randomUUID()]),
    )
    await tx.insert(schema.productCategories).values(
      seedProductCategories.map((c, i) => ({
        id: productCategoryIds[c.key],
        name: c.name,
        slug: c.slug,
        position: i + 1,
      })),
    )
    await tx.insert(schema.products).values(
      seedProducts.map(([category, name, slug, description, priceAmount], i) => ({
        categoryId: productCategoryIds[category],
        name,
        slug,
        description,
        priceAmount,
        currency: 'CDF' as const,
        variants: {},
        images: [],
        isPublished: true,
        isFeatured: i % 2 === 0,
        position: i + 1,
      })),
    )

    await tx.insert(schema.promotions).values(seedPromotions)
    await tx.insert(schema.pageSections).values(seedPageSections)
    // Seul le résumé de l'article existe : il reste en brouillon.
    await tx.insert(schema.posts).values({ ...seedPost, content: null, publishedAt: null })
  })
  return true
}
