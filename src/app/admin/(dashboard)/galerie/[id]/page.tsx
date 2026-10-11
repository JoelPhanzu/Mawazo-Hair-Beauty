import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImageField,
  SelectField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deleteGalleryItem, saveGalleryItem } from '../actions'

/** /admin/galerie/nouveau ou /admin/galerie/<id> */
export default async function GalleryItemPage({ params }: PageProps<'/admin/galerie/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const isNew = id === 'nouveau'
  const [[item], services] = await Promise.all([
    isNew
      ? Promise.resolve([undefined])
      : db.select().from(schema.galleryItems).where(eq(schema.galleryItems.id, id)),
    db
      .select({ id: schema.services.id, name: schema.services.name })
      .from(schema.services)
      .orderBy(asc(schema.services.position)),
  ])
  if (!isNew && !item) notFound()

  return (
    <AdminPage
      title={item?.title ?? 'Nouvelle réalisation'}
      back={{ href: '/admin/galerie', label: 'Avant / Après' }}
    >
      <AdminForm
        action={saveGalleryItem.bind(null, item?.id ?? null)}
        submitLabel={item ? 'Enregistrer' : 'Ajouter la réalisation'}
        redirectBase={`/admin/galerie`}
      >
        <FormSection title="Photos">
          <div className="grid gap-6 sm:grid-cols-2">
            <ImageField
              name="beforeImageUrl"
              label="Avant (facultatif)"
              defaultValue={item?.beforeImageUrl}
            />
            <ImageField name="afterImageUrl" label="Après" defaultValue={item?.afterImageUrl} />
          </div>
          <p className="text-ink-soft text-sm">
            Astuce : prenez les deux photos sous le même angle et le même cadrage.
          </p>
        </FormSection>
        <FormSection title="Légende">
          <TextField
            name="title"
            label="Titre"
            defaultValue={item?.title}
            hint="Ex. « Transformation Wings »"
          />
          <TextField name="caption" label="Petite description" defaultValue={item?.caption} />
          <SelectField
            name="serviceId"
            label="Prestation"
            defaultValue={item?.serviceId}
            emptyLabel="Aucune"
            options={services.map((s) => ({ value: s.id, label: s.name }))}
          />
        </FormSection>
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Publier sur le site"
            defaultChecked={item?.isPublished ?? true}
          />
          <ToggleField
            name="isFeatured"
            label="Afficher sur l'accueil"
            description="Jusqu'à 3 réalisations mises en avant."
            defaultChecked={item?.isFeatured ?? false}
          />
        </FormSection>
      </AdminForm>
      {item && (
        <DeleteButton
          action={deleteGalleryItem.bind(null, item.id)}
          redirectTo="/admin/galerie"
          label="Supprimer"
        />
      )}
    </AdminPage>
  )
}
