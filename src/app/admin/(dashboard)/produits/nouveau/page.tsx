import { asc } from 'drizzle-orm'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { ProductForm } from '../ProductForm'

export default async function NewProductPage() {
  await requireUser()
  const categories = await getDb()
    .select({ id: schema.productCategories.id, name: schema.productCategories.name })
    .from(schema.productCategories)
    .orderBy(asc(schema.productCategories.position))
  return (
    <AdminPage title="Nouveau produit" back={{ href: '/admin/produits', label: 'Produits' }}>
      <ProductForm categories={categories} />
    </AdminPage>
  )
}
