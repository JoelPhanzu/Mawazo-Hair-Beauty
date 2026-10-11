import { execSync } from 'node:child_process'

/** Base de test prête : contenus de départ et compte de la gérante (SEED_OWNER_*). */
export default function globalSetup() {
  execSync('npm run db:seed', { stdio: 'inherit' })
}
