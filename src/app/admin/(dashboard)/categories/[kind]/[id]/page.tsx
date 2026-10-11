import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { AdminForm, DeleteButton, ImageField, TextField } from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deleteCategory, saveCategory, type CategoryKind } from '../../actions'

const TABLES = { prestations: schema.serviceCategories, boutique: schema.productCategories }

export default async function CategoryPage({ params }: PageProps<'/admin/categories/[kind]/[id]'>) {
  await requireUser()
  const { kind, id } = await params
  if (kind !== 'prestations' && kind !== 'boutique') notFound()
  const k = kind as CategoryKind
  const isNew = id === 'nouveau'

  const table = TABLES[k]
  const [category] = isNew
    ? [undefined]
    : await getDb().select().from(table).where(eq(table.id, id))
  if (!isNew && !category) notFound()

  return (
    <AdminPage
      title={category?.name ?? 'Nouvelle catégorie'}
      description={k === 'prestations' ? 'Catégorie de prestations' : 'Catégorie de la boutique'}
      back={{ href: '/admin/categories', label: 'Catégories' }}
    >
      <AdminForm
        action={saveCategory.bind(null, k, category?.id ?? null)}
        submitLabel={category ? 'Enregistrer' : 'Créer la catégorie'}
        redirectBase={`/admin/categories/${k}`}
      >
        <TextField name="name" label="Nom" defaultValue={category?.name} />
        <ImageField
          name="imageUrl"
          label="Image (facultative)"
          defaultValue={category?.imageUrl}
          hint={
            k === 'boutique'
              ? 'Affichée sur l’accueil. Sinon, la photo du premier produit est utilisée.'
              : undefined
          }
        />
      </AdminForm>
      {category && (
        <DeleteButton
          action={deleteCategory.bind(null, k, category.id)}
          redirectTo="/admin/categories"
          label="Supprimer la catégorie"
        />
      )}
    </AdminPage>
  )
}
