import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { ProductForm } from '../ProductForm'

export default async function EditProductPage({ params }: PageProps<'/admin/produits/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const [[product], categories] = await Promise.all([
    db.select().from(schema.products).where(eq(schema.products.id, id)),
    db
      .select({ id: schema.productCategories.id, name: schema.productCategories.name })
      .from(schema.productCategories)
      .orderBy(asc(schema.productCategories.position)),
  ])
  if (!product) notFound()

  return (
    <AdminPage title={product.name} back={{ href: '/admin/produits', label: 'Produits' }}>
      <ProductForm product={product} categories={categories} />
    </AdminPage>
  )
}
