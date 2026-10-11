import type { Metadata } from 'next'
import { eq } from 'drizzle-orm'
import {
  AdminForm,
  FormSection,
  ListField,
  TextAreaField,
  TextField,
} from '@/components/admin/form'
import { PaymentNumbersField } from '@/components/admin/PaymentNumbersField'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { seedSettings } from '@/db/seed-data'
import { formatPhone } from '@/lib/format'
import { saveSettings } from './actions'

export const metadata: Metadata = { title: 'Coordonnées et paiement' }

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

export default async function SettingsPage() {
  await requireUser()
  const [row] = await getDb().select().from(schema.settings).where(eq(schema.settings.id, 1))
  const s = row ?? { ...seedSettings, usdToCdfRate: null }

  return (
    <AdminPage
      title="Coordonnées et paiement"
      description="Ces informations apparaissent sur tout le site : en-tête, pied de page, contact, boutons WhatsApp."
    >
      <AdminForm action={saveSettings}>
        <FormSection title="Le salon">
          <TextField name="businessName" label="Nom du salon" defaultValue={s.businessName} />
          <TextField name="tagline" label="Slogan" defaultValue={s.tagline} />
          <TextAreaField name="address" label="Adresse" defaultValue={s.address} rows={2} />
          <TextField
            name="googleMapsUrl"
            label="Lien Google Maps"
            type="url"
            defaultValue={s.googleMapsUrl}
            hint="Dans Google Maps : Partager > Copier le lien. Le bouton « Itinéraire » apparaît dès qu'il est rempli."
          />
        </FormSection>

        <FormSection title="Contact">
          <TextField
            name="whatsappNumber"
            label="Numéro WhatsApp (réservations et commandes)"
            type="tel"
            inputMode="tel"
            defaultValue={formatPhone(`+${s.whatsappNumber}`)}
            hint="Tous les boutons WhatsApp du site envoient vers ce numéro."
          />
          <TextField
            name="phone"
            label="Téléphone affiché"
            type="tel"
            inputMode="tel"
            defaultValue={s.phone ? formatPhone(s.phone) : ''}
          />
          <ListField
            name="emails"
            label="Adresses e-mail"
            defaultValue={s.emails}
            addLabel="Ajouter une adresse"
            placeholder="contact@…"
          />
        </FormSection>

        <FormSection title="Horaires">
          {DAYS.map((day) => (
            <TextField
              key={day}
              name={`hours_${day}`}
              label={day.charAt(0).toUpperCase() + day.slice(1)}
              defaultValue={s.openingHours[day]}
              hint={
                day === 'lundi' ? 'Ex. « 9h00 - 19h00 », « Sur rendez-vous », « Fermé »' : undefined
              }
            />
          ))}
        </FormSection>

        <FormSection title="Réseaux sociaux">
          <p className="text-ink-soft -mt-2 text-sm">
            Laissez vide un réseau que le salon n&apos;utilise pas.
          </p>
          <TextField
            name="social_instagram"
            label="Instagram"
            type="url"
            defaultValue={s.socialLinks.instagram}
          />
          <TextField
            name="social_facebook"
            label="Facebook"
            type="url"
            defaultValue={s.socialLinks.facebook}
          />
          <TextField
            name="social_tiktok"
            label="TikTok"
            type="url"
            defaultValue={s.socialLinks.tiktok}
          />
          <TextField
            name="social_youtube"
            label="YouTube"
            type="url"
            defaultValue={s.socialLinks.youtube}
          />
          <TextField
            name="social_snapchat"
            label="Snapchat"
            type="url"
            defaultValue={s.socialLinks.snapchat}
          />
        </FormSection>

        <FormSection title="Numéros de paiement mobile money">
          <PaymentNumbersField defaultValue={s.paymentNumbers} />
        </FormSection>

        <FormSection title="Devise">
          <TextField
            name="usdToCdfRate"
            label="Taux indicatif : 1 $ = … FC"
            inputMode="numeric"
            defaultValue={s.usdToCdfRate}
            hint="Facultatif. Saisi à la main, jamais mis à jour automatiquement."
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  )
}
