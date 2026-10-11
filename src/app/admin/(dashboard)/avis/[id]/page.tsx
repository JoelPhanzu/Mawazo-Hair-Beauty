import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deleteTestimonial, saveTestimonial } from '../actions'

/** /admin/avis/nouveau ou /admin/avis/<id> */
export default async function TestimonialPage({ params }: PageProps<'/admin/avis/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const isNew = id === 'nouveau'
  const [[item], services] = await Promise.all([
    isNew
      ? Promise.resolve([undefined])
      : db.select().from(schema.testimonials).where(eq(schema.testimonials.id, id)),
    db
      .select({ id: schema.services.id, name: schema.services.name })
      .from(schema.services)
      .orderBy(asc(schema.services.position)),
  ])
  if (!isNew && !item) notFound()

  return (
    <AdminPage
      title={item?.displayName ?? 'Nouvel avis'}
      back={{ href: '/admin/avis', label: 'Avis clientes' }}
    >
      <AdminForm
        action={saveTestimonial.bind(null, item?.id ?? null)}
        submitLabel={item ? 'Enregistrer' : 'Ajouter l’avis'}
        redirectBase={`/admin/avis`}
      >
        <FormSection title="Accord de la cliente">
          <ToggleField
            name="consentObtained"
            label="La cliente a accepté que son avis soit publié"
            description="Obligatoire pour publier. Gardez une trace de son accord (message WhatsApp…)."
            defaultChecked={item?.consentObtained ?? false}
          />
          <ToggleField
            name="isPublished"
            label="Publier sur le site"
            defaultChecked={item?.isPublished ?? false}
          />
        </FormSection>
        <FormSection title="Avis">
          <TextField
            name="displayName"
            label="Nom affiché"
            defaultValue={item?.displayName}
            hint="Prénom + initiale du nom (ex. « Nadège K. »)"
          />
          <TextAreaField
            name="body"
            label="Texte de l'avis"
            defaultValue={item?.body}
            hint="Court : 2 ou 3 lignes."
          />
          <SelectField
            name="rating"
            label="Note"
            defaultValue={item?.rating ? String(item.rating) : ''}
            emptyLabel="Sans note"
            options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} / 5` }))}
          />
          <SelectField
            name="serviceId"
            label="Prestation"
            defaultValue={item?.serviceId}
            emptyLabel="Aucune"
            options={services.map((s) => ({ value: s.id, label: s.name }))}
          />
        </FormSection>
      </AdminForm>
      {item && (
        <DeleteButton
          action={deleteTestimonial.bind(null, item.id)}
          redirectTo="/admin/avis"
          label="Supprimer l'avis"
        />
      )}
    </AdminPage>
  )
}
