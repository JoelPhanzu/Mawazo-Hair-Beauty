import type { Metadata } from 'next'
import { PageHeader } from '@/components/public/PageHeader'
import { getSiteSettings } from '@/lib/data/public'

export const metadata: Metadata = { title: 'Mentions légales' }

export default async function LegalPage() {
  const settings = await getSiteSettings()
  const section = 'border-line border-t pt-8'
  return (
    <>
      <PageHeader title="Mentions légales" />
      <div className="mx-auto grid max-w-3xl gap-10 px-4 pb-24 md:px-8">
        <section className={section}>
          <h2 className="font-display text-3xl font-medium">Éditeur du site</h2>
          <p className="mt-4">
            {settings.businessName}
            <br />
            {settings.address}
            <br />
            Raison sociale et RCCM : [À COMPLÉTER]
            <br />
            Responsable de la publication : [À COMPLÉTER]
            <br />
            Contact : {settings.emails.join(', ')}
          </p>
        </section>
        <section className={section}>
          <h2 className="font-display text-3xl font-medium">Réalisation</h2>
          <p className="mt-4">Lean Market, agence de transformation numérique, Kinshasa.</p>
        </section>
        <section className={section}>
          <h2 className="font-display text-3xl font-medium">Hébergement</h2>
          <p className="mt-4">
            Hostinger International Ltd. [À COMPLÉTER : adresse figurant au contrat]
          </p>
        </section>
        <section className={section}>
          <h2 className="font-display text-3xl font-medium">Données personnelles</h2>
          <p className="mt-4">
            Les informations saisies dans les formulaires de réservation et de commande (nom,
            téléphone, adresse de livraison) servent uniquement à traiter votre demande. Elles ne
            sont ni revendues ni utilisées à des fins publicitaires. Pour les consulter ou les
            supprimer, écrivez-nous à {settings.emails[0] ?? 'l’adresse du salon'}.
          </p>
        </section>
      </div>
    </>
  )
}
