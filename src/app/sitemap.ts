import type { MetadataRoute } from 'next'
import { getPublishedPosts, getPublishedProducts, getPublishedServices } from '@/lib/data/public'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, products, posts] = await Promise.all([
    getPublishedServices(),
    getPublishedProducts(),
    getPublishedPosts(),
  ])
  const pages = [
    '',
    '/prestations',
    '/boutique',
    '/promotions',
    '/galerie',
    '/blog',
    '/contact',
    '/reservation',
  ]
  return [
    ...pages.map((path) => ({ url: `${SITE}${path}`, changeFrequency: 'weekly' as const })),
    ...services.map((s) => ({ url: `${SITE}/prestations/${s.slug}` })),
    ...products.map((p) => ({ url: `${SITE}/boutique/${p.slug}` })),
    ...posts.map((p) => ({ url: `${SITE}/blog/${p.slug}`, lastModified: p.publishedAt })),
  ]
}
