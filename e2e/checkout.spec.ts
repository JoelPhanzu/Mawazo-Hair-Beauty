import { expect, test } from '@playwright/test'
import { captureWhatsApp } from './helpers'

/** Prochain jour d'ouverture (le salon est fermé le lundi). */
function nextOpenDay(): string {
  const d = new Date(Date.now() + 24 * 3600 * 1000)
  if (d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

test('réservation : enregistrée puis WhatsApp pré-rempli avec la référence', async ({ page }) => {
  const whatsapp = await captureWhatsApp(page)
  await page.goto('/reservation?prestation=tissages')

  await expect(page.getByLabel('Prestation')).toHaveValue('tissages')
  const tomorrow = nextOpenDay()
  await page.getByLabel('Date souhaitée').fill(tomorrow)
  await page.getByLabel('Heure souhaitée').selectOption('10:30')
  await page.getByLabel('Nom complet').fill('Cliente Test')
  await page.getByLabel('Téléphone (WhatsApp)').fill('085 087 14 55')
  await page.getByRole('button', { name: /Envoyer ma demande/ }).click()

  const url = await whatsapp()
  expect(url.pathname).toBe('/243850871455')
  const text = url.searchParams.get('text') ?? ''
  expect(text).toContain('Prestation : Tissages')
  expect(text).toContain('Téléphone : +243850871455')
  expect(text).toMatch(/Référence : R-[A-Z0-9]{5}/)
})

test('réservation : jour de fermeture refusé', async ({ page }) => {
  const monday = new Date(Date.now() + 24 * 3600 * 1000)
  while (monday.getUTCDay() !== 1) monday.setUTCDate(monday.getUTCDate() + 1)
  await page.goto('/reservation?prestation=tissages')
  await page.getByLabel('Date souhaitée').fill(monday.toISOString().slice(0, 10))
  await page.getByLabel('Heure souhaitée').selectOption('10:30')
  await page.getByLabel('Nom complet').fill('Cliente Test')
  await page.getByLabel('Téléphone (WhatsApp)').fill('085 087 14 55')
  await page.getByRole('button', { name: /Envoyer ma demande/ }).click()
  await expect(page.getByText(/fermé le lundi/)).toBeVisible()
})

test('réservation : téléphone invalide signalé, rien n’est envoyé', async ({ page }) => {
  await page.goto('/reservation')
  await page.getByLabel('Prestation').selectOption('braids')
  await page.getByLabel('Date souhaitée').fill(nextOpenDay())
  await page.getByLabel('Heure souhaitée').selectOption('09:00')
  await page.getByLabel('Nom complet').fill('Cliente Test')
  await page.getByLabel('Téléphone (WhatsApp)').fill('12')
  await page.getByRole('button', { name: /Envoyer ma demande/ }).click()
  await expect(page.getByText(/Numéro invalide/)).toBeVisible()
})

test('commande : panier, prix recalculé par le serveur, WhatsApp', async ({ page }) => {
  const whatsapp = await captureWhatsApp(page)
  await page.goto('/boutique/wing-premium')
  await page.getByRole('button', { name: 'Augmenter la quantité' }).click()
  await page.getByRole('button', { name: 'Ajouter au panier' }).click()
  await page.getByRole('link', { name: 'Voir le panier' }).click()

  await expect(page.getByText(/150 000 FC/).first()).toBeVisible()
  await page.getByLabel('Nom complet').fill('Cliente Test')
  await page.getByLabel('Téléphone (WhatsApp)').fill('+243 850 871 455')
  await page.getByLabel('Commune').fill('Gombe')
  await page.getByRole('button', { name: 'Commander sur WhatsApp' }).click()

  const text = (await whatsapp()).searchParams.get('text') ?? ''
  expect(text).toContain('- 2 x Wing Premium : 150 000 FC')
  expect(text).toContain('Livraison : Gombe')
  expect(text).toMatch(/Référence : C-[A-Z0-9]{5}/)
})
