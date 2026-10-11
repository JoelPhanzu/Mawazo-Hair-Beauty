# CLAUDE.md — Mawazo Hair & Beauty (refonte du site)

> Projet réalisé par **Lean Market** (agence de transformation numérique, Kinshasa) pour son client **Mawazo Hair & Beauty**.
> Langue de travail, du code commenté à l'interface : **français**. Les identifiants de code (variables, tables, fonctions) restent en anglais.

---

## 0. Décisions du 11/10/2026 (priment sur la suite du document)

- **Base de données : MySQL / MariaDB chez Hostinger** (base `u506684809_MawazoH`), **pas Supabase**. ORM **Drizzle** (`src/db/schema.ts`), migrations SQL dans `db/migrations/` (`npm run db:generate`, `npm run db:migrate`), contenus de départ dans `src/db/seed-data.ts` (`npm run db:seed`). Champs JSON stockés en `longtext` (compatibilité MariaDB).
- **Sécurité** : pas de RLS sous MySQL. Toute lecture publique passe par `src/lib/data/public.ts` (filtre « publié ») ; toute écriture passe par une action serveur qui appelle `requireUser()`.
- **Authentification maison** : sessions en base (`sessions`, empreinte SHA-256 du jeton), cookie `httpOnly` de 30 jours, mots de passe bcrypt, limitation des tentatives. Réinitialisation du mot de passe par la gérante ou Lean Market (écran Utilisateurs) ; l'envoi par e-mail demandera un SMTP Hostinger.
- **Hébergement : Hostinger, « Node.js Web App »**. Images envoyées depuis l'admin : disque du serveur, dossier `UPLOAD_DIR` **hors** du dossier de l'application, servies par `/media/...`.
- **Admin** : composants maison (`src/components/admin/`) au lieu de shadcn/ui, dont l'installation écrasait les variables de la charte. Réordonnancement par flèches monter/descendre (plus fiable au doigt que le glisser-déposer).
- **Contenus validés par la cliente** : prix, textes et promotions de l'ancien site sont considérés comme validés ; tout reste modifiable dans l'admin. Aucun faux témoignage. Charte (crème, brun, bordeaux ; Cormorant Garamond + Manrope) validée.
- **Next.js 16** avec Cache Components : données en `'use cache'` + `cacheTag`, invalidées par `updateTag` dans les actions de l'admin ; tout `new Date()` rendu à la requête est précédé de `await connection()`.

---

## 1. Contexte

**Client :** Mawazo Hair & Beauty — salon de coiffure et de beauté haut de gamme.
**Adresse :** Lingwala, près du Palais du Peuple, Kinshasa (RDC).
**Horaires actuels :** lundi – samedi 9h00 – 19h00 ; dimanche sur rendez-vous.
**WhatsApp / téléphone :** +243 850 871 455 (canal commercial principal).
**Instagram :** deux identifiants coexistent dans l'ancien site (`mawazo.hair_beauty` et `mawazobeauty`) — **à confirmer avec le client, n'en garder qu'un**.

**Activités :**
- Prestations : Wings, Perruques & pose, Tissages, Braids (tresses), Make-up (maquillage), Nails (manucure / pédicure).
- Boutique : wings, perruques, chaussures dames, accessoires / kits beauté.
- Offres récurrentes : « Mardi Promo » (réduction sur les prestations le mardi), Pack Mariée, Offre duo, promotions saisonnières.

**Site actuel :** https://orange-shark-313528.hostingersite.com/ — application React/Vite générée par Hostinger Horizons. Problèmes : dépendance à l'abonnement Horizons pour toute modification, design faible, aucun outil de gestion pour la cliente, sous-domaine Hostinger (pas de nom de domaine propre), images Unsplash génériques.

### Contenus existants récupérables (extraits du site actuel — à faire valider par la cliente)

