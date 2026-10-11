/**
 * Contenus de départ, repris de l'ancien site et validés par la cliente le 2026-10-11.
 * Source unique pour le script de remplissage (db/seed.ts) et pour le mode sans base
 * (développement sans DATABASE_URL). Une fois la base remplie, tout se modifie dans l'admin.
 */
import type { OpeningHours, PaymentNumber, SocialLinks, promotions } from './schema'

export const seedSettings = {
  businessName: 'Mawazo Hair & Beauty',
  tagline: 'Votre destination beauté premium à Kinshasa',
  phone: '+243850871455',
  whatsappNumber: '243850871455',
  emails: ['contact@mawazohairbeauty.com', 'contact@mawazoh.com'],
  address: 'Lingwala, près du Palais du Peuple, Kinshasa',
  googleMapsUrl: null as string | null,
  openingHours: {
    lundi: 'Fermé',
    mardi: '9h00 - 19h00',
    mercredi: '9h00 - 19h00',
    jeudi: '9h00 - 19h00',
    vendredi: '9h00 - 19h00',
    samedi: '9h00 - 19h00',
    dimanche: '9h00 - 19h00',
  } as OpeningHours,
  socialLinks: { instagram: 'https://www.instagram.com/mawazo.hair_beauty/' } as SocialLinks,
  // Numéros mobile money à saisir par la cliente depuis l'admin.
  paymentNumbers: [] as PaymentNumber[],
}

export const seedServiceCategories = [
  { key: 'coiffure', name: 'Coiffure', slug: 'coiffure' },
  { key: 'beaute', name: 'Beauté', slug: 'beaute' },
] as const

export const seedServices: {
  category: (typeof seedServiceCategories)[number]['key']
  name: string
  slug: string
  shortDescription: string
  longDescription: string
  durationMinMinutes: number
  durationMaxMinutes: number
  priceAmount: number
}[] = [
  {
    category: 'coiffure',
    name: 'Wings',
    slug: 'wings',
    shortDescription: 'Coiffures sophistiquées avec extensions naturelles',
    longDescription:
      'Coiffures sophistiquées avec extensions naturelles pour un look glamour et volumineux.',
    durationMinMinutes: 240,
    durationMaxMinutes: 360,
    priceAmount: 50000,
  },
  {
    category: 'coiffure',
    name: 'Perruques & pose',
    slug: 'perruques-pose',
    shortDescription: 'Sélection de perruques premium et pose professionnelle',
    longDescription:
      'Sélection premium de perruques naturelles et synthétiques avec pose professionnelle.',
    durationMinMinutes: 60,
    durationMaxMinutes: 120,
    priceAmount: 35000,
  },
  {
    category: 'coiffure',
    name: 'Tissages',
    slug: 'tissages',
    shortDescription: 'Tissages de qualité supérieure, résultats naturels',
    longDescription: 'Tissages de qualité supérieure pour des résultats naturels et durables.',
    durationMinMinutes: 180,
    durationMaxMinutes: 300,
    priceAmount: 40000,
  },
  {
    category: 'coiffure',
    name: 'Braids (tresses)',
    slug: 'braids',
    shortDescription: 'Tresses artistiques et protectrices',
    longDescription: 'Tresses artistiques et protectrices dans tous les styles imaginables.',
    durationMinMinutes: 180,
    durationMaxMinutes: 360,
    priceAmount: 25000,
  },
  {
    category: 'beaute',
    name: 'Make-up',
    slug: 'make-up',
    shortDescription: 'Maquillage professionnel pour tous événements',
    longDescription: 'Maquillage professionnel pour mariages, événements et séances photo.',
    durationMinMinutes: 60,
    durationMaxMinutes: 120,
    priceAmount: 20000,
  },
  {
    category: 'beaute',
    name: 'Nails (manucure / pédicure)',
    slug: 'nails',
    shortDescription: 'Manucure et nail art exceptionnel',
    longDescription: 'Soins complets des ongles avec nail art personnalisé.',
    durationMinMinutes: 60,
    durationMaxMinutes: 120,
    priceAmount: 15000,
  },
]

