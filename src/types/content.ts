import type { PaymentNumber, ProductVariants, SocialLinks } from '@/db/schema'
import type { Currency, Promotion } from '@/lib/pricing/types'

export interface SiteSettings {
  businessName: string
  tagline: string | null
  phone: string | null
  whatsappNumber: string
  emails: string[]
  address: string | null
  googleMapsUrl: string | null
  /** Clé = jour en français (« lundi »), valeur = horaire affiché. */
  openingHours: Record<string, string>
  socialLinks: SocialLinks
  paymentNumbers: PaymentNumber[]
}

export interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
}

export interface Service {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  longDescription: string | null
  categoryId: string | null
  durationMinMinutes: number | null
  durationMaxMinutes: number | null
  priceAmount: number
  currency: Currency
  priceIsFrom: boolean
  imageUrl: string | null
  gallery: string[]
  isFeatured: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  categoryId: string | null
  priceAmount: number
  currency: Currency
  compareAtAmount: number | null
  stock: number | null
  variants: ProductVariants
  images: string[]
  isFeatured: boolean
}

/** Promotion avec ses textes d'affichage (bannière, page Promotions). */
export interface PromotionCard extends Promotion {
  subtitle: string | null
  description: string | null
  badge: string | null
  bannerUrl: string | null
  ctaLabel: string | null
  ctaHref: string | null
  showBanner: boolean
}

export interface GalleryItem {
  id: string
  title: string | null
  beforeImageUrl: string | null
  afterImageUrl: string
  caption: string | null
  isFeatured: boolean
}

export interface Testimonial {
  id: string
  displayName: string
  body: string
  rating: number | null
  serviceName: string | null
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  imageUrl: string | null
  category: string | null
  readingMinutes: number | null
  /** ISO 8601 */
  publishedAt: string
  seoTitle: string | null
  seoDescription: string | null
}

export interface PageSection {
  key: string
  title: string | null
  subtitle: string | null
  body: string | null
  imageUrl: string | null
  secondaryImageUrl: string | null
  buttonLabel: string | null
  buttonHref: string | null
}