| Prestation | Prix affiché actuel |
|---|---|
| Wings | À partir de 50 000 FC |
| Perruques & pose | À partir de 35 000 FC |
| Tissages | À partir de 40 000 FC |
| Braids (tresses) | À partir de 25 000 FC |
| Make-up | À partir de 20 000 FC |
| Nails (manucure / pédicure) | À partir de 15 000 FC |

> Ces prix sont ceux de l'ancien site : rien ne garantit qu'ils sont à jour. Les charger dans `seed.sql` avec la mention « à valider » et ne pas mettre en ligne sans confirmation de la cliente. Produits boutique relevés : Wing Premium (75 000 FC), Wing Bouclé (80 000 FC), Perruque Lace Front (95 000 FC), Perruque Bob, Escarpins Élégants, Sandales Dorées, Kit Maquillage Pro, kit soins capillaires.

**Contenus à NE PAS reprendre tels quels :**
- Les témoignages (« Sophie M. », « Marie K. », « Grace L. », « Christelle B. ») : rien ne prouve qu'ils sont authentiques. Ne publier que des avis réels, avec accord de la cliente concernée.
- Le numéro factice `+243 123 456 789` présent dans l'ancien code.
- Les images Unsplash : remplacer par des photos réelles du salon et des réalisations (fournies par la cliente ou produites par Lean Market).
- Les offres datées (« Spécial Saint-Valentin », « Collection Printemps 2026 ») : elles deviennent des promotions gérées depuis l'admin, avec dates de début et de fin.

---

## 2. Objectifs de la refonte

1. **Indépendance** : code source versionné dans un dépôt Git dont le client (ou Lean Market pour son compte) est propriétaire. Aucun constructeur de site propriétaire, aucune dépendance à un abonnement pour modifier le contenu.
2. **Autonomie de la cliente** : un tableau de bord d'administration en français, utilisable **sur téléphone**, pour modifier images, textes, prix, prestations, produits, promotions et réductions sans intervention technique.
3. **Conversion via WhatsApp** : chaque page mène vers une réservation ou une commande, qui aboutit à un message WhatsApp pré-rempli **et** à un enregistrement en base.
4. **Design haut de gamme** crédible pour un salon premium, rapide sur mobile en 3G/4G.

---

## 3. Stack technique

| Couche | Choix | Raison |
|---|---|---|
| Framework | **Next.js** (App Router, dernière version stable) + **TypeScript** strict | Rendu serveur, SEO, routes admin et API dans un seul projet |
| Style | **Tailwind CSS** | Design system maîtrisé, CSS minimal en production |
| Composants admin | **shadcn/ui** | Composants accessibles, code copié dans le projet (pas de dépendance opaque) |
| Base de données, authentification, stockage | **Supabase** (PostgreSQL + Auth + Storage) | Postgres standard, exportable à tout moment ; pas de verrouillage |
| Validation | **Zod** (schémas partagés formulaire ↔ serveur) | |
| Formulaires | react-hook-form | |
| Tests | Vitest (logique métier), Playwright (parcours critiques) | |
| Hébergement | À arrêter (voir §12) | |

