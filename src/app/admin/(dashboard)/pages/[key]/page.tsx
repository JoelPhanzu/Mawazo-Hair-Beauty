import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  AdminForm,
  FormSection,
  ImageField,
  TextAreaField,
  TextField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { PAGE_SECTIONS } from '@/lib/admin/sections'
import { requireUser } from '@/lib/auth/session'
import { saveSection } from '../actions'

export default async function SectionPage({ params }: PageProps<'/admin/pages/[key]'>) {
  await requireUser()
  const { key } = await params
  const section = PAGE_SECTIONS.find((s) => s.key === key)
  if (!section) notFound()
  const [row] = await getDb()
    .select()
    .from(schema.pageSections)
    .where(eq(schema.pageSections.key, key))
  const has = (field: (typeof section.fields)[number]) => section.fields.includes(field)

  return (
    <AdminPage
      title={section.label}
      description={`Page : ${section.page}`}
      back={{ href: '/admin/pages', label: 'Textes et images' }}
    >
      <AdminForm action={saveSection.bind(null, key)}>
        <FormSection title="Texte">
          {has('title') && (
            <TextField name="title" label="Titre" defaultValue={row?.title} hint={section.help} />
          )}
          {has('body') && (
            <TextAreaField
              name="body"
              label="Texte"
              defaultValue={row?.body}
              rows={key === 'home_about' ? 8 : 3}
            />
          )}
        </FormSection>
        {(has('imageUrl') || has('secondaryImageUrl')) && (
          <FormSection title="Photos">
            {has('imageUrl') && (
              <ImageField
                name="imageUrl"
                label={has('secondaryImageUrl') ? 'Photo principale' : 'Photo'}
                defaultValue={row?.imageUrl}
                hint="Une vraie photo du salon ou d'une réalisation, de préférence verticale."
              />
            )}
            {has('secondaryImageUrl') && (
              <ImageField
                name="secondaryImageUrl"
                label="Photo de détail (ordinateur uniquement)"
                defaultValue={row?.secondaryImageUrl}
                aspect="aspect-square"
              />
            )}
          </FormSection>
        )}
        {has('button') && (
          <FormSection title="Bouton">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="buttonLabel"
                label="Texte du bouton"
                defaultValue={row?.buttonLabel}
              />
              <TextField
                name="buttonHref"
                label="Lien"
                defaultValue={row?.buttonHref}
                hint="/reservation, /boutique, /prestations…"
              />
            </div>
          </FormSection>
        )}
        {/* Conserve les champs non utilisés par cette section. */}
        {!has('imageUrl') && <input type="hidden" name="imageUrl" value={row?.imageUrl ?? ''} />}
        {!has('secondaryImageUrl') && (
          <input type="hidden" name="secondaryImageUrl" value={row?.secondaryImageUrl ?? ''} />
        )}
        {!has('button') && (
          <>
            <input type="hidden" name="buttonLabel" value={row?.buttonLabel ?? ''} />
            <input type="hidden" name="buttonHref" value={row?.buttonHref ?? ''} />
          </>
        )}
      </AdminForm>
    </AdminPage>
  )
}