export const seedProductCategories = [
  { key: 'wings', name: 'Wings', slug: 'wings' },
  { key: 'perruques', name: 'Perruques', slug: 'perruques' },
  { key: 'chaussures', name: 'Chaussures dames', slug: 'chaussures' },
  { key: 'accessoires', name: 'Accessoires & kits', slug: 'accessoires' },
] as const

/** [catégorie, nom, slug, description, prix en FC] */
export const seedProducts: [
  (typeof seedProductCategories)[number]['key'],
  string,
  string,
  string,
  number,
][] = [
  [
    'wings',
    'Wing Premium',
    'wing-premium',
    'Extension de cheveux naturels 100%, texture lisse',
    75000,
  ],
  ['wings', 'Wing Bouclé', 'wing-boucle', 'Extension de cheveux naturels bouclés', 80000],
  [
    'perruques',
    'Perruque Lace Front',
    'perruque-lace-front',
    'Perruque naturelle avec lace frontale invisible',
    95000,
  ],
  ['perruques', 'Perruque Bob', 'perruque-bob', 'Perruque synthétique style bob moderne', 45000],
  [
    'chaussures',
    'Escarpins Élégants',
    'escarpins-elegants',
    'Chaussures à talons hauts, cuir véritable',
    55000,
  ],
  [
    'chaussures',
    'Sandales Dorées',
    'sandales-dorees',
    'Sandales élégantes avec détails dorés',
    42000,
  ],
  [
    'accessoires',
    'Kit Maquillage Pro',
    'kit-maquillage-pro',
    'Kit complet de maquillage professionnel',
    65000,
  ],
  [
    'accessoires',
    'Soins Capillaires',
    'soins-capillaires',
    'Set complet de soins pour cheveux naturels',
    35000,
  ],
]

export const seedPromotions: Omit<typeof promotions.$inferInsert, 'id'>[] = [
  {
    title: 'Mardi Promo',
    subtitle: "Jusqu'à -40% sur tous nos services !",
    description:
      'Chaque mardi, bénéficiez de réductions exceptionnelles sur l’ensemble de nos prestations. Wings, tissages, braids, maquillage... tout est en promotion !',
    badge: 'Promo hebdomadaire',
    discountType: 'display_only',
    scope: 'all_services',
    weekdays: [2],
    ctaLabel: 'Réserver',
    ctaHref: '/reservation',
    isActive: true,
    showBanner: true,
    priority: 10,
    position: 1,
  },
  {
    title: 'Offre duo beauté',
    subtitle: 'Venez à deux',
    description:
      'Venez à deux et profitez d’une réduction de 30% sur vos prestations. Maquillage + manucure pour un moment de détente en duo !',
    badge: '-30%',
    discountType: 'display_only',
    scope: 'all_services',
    ctaLabel: 'Réserver',
    ctaHref: '/reservation',
    isActive: true,
    priority: 5,
    position: 2,
  },
  {
    title: 'Nouvelle collection chaussures',
    subtitle: "Jusqu'à -25% sur les nouveautés",
    description:
      'Découvrez notre nouvelle collection de chaussures pour dames avec des réductions exceptionnelles. Élégance et confort garantis !',
    badge: 'Nouveauté',
    discountType: 'display_only',
    scope: 'product_category',
    ctaLabel: 'Commander',
    ctaHref: '/boutique?categorie=chaussures',
    isActive: true,
    priority: 5,
    position: 3,
  },
  {
    title: 'Pack Mariée',
    subtitle: 'Offre complète pour votre grand jour',
    description:
      'Coiffure + Maquillage + Manucure pour un tarif exceptionnel. Consultations et essais inclus. Réservez dès maintenant pour sécuriser votre date !',
    badge: '-20%',
    discountType: 'display_only',
    scope: 'all_services',
    ctaLabel: 'Réserver',
    ctaHref: '/reservation',
    isActive: true,
    priority: 5,
    position: 4,
  },
]