**Règles :**
- Utiliser `npm`. Ne pas épingler une version précise de Next.js dans ce fichier : prendre la version stable au moment de l'initialisation et la figer dans `package.json`.
- Pas de CMS tiers (WordPress, Sanity, Strapi…) : l'admin est développé sur mesure dans `/admin`.
- Pas de bibliothèque lourde côté public (pas de carrousel jQuery, pas d'animation de 100 Ko). Les animations se font en CSS.
- Toute la logique de prix et de promotion vit dans `src/lib/pricing/` et est **couverte par des tests**.

---

## 4. Arborescence cible

```
src/
  app/
    (public)/
      page.tsx                 # Accueil
      prestations/             # Liste + page par prestation (/prestations/[slug])
      boutique/                # Catalogue + fiche produit (/boutique/[slug])
      promotions/
      reservation/
      galerie/                 # Réalisations avant/après
      blog/                    # Conseils beauté (/blog/[slug])
      contact/
      mentions-legales/
    admin/
      (auth)/connexion/
      (dashboard)/
        page.tsx               # Tableau de bord : réservations du jour, commandes en attente
        reservations/
        commandes/
        prestations/
        produits/
        categories/
        promotions/
        galerie/
        avis/
        blog/
        pages/                 # Textes et images des sections de l'accueil
        parametres/            # Coordonnées, horaires, réseaux sociaux, numéro WhatsApp
        utilisateurs/
    api/
  components/
    public/
    admin/
    ui/                        # shadcn
  lib/
    supabase/                  # clients serveur / navigateur / admin
    pricing/                   # calcul du prix effectif + tests
    whatsapp.ts                # construction des liens wa.me
    format.ts                  # formatage des montants et dates
  types/
supabase/
  migrations/                  # SQL versionné — jamais de modification manuelle en production
  seed.sql
```

---

## 5. Modèle de données (Supabase / PostgreSQL)

Toutes les tables ont `id uuid`, `created_at`, `updated_at`. Les montants sont des **entiers** (`amount integer`) accompagnés de `currency text check (currency in ('CDF','USD'))`. Pas de `float` pour l'argent. Le franc congolais n'utilise pas de décimales en pratique : `amount` = montant en FC. Pour l'USD, `amount` = cents.

- **settings** (ligne unique) : nom commercial, slogan, téléphone, numéro WhatsApp, e-mail, adresse, lien Google Maps, horaires (JSON), réseaux sociaux, devise par défaut, taux de change USD/CDF indicatif (facultatif, saisi à la main — **jamais** récupéré automatiquement).
- **service_categories** : nom, slug, ordre, image.
- **services** : catégorie, nom, slug, description courte, description longue, durée indicative (minutes min/max), `price_amount`, `currency`, `price_is_from boolean` (« À partir de »), image principale, galerie, `is_published`, `is_featured`, ordre.
- **product_categories** : nom, slug, ordre.
- **products** : catégorie, nom, slug, description, `price_amount`, `currency`, `compare_at_amount` (ancien prix barré, facultatif), stock (`integer`, nullable = non suivi), variantes simples (JSON : pointure, longueur, couleur), images (tableau ordonné), `is_published`, `is_featured`.
- **promotions** : titre, description, image/bannière, `discount_type` (`percentage` | `fixed_amount` | `display_only`), `discount_value`, `scope` (`all_services` | `all_products` | `service_category` | `product_category` | `items`), cibles (table de liaison `promotion_targets`), `starts_at`, `ends_at`, `weekdays smallint[]` (ex. `{2}` pour le mardi — « Mardi Promo »), `is_active`, `show_banner`, `priority`.
- **bookings** (réservations) : nom, téléphone, prestation, date et heure souhaitées, message, `status` (`nouvelle` | `confirmée` | `annulée` | `honorée` | `absente`), note interne, source (`site` | `whatsapp` | `manuelle`).
- **orders** + **order_items** : client (nom, téléphone, commune / adresse de livraison), lignes (produit, variante, quantité, prix unitaire **figé au moment de la commande**, réduction appliquée), total, `payment_method` (`cash_livraison` | `mobile_money` | `sur_place`), `payment_reference` (référence de transaction mobile money saisie par l'admin), `status` (`nouvelle` | `confirmée` | `payée` | `livrée` | `annulée`).
- **gallery_items** : image(s) avant / après, prestation liée, légende, ordre, `is_published`.
- **testimonials** : nom affiché (prénom + initiale), texte, note, prestation, `consent_obtained boolean` obligatoire à `true` pour publier, `is_published`.
- **posts** (blog) : titre, slug, extrait, contenu (Markdown ou éditeur riche simple), image, catégorie, `published_at`, SEO (titre, description).
- **page_sections** : contenu éditable des sections fixes (héro de l'accueil, « pourquoi nous », bandeau d'appel à l'action…) : clé, titre, texte, image, lien du bouton.
- **profiles** : lié à `auth.users`, `role` (`owner` | `editor` | `lean_admin`).
- **audit_log** : qui a modifié quoi et quand (table, id, action, utilisateur, horodatage, valeurs avant/après en JSON). Indispensable pour retrouver l'origine d'un prix erroné.

**Sécurité (RLS obligatoire sur toutes les tables) :**
- Lecture publique uniquement des lignes `is_published = true` (et promotions actives).
- `bookings` et `orders` : insertion publique autorisée via une route serveur avec validation Zod et limitation de débit ; lecture / modification réservées aux rôles admin.
- Écriture du contenu réservée à `owner`, `editor`, `lean_admin`. Gestion des utilisateurs réservée à `owner` et `lean_admin`.
- La clé `service_role` n'est jamais exposée au navigateur.

---

## 6. Règles de prix et de promotions

Fonction unique : `getEffectivePrice(item, promotions, date)` dans `src/lib/pricing/`.

1. Sélectionner les promotions actives à la date donnée : `is_active`, `starts_at <= date <= ends_at` (bornes facultatives), et jour de la semaine compris dans `weekdays` si renseigné. **Fuseau horaire : `Africa/Kinshasa`** — un « Mardi Promo » commence à minuit heure de Kinshasa, pas UTC.
2. Garder celles dont la portée couvre l'article.
3. **Pas de cumul** : appliquer la promotion offrant le prix le plus bas ; à égalité, la `priority` la plus haute. (Règle par défaut — à confirmer avec la cliente.)
4. Un prix ne descend jamais sous 0. Arrondir le résultat en FC à la centaine inférieure (ex. 47 650 → 47 600) — **règle d'arrondi à confirmer**.
5. Pour une prestation « À partir de », afficher « À partir de 30 000 FC ~~50 000 FC~~ ».
6. `display_only` : la promotion s'affiche (bannière, page Promotions) sans modifier les prix — pour les offres négociées en salon (Pack Mariée, etc.).

Le prix affiché, le prix dans le panier, le prix du message WhatsApp et le prix enregistré dans la commande proviennent **tous** de cette fonction, exécutée côté serveur. Tests unitaires obligatoires : mardi vs mercredi, promotion expirée, deux promotions concurrentes, montant fixe supérieur au prix, changement de jour à minuit Kinshasa.

---

## 7. Réservations et commandes : le tunnel WhatsApp

Le paiement par carte est marginal en RDC ; **aucune passerelle de paiement en ligne n'est intégrée en phase 1**.

**Réservation :**
1. Formulaire court (nom, téléphone, prestation, date, créneau, message facultatif). Le téléphone accepte les formats `08…`, `+243…`, `243…` et est normalisé en `+243XXXXXXXXX`.
2. Envoi → enregistrement dans `bookings` → ouverture de `https://wa.me/243850871455?text=…` avec un message pré-rempli et lisible (prestation, date, nom, référence courte de la réservation).
3. **Si l'enregistrement échoue (connexion instable), ouvrir quand même WhatsApp** : la cliente ne doit jamais perdre un rendez-vous à cause d'une coupure.
4. Aucun créneau n'est garanti par le site : le message de confirmation dit clairement que le salon confirme par WhatsApp.

**Commande boutique :** panier stocké dans `localStorage` (avec `try/catch`), puis même logique : enregistrement dans `orders` + message WhatsApp récapitulatif. Moyens de paiement affichés : paiement à la livraison (cash), mobile money (M-Pesa, Orange Money, Airtel Money — **numéros à fournir par la cliente, ne pas les inventer**), paiement au salon. L'admin saisit la référence de transaction et passe la commande à « payée ».

Le numéro WhatsApp n'est jamais codé en dur : il vient de `settings`.

---

## 8. Tableau de bord d'administration (`/admin`)

**Utilisatrice cible :** la gérante du salon, non technicienne, qui travaillera **principalement depuis son téléphone**, avec une connexion parfois instable et des données mobiles payantes.

**Principes d'ergonomie :**
- Mobile d'abord : navigation par barre inférieure ou menu simple, boutons larges, formulaires sur une colonne.
- Vocabulaire du métier, jamais technique : « Publier », « Masquer », « Mettre en avant », pas « is_published » ni « slug ». Le slug est généré automatiquement.
- Chaque formulaire a un aperçu (« Voir sur le site ») et une confirmation avant suppression. Préférer « Masquer » à « Supprimer ».
- **Compression des images dans le navigateur avant envoi** (largeur max 1600 px, WebP, ~200 Ko) pour économiser les données. Recadrage simple au format attendu.
- Réordonnancement par glisser-déposer (prestations, produits, galerie, images d'un produit).
- Sauvegarde explicite avec message de succès clair ; en cas d'échec réseau, conserver la saisie et proposer de réessayer.
- Après chaque enregistrement, revalider les pages publiques concernées (`revalidatePath` / `revalidateTag`) : la modification est visible immédiatement.

**Écrans :**
1. **Accueil admin** : réservations du jour et à venir, commandes à traiter, promotions actives, raccourcis « Ajouter un produit », « Créer une promotion ».
2. **Réservations** : liste filtrable par statut et date, changement de statut en un geste, bouton « Répondre sur WhatsApp ».
3. **Commandes** : idem, saisie de la référence mobile money.
4. **Prestations** et **Produits** : création, modification, prix, « À partir de », prix barré, images, stock, publication, mise en avant.
5. **Promotions et réductions** : assistant en étapes — type (pourcentage / montant / affichage seul) → portée (tout, une catégorie, des articles choisis) → période (dates, jours de la semaine) → bannière. Aperçu du prix avant / après sur quelques articles.
6. **Galerie**, **Avis clients** (case de consentement obligatoire), **Blog**.
7. **Contenus de l'accueil** : image et texte du bandeau principal, sections éditables.
8. **Paramètres** : coordonnées, numéro WhatsApp, horaires, réseaux sociaux.
9. **Utilisateurs** (owner et lean_admin uniquement).

**Authentification :** Supabase Auth, e-mail + mot de passe ; réinitialisation par e-mail. Session longue sur téléphone. Le compte `lean_admin` de Lean Market permet la maintenance sans partager les identifiants de la cliente.

---

## 9. Direction artistique

L'ancien design est jugé raté : **ne pas s'en inspirer**.

- Positionnement : salon **premium** de Kinshasa. Le site doit inspirer confiance et donner envie de réserver, pas ressembler à un modèle de boutique générique.
- **Palette et typographie : à valider avec la cliente.** Aucune charte n'a été fournie. Proposition de départ à soumettre : fond crème chaud, texte brun très foncé, un accent unique (bronze/or mat ou bordeaux), une police à empattements élégante pour les titres et une sans-serif lisible pour le texte. Les couleurs sont définies une seule fois comme variables (`tailwind` theme / CSS custom properties) pour pouvoir changer de charte en un point.
- La photo est le cœur du site : grandes images de réalisations, galerie avant/après, portraits de l'équipe. Prévoir des emplacements qui restent beaux avec des photos de smartphone.
- Représenter la clientèle réelle du salon (femmes noires, coiffures afro). Pas de banques d'images hors sujet.
- Contrastes conformes WCAG AA ; zones tactiles ≥ 44 px.
- Bouton WhatsApp flottant présent sur toutes les pages publiques.
- Avant toute intégration d'une page, produire et faire valider une maquette de l'accueil (desktop + mobile).

---

## 10. Contraintes RDC : performance et sobriété

- Cible : page d'accueil **< 500 Ko transférés au premier chargement** sur mobile, LCP < 2,5 s en 4G simulée.
- Images servies en WebP/AVIF avec `sizes` corrects ; chargement différé hors écran ; pas de vidéo en lecture automatique.
- Polices : 2 familles maximum, sous-ensemble latin, `font-display: swap`, auto-hébergées.
- Pages publiques générées statiquement (ISR) : le site reste rapide même si Supabase répond lentement.
- Aucun script tiers non indispensable. Analyse d'audience légère et respectueuse de la vie privée si demandée.
- Les montants s'affichent `75 000 FC` (espace insécable comme séparateur de milliers, devise toujours visible). Dates en français, fuseau `Africa/Kinshasa`.

---

## 11. SEO et contenu

- Métadonnées par page (titre, description, Open Graph pour le partage WhatsApp — image 1200×630 obligatoire, c'est l'aperçu affiché dans les conversations).
- Données structurées `HairSalon` / `BeautySalon` (LocalBusiness) avec adresse, horaires, téléphone.
- `sitemap.xml`, `robots.txt`, URLs en français et sans accents (`/prestations/tissages`).
- Fiche Google Business Profile à créer ou relier (hors code, à signaler à Lean Market).

---

## 12. Hébergement et propriété — décisions à confirmer

- **Nom de domaine :** le site actuel n'en a pas. En acheter un au nom de la cliente (ex. `mawazo…` — à choisir avec elle).
- **Hébergement :** options à arbitrer par Lean Market selon le budget du client — Vercel (l'offre gratuite est réservée à un usage non commercial : un site de salon est un usage commercial), Netlify, Cloudflare, ou VPS (Hostinger VPS, etc.) avec Node. Le code doit rester déployable sur n'importe laquelle de ces options : pas de fonctionnalité propriétaire d'un hébergeur.
- **Supabase :** les projets gratuits sont mis en pause après une période d'inactivité. Pour un site en production, prévoir l'offre payante ou une tâche de maintien d'activité, à décider. Sauvegardes de la base exportées régulièrement.
- Les comptes (domaine, hébergement, Supabase, dépôt Git) sont ouverts **au nom du client** avec Lean Market en collaborateur, ou au nom de Lean Market avec transfert prévu au contrat — décision commerciale de Lean Market.

---

## 13. Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # serveur uniquement
NEXT_PUBLIC_SITE_URL=
```
Fournir `.env.example`. Ne jamais committer `.env.local`.

---

## 14. Commandes

```
npm run dev          # développement
npm run build        # build de production
npm run lint
npm run typecheck
npm run test         # Vitest
npm run test:e2e     # Playwright
npx supabase db diff / migration new <nom>
```

---

## 15. Ordre de travail

1. Initialiser le projet, la configuration (TypeScript strict, ESLint, Prettier, Tailwind), `.env.example`.
2. Migrations Supabase + RLS + `seed.sql` avec les contenus de §1 marqués « à valider ».
3. `src/lib/pricing` + tests.
4. Maquette de l'accueil (desktop + mobile) → **validation par Lean Market avant de continuer**.
5. Pages publiques.
6. Authentification et tableau de bord admin, écran par écran, dans l'ordre : Paramètres → Prestations → Produits → Promotions → Réservations → Commandes → Galerie → Avis → Blog → Contenus de l'accueil.
7. Tunnel réservation / commande WhatsApp + tests Playwright.
8. SEO, performance (Lighthouse mobile), accessibilité.
9. Guide d'utilisation de l'admin pour la cliente (`docs/guide-admin.md`, en français simple, avec captures).

---

## 16. Règles de conduite pour Claude Code

- **Ne jamais inventer** un prix, un numéro de téléphone, un numéro mobile money, un témoignage, un nom d'employée ou un horaire. Utiliser un champ `[À COMPLÉTER]` visible et le lister dans `docs/a-completer.md`.
- Signaler toute incohérence trouvée dans les contenus (prix, coordonnées, promotions qui se chevauchent).
- Une migration = un fichier SQL ; ne jamais modifier une migration déjà appliquée.
- Avant de terminer une tâche : `npm run lint && npm run typecheck && npm run test`.
- Commits courts en français, à l'impératif (« Ajoute la gestion des promotions »).
- Toute décision structurante non prévue ici (nouvelle dépendance, changement de modèle de données, service tiers payant) : demander avant.
