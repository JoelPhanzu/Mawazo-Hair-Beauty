/**
 * Remplit une base vide avec les contenus de départ (src/db/seed-data.ts)
 * et crée le premier compte administrateur à partir de SEED_OWNER_* (.env.local).
 * Sans effet si la base contient déjà des paramètres.
 *
 *   npm run db:migrate && npm run db:seed
 */
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../src/db/schema'
import {
  seedPageSections,
  seedPost,
  seedProductCategories,
  seedProducts,
  seedPromotions,
  seedServiceCategories,
  seedServices,
  seedSettings,
} from '../src/db/seed-data'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL manquante dans .env.local')

const pool = mysql.createPool({ uri: url, timezone: 'Z', connectionLimit: 1 })
const db = drizzle(pool, { schema, mode: 'default' })

async function main() {
  const existing = await db.select({ id: schema.settings.id }).from(schema.settings).limit(1)
  if (existing.length > 0) {
    console.log('La base contient déjà des données : rien à faire.')
    return
  }

  await db.insert(schema.settings).values({ id: 1, ...seedSettings, defaultCurrency: 'CDF' })

  const serviceCategoryIds: Record<string, string> = Object.fromEntries(
    seedServiceCategories.map((c) => [c.key, crypto.randomUUID()]),
  )
  await db.insert(schema.serviceCategories).values(
    seedServiceCategories.map((c, i) => ({
      id: serviceCategoryIds[c.key],
      name: c.name,
      slug: c.slug,
      position: i + 1,
    })),
  )
  await db.insert(schema.services).values(
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
  await db.insert(schema.productCategories).values(
    seedProductCategories.map((c, i) => ({
      id: productCategoryIds[c.key],
      name: c.name,
      slug: c.slug,
      position: i + 1,
    })),
  )
  await db.insert(schema.products).values(
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

  await db.insert(schema.promotions).values(seedPromotions)
  await db.insert(schema.pageSections).values(seedPageSections)
  // Seul le résumé de l'article existe : il reste en brouillon.
  await db.insert(schema.posts).values({ ...seedPost, content: null, publishedAt: null })

  const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_OWNER_PASSWORD
  if (email && password) {
    if (password.length < 10) throw new Error('SEED_OWNER_PASSWORD : 10 caractères minimum')
    await db.insert(schema.users).values({
      email,
      fullName: process.env.SEED_OWNER_NAME?.trim() || 'Gérante',
      passwordHash: await bcrypt.hash(password, 12),
      role: 'owner',
    })
    console.log(`Compte administrateur créé : ${email}`)
  } else {
    console.log('SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD absents : aucun compte créé.')
  }

  console.log('Base remplie.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
