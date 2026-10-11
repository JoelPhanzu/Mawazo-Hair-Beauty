/**
 * Schéma MySQL / MariaDB (Hostinger) de Mawazo Hair & Beauty.
 * Montants : entiers. CDF = francs congolais, USD = cents.
 * Identifiants : UUID texte générés côté serveur.
 * Toute modification passe par `npm run db:generate` (une migration = un fichier SQL).
 */
import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  customType,
  date,
  datetime,
  index,
  int,
  mysqlTable,
  smallint,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

// JSON stocké en texte : fonctionne sur MySQL comme sur MariaDB (où JSON = LONGTEXT).
const jsonText = <T>(name: string) =>
  customType<{ data: T; driverData: string }>({
    dataType: () => 'longtext',
    toDriver: (value) => JSON.stringify(value),
    fromDriver: (value) => (typeof value === 'string' ? JSON.parse(value) : value) as T,
  })(name)

const id = () =>
  varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

const timestamps = {
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .$onUpdateFn(() => new Date()),
}

const currency = () =>
  varchar('currency', { length: 3, enum: ['CDF', 'USD'] })
    .notNull()
    .default('CDF')

// ---------------------------------------------------------------------------
// Administration
// ---------------------------------------------------------------------------

export const users = mysqlTable(
  'users',
  {
    id: id(),
    email: varchar('email', { length: 191 }).notNull(),
    fullName: varchar('full_name', { length: 120 }).notNull(),
    passwordHash: varchar('password_hash', { length: 100 }).notNull(),
    role: varchar('role', { length: 20, enum: ['owner', 'editor', 'lean_admin'] })
      .notNull()
      .default('editor'),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: datetime('last_login_at', { mode: 'date' }),
    ...timestamps,
  },
  (t) => [uniqueIndex('users_email_unique').on(t.email)],
)

export const sessions = mysqlTable(
  'sessions',
  {
    // Empreinte SHA-256 du jeton : le jeton lui-même n'est jamais stocké.
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
    ...timestamps,
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
)

export const passwordResets = mysqlTable('password_resets', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
  ...timestamps,
})

export const auditLog = mysqlTable(
  'audit_log',
  {
    id: id(),
    tableName: varchar('table_name', { length: 64 }).notNull(),
    recordId: varchar('record_id', { length: 36 }),
    action: varchar('action', { length: 10, enum: ['INSERT', 'UPDATE', 'DELETE'] }).notNull(),
    userId: varchar('user_id', { length: 36 }),
    oldValues: jsonText<Record<string, unknown> | null>('old_values'),
    newValues: jsonText<Record<string, unknown> | null>('new_values'),
    ...timestamps,
  },
  (t) => [index('audit_log_record_idx').on(t.tableName, t.recordId)],
)

// ---------------------------------------------------------------------------
// Paramètres (ligne unique, id = 1)
// ---------------------------------------------------------------------------

export type OpeningHours = Record<string, string>
export type SocialLinks = {
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  youtube?: string | null
  snapchat?: string | null
}
export type PaymentNumber = {
  /** Ex. « M-Pesa », « Orange Money », « Airtel Money » */
  provider: string
  number: string
  /** Nom du titulaire affiché au client */
  holder: string
}

export const settings = mysqlTable('settings', {
  id: int('id').primaryKey().default(1),
  businessName: varchar('business_name', { length: 120 }).notNull(),
  tagline: varchar('tagline', { length: 200 }),
  phone: varchar('phone', { length: 20 }),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }).notNull(),
  emails: jsonText<string[]>('emails').notNull(),
  address: varchar('address', { length: 255 }),
  googleMapsUrl: varchar('google_maps_url', { length: 500 }),
  openingHours: jsonText<OpeningHours>('opening_hours').notNull(),
  socialLinks: jsonText<SocialLinks>('social_links').notNull(),
  paymentNumbers: jsonText<PaymentNumber[]>('payment_numbers').notNull(),
  defaultCurrency: currency(),
  // Taux indicatif saisi à la main, jamais récupéré automatiquement.
  usdToCdfRate: int('usd_to_cdf_rate'),
  ...timestamps,
})

// ---------------------------------------------------------------------------
// Médias (images envoyées depuis l'admin, stockées sur le disque du serveur)
// ---------------------------------------------------------------------------

