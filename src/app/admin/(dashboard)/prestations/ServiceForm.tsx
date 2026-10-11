import Link from 'next/link'
import { ArrowSquareOut } from '@phosphor-icons/react/ssr'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImageField,
  ImagesField,
  PriceField,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import type { services } from '@/db/schema'
import { deleteService, saveService } from './actions'

type Service = typeof services.$inferSelect

export function ServiceForm({
  service,
  categories,
}: {
  service?: Service
  categories: { id: string; name: string }[]
}) {
  return (
    <>
      {service && (
        <Link
          href={`/prestations/${service.slug}`}
          target="_blank"
          className="text-accent mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          Voir sur le site
          <ArrowSquareOut size={16} aria-hidden />
        </Link>
      )}
      <AdminForm
        action={saveService.bind(null, service?.id ?? null)}
        submitLabel={service ? 'Enregistrer' : 'Créer la prestation'}
        redirectBase={`/admin/prestations`}
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Publier sur le site"
            description="Décochez pour masquer la prestation sans la supprimer."
            defaultChecked={service?.isPublished ?? true}
          />
          <ToggleField
            name="isFeatured"
            label="Mettre en avant sur l'accueil"
            defaultChecked={service?.isFeatured ?? false}
          />
        </FormSection>

        <FormSection title="Description">
          <TextField name="name" label="Nom de la prestation" defaultValue={service?.name} />
          <SelectField
            name="categoryId"
            label="Catégorie"
            defaultValue={service?.categoryId}
            emptyLabel="Sans catégorie"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <TextField
            name="shortDescription"
            label="Phrase courte (accueil)"
            defaultValue={service?.shortDescription}
          />
          <TextAreaField
            name="longDescription"
            label="Description complète (page de la prestation)"
            defaultValue={service?.longDescription}
          />
        </FormSection>

        <FormSection title="Prix et durée">
          <PriceField name="priceAmount" label="Prix" defaultValue={service?.priceAmount} />
          <ToggleField
            name="priceIsFrom"
            label="Afficher « À partir de »"
            description="Pour un prix qui varie selon la longueur, le volume…"
            defaultChecked={service?.priceIsFrom ?? true}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="durationMinMinutes"
              label="Durée minimale (minutes)"
              inputMode="numeric"
              defaultValue={service?.durationMinMinutes}
              hint="Ex. 90 pour 1 h 30"
            />
            <TextField
              name="durationMaxMinutes"
              label="Durée maximale (minutes)"
              inputMode="numeric"
              defaultValue={service?.durationMaxMinutes}
            />
          </div>
        </FormSection>

        <FormSection title="Photos">
          <ImageField name="imageUrl" label="Photo principale" defaultValue={service?.imageUrl} />
          <ImagesField
            name="gallery"
            label="Autres réalisations (page de la prestation)"
            defaultValue={service?.gallery}
          />
        </FormSection>
      </AdminForm>

      {service && (
        <div className="mt-2">
          <DeleteButton
            action={deleteService.bind(null, service.id)}
            redirectTo="/admin/prestations"
            label="Supprimer la prestation"
          />
          <p className="text-ink-soft mt-1 text-sm">
            Préférez « Publier sur le site » décoché : la prestation reste dans l&apos;historique
            des réservations.
          </p>
        </div>
      )}
    </>
  )
}
