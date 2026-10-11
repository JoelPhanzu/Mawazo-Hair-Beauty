import { expect, test } from '@playwright/test'
import { deflateSync } from 'node:zlib'
import { loginAsOwner, save } from './helpers'

/** PNG uni 400 x 500 généré à la volée (aucune photo externe). */
function samplePng(): Buffer {
  const width = 400
  const height = 500
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
  })
  const crc = (buf: Buffer) => {
    let c = 0xffffffff
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const sum = Buffer.alloc(4)
    sum.writeUInt32BE(crc(body))
    return Buffer.concat([len, body, sum])
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header.set([8, 2, 0, 0, 0], 8)
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 0x9a)])
  const raw = Buffer.concat(Array.from({ length: height }, () => row))
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

test('admin protégé : sans connexion, retour à la page de connexion', async ({ page }) => {
  await page.goto('/admin/prestations')
  await expect(page).toHaveURL(/\/admin\/connexion/)
})

test('connexion refusée avec un mauvais mot de passe', async ({ page }) => {
  await page.goto('/admin/connexion')
  await page.getByLabel('Adresse e-mail').fill('inconnue@mawazo.test')
  await page.getByLabel('Mot de passe').fill('mauvais-mot-de-passe')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText('Adresse e-mail ou mot de passe incorrect.')).toBeVisible()
})

test('changer un prix : visible immédiatement sur le site', async ({ page }) => {
  await loginAsOwner(page)
  await page.goto('/admin/prestations')
  await page.getByRole('link', { name: /Braids/ }).click()
  await page.getByLabel('Prix', { exact: true }).fill('27 500')
  await save(page)

  await page.goto('/prestations')
  await expect(
    page
      .locator('#contenu')
      .getByText(/27 500 FC/)
      .first(),
  ).toBeVisible()

  // Remise à l'état initial.
  await page.goBack()
  await page.getByLabel('Prix', { exact: true }).fill('25 000')
  await save(page)
})

test('paramètres : numéro mobile money affiché au client', async ({ page }) => {
  await loginAsOwner(page)
  await page.goto('/admin/parametres')
  await page.getByRole('button', { name: 'Ajouter un numéro' }).click()
  await page.getByLabel('Opérateur').fill('M-Pesa')
  await page.getByLabel('Numéro', { exact: true }).fill('0810000000')
  await page.getByLabel('Nom du titulaire (affiché au client)').fill('Titulaire Test')
  await save(page)

  await page.goto('/boutique/soins-capillaires')
  await page.getByRole('button', { name: 'Ajouter au panier' }).click()
  await page.goto('/panier')
  await page.getByText('Mobile money', { exact: true }).click()
  await expect(page.getByText('0810000000')).toBeVisible()

  // Nettoyage.
  await page.goto('/admin/parametres')
  await page.getByRole('button', { name: 'Retirer ce numéro' }).click()
  await save(page)
})

test('avant / après : envoi de photos, publication sur le site', async ({ page }) => {
  const title = `Transformation test ${Date.now()}`
  await loginAsOwner(page)
  await page.goto('/admin/galerie/nouveau')
  // Attendre que la page soit interactive avant de choisir les fichiers.
  await page.waitForLoadState('networkidle')
  const png = { name: 'photo.png', mimeType: 'image/png', buffer: samplePng() }
  await page.locator('input[type=file]').nth(0).setInputFiles(png)
  await page.locator('input[type=file]').nth(1).setInputFiles(png)
  for (const field of ['beforeImageUrl', 'afterImageUrl']) {
    await expect(page.locator(`input[name=${field}]`)).toHaveValue(/^\/media\/.+\.webp$/, {
      timeout: 30_000,
    })
  }
  await page.getByLabel('Titre').fill(title)
  await page.locator('button[type="submit"]').filter({ hasText: 'Ajouter la réalisation' }).click()
  // Après une création, l'admin ouvre la fiche créée.
  await expect(page).toHaveURL(/\/admin\/galerie\/[0-9a-f-]{36}$/)

  await page.goto('/galerie')
  const figure = page.getByRole('figure', { name: title })
  await expect(figure).toBeVisible()
  await expect(figure.getByLabel('Comparer avant et après')).toBeAttached()

  // Nettoyage.
  await page.goto('/admin/galerie')
  await page.goto((await page.getByRole('link', { name: title }).getAttribute('href'))!)
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await page.getByRole('button', { name: 'Oui, supprimer définitivement' }).click()
  await expect(page).toHaveURL(/\/admin\/galerie$/)
})

test('avis : publication impossible sans l’accord de la cliente', async ({ page }) => {
  await loginAsOwner(page)
  await page.goto('/admin/avis/nouveau')
  await page.getByLabel('Nom affiché').fill('Cliente T.')
  await page.getByLabel("Texte de l'avis").fill('Très bon accueil.')
  await page.getByText('Publier sur le site').click()
  await page.locator('button[type="submit"]').filter({ hasText: 'Ajouter l’avis' }).click()
  await expect(page.getByText(/accord de la cliente/).last()).toBeVisible()
})

test('la réservation du site apparaît dans l’admin', async ({ page }) => {
  await loginAsOwner(page)
  await page.goto('/admin/reservations')
  await expect(page.getByText('Cliente Test').first()).toBeVisible()
})
