import { expect, type Page } from '@playwright/test'

/** Intercepte l'ouverture de WhatsApp et renvoie l'URL wa.me demandée. */
export async function captureWhatsApp(page: Page): Promise<() => Promise<URL>> {
  let resolve: (url: URL) => void
  const opened = new Promise<URL>((r) => (resolve = r))
  await page.route('https://wa.me/**', async (route) => {
    resolve(new URL(route.request().url()))
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>WhatsApp</p>' })
  })
  return () => opened
}

export async function loginAsOwner(page: Page) {
  const email = process.env.SEED_OWNER_EMAIL
  const password = process.env.SEED_OWNER_PASSWORD
  if (!email || !password)
    throw new Error('SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD manquants (.env.local)')
  await page.goto('/admin/connexion')
  await page.getByLabel('Adresse e-mail').fill(email)
  await page.getByLabel('Mot de passe').fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

/** Remplit un champ de l'admin et enregistre via la barre du bas. */
export async function save(page: Page) {
  await page
    .locator('button[type="submit"]')
    .filter({ hasText: /^(Enregistrer|Créer|Ajouter)/ })
    .click()
  await expect(page.getByRole('status')).toContainText(/Enregistr|créé|ajouté/i)
}