export const media = mysqlTable('media', {
  id: id(),
  // Chemin relatif dans UPLOAD_DIR, ex. « 2026/10/<uuid>.webp »
  path: varchar('path', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  width: int('width'),
  height: int('height'),
  sizeBytes: int('size_bytes').notNull(),
  alt: varchar('alt', { length: 255 }),
  ...timestamps,
})

// ---------------------------------------------------------------------------
// Prestations
// ---------------------------------------------------------------------------

export const serviceCategories = mysqlTable(
  'service_categories',
  {
    id: id(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    position: int('position').notNull().default(0),
    imageUrl: varchar('image_url', { length: 500 }),
    ...timestamps,
  },
  (t) => [uniqueIndex('service_categories_slug_unique').on(t.slug)],
)

export const services = mysqlTable(
  'services',
  {
    id: id(),
    categoryId: varchar('category_id', { length: 36 }).references(() => serviceCategories.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    shortDescription: varchar('short_description', { length: 255 }),
    longDescription: text('long_description'),
    durationMinMinutes: int('duration_min_minutes'),
    durationMaxMinutes: int('duration_max_minutes'),
    priceAmount: int('price_amount').notNull(),
    currency: currency(),
    priceIsFrom: boolean('price_is_from').notNull().default(false),
    imageUrl: varchar('image_url', { length: 500 }),
    gallery: jsonText<string[]>('gallery').notNull(),
    isPublished: boolean('is_published').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    position: int('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('services_slug_unique').on(t.slug),
    check('services_price_positive', sql.raw('`price_amount` >= 0')),
  ],
)

// ---------------------------------------------------------------------------
// Boutique
// ---------------------------------------------------------------------------

export const productCategories = mysqlTable(
  'product_categories',
  {
    id: id(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    position: int('position').notNull().default(0),
    imageUrl: varchar('image_url', { length: 500 }),
    ...timestamps,
  },
  (t) => [uniqueIndex('product_categories_slug_unique').on(t.slug)],
)

/** Ex. { pointure: ['37', '38'], longueur: ['12 pouces'], couleur: ['Noir'] } */
export type ProductVariants = Record<string, string[]>

export const products = mysqlTable(
  'products',
  {
    id: id(),
    categoryId: varchar('category_id', { length: 36 }).references(() => productCategories.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    description: text('description'),
    priceAmount: int('price_amount').notNull(),
    currency: currency(),
    compareAtAmount: int('compare_at_amount'),
    // null = stock non suivi
    stock: int('stock'),
    variants: jsonText<ProductVariants>('variants').notNull(),
    images: jsonText<string[]>('images').notNull(),
    isPublished: boolean('is_published').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    position: int('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('products_slug_unique').on(t.slug),
    check('products_price_positive', sql.raw('`price_amount` >= 0')),
  ],
)

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

export const promotions = mysqlTable('promotions', {
  id: id(),
  title: varchar('title', { length: 120 }).notNull(),
  subtitle: varchar('subtitle', { length: 200 }),
  description: text('description'),
  // Petit libellé mis en avant : « -20% », « Nouveauté », « Populaire »…
  badge: varchar('badge', { length: 40 }),
  bannerUrl: varchar('banner_url', { length: 500 }),
  discountType: varchar('discount_type', {
    length: 20,
    enum: ['percentage', 'fixed_amount', 'display_only'],
  }).notNull(),
  discountValue: int('discount_value').notNull().default(0),
  scope: varchar('scope', {
    length: 20,
    enum: ['all_services', 'all_products', 'service_category', 'product_category', 'items'],
  }).notNull(),
  startsAt: datetime('starts_at', { mode: 'date' }),
  endsAt: datetime('ends_at', { mode: 'date' }),
  // Jours ISO : 1 = lundi … 7 = dimanche. [2] = « Mardi Promo ». null = tous les jours.
  weekdays: jsonText<number[] | null>('weekdays'),
  ctaLabel: varchar('cta_label', { length: 40 }),
  ctaHref: varchar('cta_href', { length: 255 }),
  isActive: boolean('is_active').notNull().default(false),
  showBanner: boolean('show_banner').notNull().default(false),
  priority: int('priority').notNull().default(0),
  position: int('position').notNull().default(0),
  ...timestamps,
})

export const promotionTargets = mysqlTable(
  'promotion_targets',
  {
    id: id(),
    promotionId: varchar('promotion_id', { length: 36 })
      .notNull()
      .references(() => promotions.id, { onDelete: 'cascade' }),
    targetType: varchar('target_type', {
      length: 20,
      enum: ['service', 'product', 'service_category', 'product_category'],
    }).notNull(),
    targetId: varchar('target_id', { length: 36 }).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex('promotion_targets_unique').on(t.promotionId, t.targetType, t.targetId)],
)

// ---------------------------------------------------------------------------
// Réservations
// ---------------------------------------------------------------------------

export const BOOKING_STATUSES = ['nouvelle', 'confirmée', 'annulée', 'honorée', 'absente'] as const

export const bookings = mysqlTable(
  'bookings',
  {
    id: id(),
    // Référence courte lisible, reprise dans le message WhatsApp (ex. R-7K3QF).
    reference: varchar('reference', { length: 12 }).notNull(),
    customerName: varchar('customer_name', { length: 120 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 16 }).notNull(),
    serviceId: varchar('service_id', { length: 36 }).references(() => services.id, {
      onDelete: 'set null',
    }),
    // Nom de la prestation figé au moment de la réservation.
    serviceName: varchar('service_name', { length: 120 }).notNull(),
    requestedDate: date('requested_date', { mode: 'string' }).notNull(),
    requestedTime: varchar('requested_time', { length: 5 }).notNull(),
    message: text('message'),
    status: varchar('status', { length: 12, enum: BOOKING_STATUSES }).notNull().default('nouvelle'),
    internalNote: text('internal_note'),
    source: varchar('source', { length: 10, enum: ['site', 'whatsapp', 'manuelle'] })
      .notNull()
      .default('site'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('bookings_reference_unique').on(t.reference),
    index('bookings_date_idx').on(t.requestedDate),
    index('bookings_status_idx').on(t.status),
  ],
)

// ---------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------

export const ORDER_STATUSES = ['nouvelle', 'confirmée', 'payée', 'livrée', 'annulée'] as const
export const PAYMENT_METHODS = ['cash_livraison', 'mobile_money', 'sur_place'] as const

export const orders = mysqlTable(
  'orders',
  {
    id: id(),
    reference: varchar('reference', { length: 12 }).notNull(),
    customerName: varchar('customer_name', { length: 120 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 16 }).notNull(),
    deliveryCommune: varchar('delivery_commune', { length: 80 }),
    deliveryAddress: varchar('delivery_address', { length: 255 }),
    totalAmount: int('total_amount').notNull(),
    currency: currency(),
    paymentMethod: varchar('payment_method', { length: 16, enum: PAYMENT_METHODS }).notNull(),
    paymentReference: varchar('payment_reference', { length: 80 }),
    status: varchar('status', { length: 12, enum: ORDER_STATUSES }).notNull().default('nouvelle'),
    message: text('message'),
    internalNote: text('internal_note'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('orders_reference_unique').on(t.reference),
    index('orders_status_idx').on(t.status),
  ],
)

export const orderItems = mysqlTable(
  'order_items',
  {
    id: id(),
    orderId: varchar('order_id', { length: 36 })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 36 }).references(() => products.id, {
      onDelete: 'set null',
    }),
    // Valeurs figées au moment de la commande.
    productName: varchar('product_name', { length: 120 }).notNull(),
    variant: jsonText<Record<string, string>>('variant').notNull(),
    quantity: int('quantity').notNull(),
    unitPriceAmount: int('unit_price_amount').notNull(),
    discountAmount: int('discount_amount').notNull().default(0),
    promotionId: varchar('promotion_id', { length: 36 }),
    currency: currency(),
    ...timestamps,
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
)

// ---------------------------------------------------------------------------
// Galerie avant / après, avis, blog, sections de pages
// ---------------------------------------------------------------------------

export const galleryItems = mysqlTable('gallery_items', {
  id: id(),
  title: varchar('title', { length: 120 }),
  beforeImageUrl: varchar('before_image_url', { length: 500 }),
  afterImageUrl: varchar('after_image_url', { length: 500 }).notNull(),
  serviceId: varchar('service_id', { length: 36 }).references(() => services.id, {
    onDelete: 'set null',
  }),
  caption: varchar('caption', { length: 255 }),
  position: int('position').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  ...timestamps,
})

export const testimonials = mysqlTable(
  'testimonials',
  {
    id: id(),
    // Prénom + initiale (ex. « Nadège K. »)
    displayName: varchar('display_name', { length: 60 }).notNull(),
    body: text('body').notNull(),
    rating: smallint('rating'),
    serviceId: varchar('service_id', { length: 36 }).references(() => services.id, {
      onDelete: 'set null',
    }),
    consentObtained: boolean('consent_obtained').notNull().default(false),
    isPublished: boolean('is_published').notNull().default(false),
    position: int('position').notNull().default(0),
    ...timestamps,
  },
  () => [
    // Un avis ne peut être publié qu'avec l'accord de la cliente.
    check('testimonials_consent', sql.raw('`is_published` = 0 OR `consent_obtained` = 1')),
  ],
)

export const posts = mysqlTable(
  'posts',
  {
    id: id(),
    title: varchar('title', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 220 }).notNull(),
    excerpt: varchar('excerpt', { length: 300 }),
    content: text('content'),
    imageUrl: varchar('image_url', { length: 500 }),
    category: varchar('category', { length: 80 }),
    readingMinutes: int('reading_minutes'),
    publishedAt: datetime('published_at', { mode: 'date' }),
    seoTitle: varchar('seo_title', { length: 200 }),
    seoDescription: varchar('seo_description', { length: 300 }),
    ...timestamps,
  },
  (t) => [uniqueIndex('posts_slug_unique').on(t.slug)],
)

export const pageSections = mysqlTable(
  'page_sections',
  {
    id: id(),
    key: varchar('key', { length: 60 }).notNull(),
    title: varchar('title', { length: 200 }),
    subtitle: varchar('subtitle', { length: 300 }),
    body: text('body'),
    imageUrl: varchar('image_url', { length: 500 }),
    secondaryImageUrl: varchar('secondary_image_url', { length: 500 }),
    buttonLabel: varchar('button_label', { length: 60 }),
    buttonHref: varchar('button_href', { length: 255 }),
    ...timestamps,
  },
  (t) => [uniqueIndex('page_sections_key_unique').on(t.key)],
)
