import { expect, test } from '@playwright/test'

test('accueil : textes de l’ancien site, prix et Mardi Promo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Révélez votre beauté')
  await expect(page.getByText('Votre destination beauté premium à Kinshasa').first()).toBeVisible()
  await expect(page.getByText("L'Excellence à votre Service")).toBeVisible()
  await expect(page.getByText(/50 000 FC/).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mardi Promo' })).toBeVisible()
  // Aucun faux témoignage.
  await expect(page.getByText('Sophie M.')).toHaveCount(0)
})

test('pages principales accessibles', async ({ page }) => {
  for (const [path, heading] of [
    ['/prestations', 'Nos Services'],
    ['/prestations/tissages', 'Tissages'],
    ['/boutique', 'Notre Boutique'],
    ['/boutique/wing-premium', 'Wing Premium'],
    ['/promotions', 'Nos Promotions'],
    ['/galerie', 'Avant / Après'],
    ['/blog', 'Conseils beauté'],
    ['/contact', 'Contact'],
    ['/reservation', 'Prendre rendez-vous'],
    ['/mentions-legales', 'Mentions légales'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
  }
})

test('contact : les deux adresses e-mail et Instagram', async ({ page }) => {
  await page.goto('/contact')
  const main = page.locator('main')
  await expect(main.getByRole('link', { name: 'contact@mawazohairbeauty.com' })).toBeVisible()
  await expect(main.getByRole('link', { name: 'contact@mawazoh.com' })).toBeVisible()
  await expect(main.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
    'href',
    'https://www.instagram.com/mawazo.hair_beauty/',
  )
})

test('référencement : sitemap, robots, aperçu de partage', async ({ request }) => {
  expect((await request.get('/sitemap.xml')).status()).toBe(200)
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /admin')
  const og = await request.get('/opengraph-image')
  expect(og.headers()['content-type']).toContain('image/png')
})
