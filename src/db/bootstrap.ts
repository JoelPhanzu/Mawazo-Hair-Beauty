/**
 * Préparation automatique de la base au démarrage du serveur :
 * applique les migrations (db/migrations) puis, si la base est vide, les contenus de départ.
 * Aucune commande à lancer à la main sur Hostinger.
 */
import path from 'node:path'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import { getDb } from './index'
import { seedContentIfEmpty } from './seed-content'

export async function ensureDatabase(): Promise<void> {
  const db = getDb()
  const migrationsFolder = path.join(/*turbopackIgnore: true*/ process.cwd(), 'db', 'migrations')
  await migrate(db, { migrationsFolder })
  const seeded = await seedContentIfEmpty(db)
  console.log(
    seeded ? '[base] tables créées et contenus de départ ajoutés' : '[base] tables à jour',
  )
}
