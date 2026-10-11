/**
 * Préparation automatique de la base au démarrage du serveur :
 * applique les migrations puis, si la base est vide, les contenus de départ.
 * Aucune commande à lancer à la main sur Hostinger.
 *
 * Les migrations viennent de migrations.generated.ts (et non du dossier db/migrations,
 * absent du dossier de build Hostinger). Même table de suivi que drizzle-kit
 * (__drizzle_migrations) : « npm run db:migrate » et le démarrage restent compatibles.
 */
import type { MigrationConfig, MigrationMeta } from 'drizzle-orm/migrator'
import { getDb, type Database } from './index'
import { migrations } from './migrations.generated'
import { seedContentIfEmpty } from './seed-content'

/** Accès au moteur de migration interne de drizzle (celui qu'utilise drizzle-orm/mysql2/migrator). */
interface MigratableDatabase {
  dialect: { migrate(m: MigrationMeta[], session: unknown, config: MigrationConfig): Promise<void> }
  session: unknown
}

export async function ensureDatabase(): Promise<void> {
  const db = getDb()
  const internal = db as Database & MigratableDatabase
  await internal.dialect.migrate(migrations, internal.session, { migrationsFolder: '' })
  const seeded = await seedContentIfEmpty(db)
  console.log(
    seeded ? '[base] tables créées et contenus de départ ajoutés' : '[base] tables à jour',
  )
}