export const seedPageSections: {
  key: string
  title?: string
  subtitle?: string
  body?: string
  buttonLabel?: string
  buttonHref?: string
}[] = [
  {
    key: 'home_hero',
    title: 'Révélez votre beauté *avec élégance*',
    body: 'Votre destination beauté premium à Kinshasa',
    buttonLabel: 'Prendre rendez-vous',
    buttonHref: '/reservation',
  },
  {
    key: 'home_about',
    title: "L'Excellence à votre Service",
    body: "Mawazo Hair & Beauty est le salon de référence à Kinshasa, offrant des services de coiffure et de beauté d'exception. Notre équipe de professionnels passionnés utilise des produits premium pour sublimer votre beauté naturelle. De la coiffure au maquillage, en passant par les soins des ongles, nous créons des looks qui reflètent votre personnalité unique dans une ambiance chaleureuse et élégante.",
  },
  {
    key: 'home_services',
    title: 'Nos Services',
    body: 'Des prestations de qualité pour révéler votre beauté',
    buttonLabel: 'Toutes les prestations',
    buttonHref: '/prestations',
  },
  {
    key: 'home_gallery',
    title: 'Avant / Après',
    body: "Nos transformations qui parlent d'elles-mêmes",
  },
  {
    key: 'home_shop',
    title: 'Notre Boutique',
    body: 'Découvrez notre sélection de produits premium',
    buttonLabel: 'Commander un produit',
    buttonHref: '/boutique',
  },
  {
    key: 'home_testimonials',
    title: 'Témoignages Clients',
    body: 'Ce que disent nos clientes satisfaites',
  },
  { key: 'home_visit', title: 'Visitez-nous' },
  {
    key: 'home_cta',
    title: 'Un rendez-vous en deux minutes',
    body: 'Choisissez votre prestation et votre créneau. Le salon vous confirme sur WhatsApp.',
    buttonLabel: 'Prendre rendez-vous',
    buttonHref: '/reservation',
  },
  {
    key: 'services_intro',
    title: 'Nos Services',
    body: 'Des prestations de qualité premium pour sublimer votre beauté naturelle',
  },
  {
    key: 'shop_intro',
    title: 'Notre Boutique',
    body: 'Découvrez notre sélection de produits premium',
  },
  {
    key: 'promotions_intro',
    title: 'Nos Promotions',
    body: 'Profitez de nos offres exceptionnelles et économisez sur vos prestations préférées',
  },
  {
    key: 'promotions_follow',
    title: 'Ne ratez aucune promotion !',
    body: 'Suivez-nous sur Instagram et WhatsApp pour être informé en temps réel de toutes nos offres spéciales et promotions flash.',
  },
  {
    key: 'gallery_intro',
    title: 'Avant / Après',
    body: "Nos transformations qui parlent d'elles-mêmes",
  },
  {
    key: 'blog_intro',
    title: 'Conseils beauté',
    body: 'Astuces et conseils de nos professionnelles pour prendre soin de vous.',
  },
  {
    key: 'contact_intro',
    title: 'Contact',
    body: 'Une question, un rendez-vous ? Écrivez-nous ou passez au salon.',
  },
  {
    key: 'booking_intro',
    title: 'Prendre rendez-vous',
    body: 'Choisissez votre prestation et votre créneau. Le salon vous confirme sur WhatsApp.',
  },
]

export const seedPost = {
  title: '5 conseils pour entretenir vos wings',
  slug: '5-conseils-pour-entretenir-vos-wings',
  excerpt:
    'Découvrez comment prolonger la durée de vie de vos extensions et garder un look impeccable.',
  category: 'Soins capillaires',
  readingMinutes: 5,
}
