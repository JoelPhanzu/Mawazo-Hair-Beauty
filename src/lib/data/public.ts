/**
 * Lectures publiques, mises en cache (Cache Components).
 * L'admin invalide ces données avec revalidateTag(<étiquette>) après chaque enregistrement.
 * Les prix effectifs ne sont PAS calculés ici : ils dépendent de l'heure de Kinshasa
 * et sont calculés à la requête avec getEffectivePrice().
 */
import 'server-only'
import { and, asc, desc, eq, isNotNull, lte } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import type {
  Category,
  GalleryItem,
  PageSection,
  Post,
  Product,
  PromotionCard,
  Service,
  SiteSettings,
  Testimonial,
} from '@/types/content'
import {
  fallbackPageSections,
  fallbackProductCategories,
  fallbackProducts,
  fallbackPromotions,
  fallbackServiceCategories,
  fallbackServices,
  fallbackSettings,
} from './fallback'

export const CACHE_TAGS = {
  settings: 'settings',
  services: 'services',
  products: 'products',
  promotions: 'promotions',
  gallery: 'gallery',
  testimonials: 'testimonials',
  posts: 'posts',
  pageSections: 'page-sections',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/**
 * Lecture en base avec durée de cache adaptée.
 * Pendant le build seulement, si la base est injoignable (environnement de build isolé),
 * on prérend avec les contenus de départ, revalidés chaque minute : la vraie base
 * prend le relais dès la mise en ligne. En fonctionnement normal, une erreur reste une erreur.
 */
async function fromDb<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDatabaseConfigured()) {
    cacheLife('hours')
    return fallback
  }
  try {
    const value = await read()
    cacheLife('hours')
    return value
  } catch (error) {
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw error
    console.warn(
      '[build] base injoignable, contenus de départ utilisés :',
      (error as Error).message,
    )
    cacheLife('minutes')
    return fallback
  }
}

// ---------------------------------------------------------------------------
// Paramètres
// ---------------------------------------------------------------------------

export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache'
  cacheTag(CACHE_TAGS.settings)
  return fromDb(async () => {
    const [row] = await getDb().select().from(schema.settings).where(eq(schema.settings.id, 1))
    if (!row) throw new Error('Paramètres introuvables : lancer « npm run db:seed »')
    return {
      businessName: row.businessName,
      tagline: row.tagline,
      phone: row.phone,
      whatsappNumber: row.whatsappNumber,
      emails: row.emails,
      address: row.address,
      googleMapsUrl: row.googleMapsUrl,
      openingHours: row.openingHours,
      socialLinks: row.socialLinks,
      paymentNumbers: row.paymentNumbers,
    }
  }, fallbackSettings)
}

// ---------------------------------------------------------------------------
// Prestations
// ---------------------------------------------------------------------------

export async function getServiceCategories(): Promise<Category[]> {
  'use cache'
  cacheTag(CACHE_TAGS.services)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.serviceCategories.id,
        name: schema.serviceCategories.name,
        slug: schema.serviceCategories.slug,
        imageUrl: schema.serviceCategories.imageUrl,
      })
      .from(schema.serviceCategories)
      .orderBy(asc(schema.serviceCategories.position))
  }, fallbackServiceCategories)
}

export async function getPublishedServices(): Promise<Service[]> {
  'use cache'
  cacheTag(CACHE_TAGS.services)
  return fromDb(async () => {
    const rows = await getDb()
      .select()
      .from(schema.services)
      .where(eq(schema.services.isPublished, true))
      .orderBy(asc(schema.services.position))
    return rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      shortDescription: s.shortDescription,
      longDescription: s.longDescription,
      categoryId: s.categoryId,
      durationMinMinutes: s.durationMinMinutes,
      durationMaxMinutes: s.durationMaxMinutes,
      priceAmount: s.priceAmount,
      currency: s.currency,
      priceIsFrom: s.priceIsFrom,
      imageUrl: s.imageUrl,
      gallery: s.gallery,
      isFeatured: s.isFeatured,
    }))
  }, fallbackServices)
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const services = await getPublishedServices()
  return services.find((s) => s.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Boutique
// ---------------------------------------------------------------------------

export async function getProductCategories(): Promise<Category[]> {
  'use cache'
  cacheTag(CACHE_TAGS.products)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.productCategories.id,
        name: schema.productCategories.name,
        slug: schema.productCategories.slug,
        imageUrl: schema.productCategories.imageUrl,
      })
      .from(schema.productCategories)
      .orderBy(asc(schema.productCategories.position))
  }, fallbackProductCategories)
}

