/** Sections éditables du site, avec un nom compréhensible et les champs utilisés. */
type Field = 'title' | 'body' | 'imageUrl' | 'secondaryImageUrl' | 'button'

export const PAGE_SECTIONS: {
  key: string
  label: string
  page: string
  fields: Field[]
  help?: string
}[] = [
  {
    key: 'home_hero',
    label: 'Bandeau principal',
    page: 'Accueil',
    fields: ['title', 'body', 'imageUrl', 'secondaryImageUrl', 'button'],
    help: 'Entourez un mot d’astérisques pour l’écrire en italique : « avec *élégance* ».',
  },
  {
    key: 'home_about',
    label: 'Présentation du salon',
    page: 'Accueil',
    fields: ['title', 'body', 'imageUrl'],
  },
  {
    key: 'home_services',
    label: 'Section prestations',
    page: 'Accueil',
    fields: ['title', 'body', 'button'],
  },
  {
    key: 'home_gallery',
    label: 'Section avant / après',
    page: 'Accueil',
    fields: ['title', 'body'],
  },
  {
    key: 'home_shop',
    label: 'Section boutique',
    page: 'Accueil',
    fields: ['title', 'body', 'button'],
    help: 'Le bouton sert aussi de second bouton dans le bandeau principal.',
  },
  {
    key: 'home_testimonials',
    label: 'Section témoignages',
    page: 'Accueil',
    fields: ['title', 'body'],
  },
  {
    key: 'home_visit',
    label: 'Section « Visitez-nous »',
    page: 'Accueil',
    fields: ['title', 'imageUrl'],
  },
  {
    key: 'home_cta',
    label: 'Appel à réserver (bas de page)',
    page: 'Accueil',
    fields: ['title', 'body', 'button'],
  },
  { key: 'services_intro', label: 'Introduction', page: 'Prestations', fields: ['title', 'body'] },
  { key: 'shop_intro', label: 'Introduction', page: 'Boutique', fields: ['title', 'body'] },
  { key: 'promotions_intro', label: 'Introduction', page: 'Promotions', fields: ['title', 'body'] },
  {
    key: 'promotions_follow',
    label: 'Encadré réseaux sociaux',
    page: 'Promotions',
    fields: ['title', 'body'],
  },
  { key: 'gallery_intro', label: 'Introduction', page: 'Avant / Après', fields: ['title', 'body'] },
  { key: 'blog_intro', label: 'Introduction', page: 'Blog', fields: ['title', 'body'] },
  { key: 'contact_intro', label: 'Introduction', page: 'Contact', fields: ['title', 'body'] },
  {
    key: 'booking_intro',
    label: 'Introduction',
    page: 'Prendre rendez-vous',
    fields: ['title', 'body'],
  },
]
