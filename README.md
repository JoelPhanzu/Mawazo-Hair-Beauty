# Mawazo Hair & Beauty

Site du salon Mawazo Hair & Beauty (Lingwala, Kinshasa) et son espace de gestion `/admin`.
Réalisé par Lean Market. Voir `CLAUDE.md` pour le cahier des charges et les décisions.

**Stack** : Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4, MySQL / MariaDB + Drizzle, Zod, Vitest, Playwright.

## Démarrer en local

```bash
npm install
cp .env.example .env.local      # puis remplir
npm run db:migrate              # crée les tables
npm run db:seed                 # contenus de départ + premier compte admin (SEED_OWNER_*)
npm run dev
```

Sans `DATABASE_URL`, le site public s'affiche avec les contenus de départ (`src/db/seed-data.ts`) ; l'admin nécessite la base.

Base de test locale possible avec Docker :

```bash
docker run -d --name mawazo-db -e MARIADB_ROOT_PASSWORD=root -e MARIADB_DATABASE=mawazo \
  -e MARIADB_USER=mawazo -e MARIADB_PASSWORD=<mot-de-passe> -p 3307:3306 mariadb:11.4
```

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | développement |
| `npm run build` / `npm start` | production (build avec webpack : Turbopack plante sur l'environnement de build Hostinger) |
| `npm run lint` / `npm run typecheck` | qualité |
| `npm run test` | tests unitaires (prix, promotions, messages WhatsApp…) |
| `npm run test:e2e` | parcours complets avec Playwright (base de `.env.local`, jamais la production) |
| `npm run db:generate` | nouvelle migration après modification de `src/db/schema.ts` |
| `npm run db:migrate` | applique les migrations |
| `npm run db:seed` | remplit une base vide |

## Mise en ligne chez Hostinger (Node.js Web App)

1. hPanel > **Bases de données MySQL** : noter hôte, utilisateur, mot de passe de `u506684809_MawazoH`.
2. hPanel > **Sites web > Ajouter > Node.js Web App** : relier ce dépôt GitHub, commande de build `npm run build`, commande de démarrage `npm start`.
3. Variables d'environnement de l'application :
   - `DATABASE_URL=mysql://UTILISATEUR:MOT_DE_PASSE@localhost:3306/u506684809_MawazoH`
   - `UPLOAD_DIR=` un dossier **persistant hors de l'application** (ex. `/home/<compte>/mawazo-uploads`)
   - `NEXT_PUBLIC_SITE_URL=https://<domaine>`
4. Première fois, depuis un PC : hPanel > MySQL distant > autoriser l'IP du PC, remplir `.env.hostinger` (hôte distant, identifiants, compte de la gérante), puis `npm run db:migrate:hostinger` et `npm run db:seed:hostinger`. Retirer ensuite l'IP du MySQL distant.
5. Le build fonctionne même si la base n'est pas joignable depuis l'environnement de build : les pages sont alors prérendues avec les contenus de départ puis mises à jour depuis la base en moins d'une minute après la mise en ligne. Node.js 22 minimum.
6. Sauvegardes : exporter la base (hPanel) **et** le dossier `UPLOAD_DIR`.

Pour travailler en local sur la base Hostinger : hPanel > MySQL distant > autoriser votre IP, et utiliser l'hôte distant indiqué.