export async function getPublishedProducts(): Promise<Product[]> {
  'use cache'
  cacheTag(CACHE_TAGS.products)
  return fromDb(async () => {
    const rows = await getDb()
      .select()
      .from(schema.products)
      .where(eq(schema.products.isPublished, true))
      .orderBy(asc(schema.products.position))
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      priceAmount: p.priceAmount,
      currency: p.currency,
      compareAtAmount: p.compareAtAmount,
      stock: p.stock,
      variants: p.variants,
      images: p.images,
      isFeatured: p.isFeatured,
    }))
  }, fallbackProducts)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getPublishedProducts()
  return products.find((p) => p.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Promotions (activées ; les dates et jours sont vérifiés à la requête)
// ---------------------------------------------------------------------------

export async function getPromotions(): Promise<PromotionCard[]> {
  'use cache'
  cacheTag(CACHE_TAGS.promotions)
  return fromDb(async () => {
    const db = getDb()
    const [rows, targets] = await Promise.all([
      db
        .select()
        .from(schema.promotions)
        .where(eq(schema.promotions.isActive, true))
        .orderBy(asc(schema.promotions.position)),
      db.select().from(schema.promotionTargets),
    ])
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      badge: p.badge,
      bannerUrl: p.bannerUrl,
      ctaLabel: p.ctaLabel,
      ctaHref: p.ctaHref,
      showBanner: p.showBanner,
      discountType: p.discountType,
      discountValue: p.discountValue,
      scope: p.scope,
      targets: targets
        .filter((t) => t.promotionId === p.id)
        .map((t) => ({ targetType: t.targetType, targetId: t.targetId })),
      startsAt: p.startsAt?.toISOString() ?? null,
      endsAt: p.endsAt?.toISOString() ?? null,
      weekdays: p.weekdays,
      isActive: p.isActive,
      priority: p.priority,
    }))
  }, fallbackPromotions)
}

// ---------------------------------------------------------------------------
// Galerie avant / après, avis
// ---------------------------------------------------------------------------

export async function getGalleryItems(): Promise<GalleryItem[]> {
  'use cache'
  cacheTag(CACHE_TAGS.gallery)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.galleryItems.id,
        title: schema.galleryItems.title,
        beforeImageUrl: schema.galleryItems.beforeImageUrl,
        afterImageUrl: schema.galleryItems.afterImageUrl,
        caption: schema.galleryItems.caption,
        isFeatured: schema.galleryItems.isFeatured,
      })
      .from(schema.galleryItems)
      .where(eq(schema.galleryItems.isPublished, true))
      .orderBy(asc(schema.galleryItems.position))
  }, [])
}

/** Seuls les avis publiés AVEC l'accord de la cliente sont visibles. */
export async function getTestimonials(): Promise<Testimonial[]> {
  'use cache'
  cacheTag(CACHE_TAGS.testimonials)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.testimonials.id,
        displayName: schema.testimonials.displayName,
        body: schema.testimonials.body,
        rating: schema.testimonials.rating,
        serviceName: schema.services.name,
      })
      .from(schema.testimonials)
      .leftJoin(schema.services, eq(schema.testimonials.serviceId, schema.services.id))
      .where(
        and(
          eq(schema.testimonials.isPublished, true),
          eq(schema.testimonials.consentObtained, true),
        ),
      )
      .orderBy(asc(schema.testimonials.position))
  }, [])
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function getPublishedPosts(): Promise<Post[]> {
  'use cache'
  cacheTag(CACHE_TAGS.posts)
  return fromDb(async () => {
    // Dans un cache : un article programmé apparaît au plus tard à l'expiration du cache.
    const rows = await getDb()
      .select()
      .from(schema.posts)
      .where(and(isNotNull(schema.posts.publishedAt), lte(schema.posts.publishedAt, new Date())))
      .orderBy(desc(schema.posts.publishedAt))
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      imageUrl: p.imageUrl,
      category: p.category,
      readingMinutes: p.readingMinutes,
      publishedAt: p.publishedAt!.toISOString(),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    }))
  }, [])
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPublishedPosts()
  return posts.find((p) => p.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Textes des pages
// ---------------------------------------------------------------------------

export async function getPageSections(): Promise<Record<string, PageSection>> {
  'use cache'
  cacheTag(CACHE_TAGS.pageSections)

  const rows = await fromDb<PageSection[]>(
    () =>
      getDb()
        .select({
          key: schema.pageSections.key,
          title: schema.pageSections.title,
          subtitle: schema.pageSections.subtitle,
          body: schema.pageSections.body,
          imageUrl: schema.pageSections.imageUrl,
          secondaryImageUrl: schema.pageSections.secondaryImageUrl,
          buttonLabel: schema.pageSections.buttonLabel,
          buttonHref: schema.pageSections.buttonHref,
        })
        .from(schema.pageSections),
    fallbackPageSections,
  )
  return Object.fromEntries(rows.map((s) => [s.key, s]))
}
