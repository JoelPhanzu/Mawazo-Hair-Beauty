import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { ServiceForm } from '../ServiceForm'

export default async function EditServicePage({ params }: PageProps<'/admin/prestations/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const [[service], categories] = await Promise.all([
    db.select().from(schema.services).where(eq(schema.services.id, id)),
    db
      .select({ id: schema.serviceCategories.id, name: schema.serviceCategories.name })
      .from(schema.serviceCategories)
      .orderBy(asc(schema.serviceCategories.position)),
  ])
  if (!service) notFound()

  return (
    <AdminPage title={service.name} back={{ href: '/admin/prestations', label: 'Prestations' }}>
      <ServiceForm service={service} categories={categories} />
    </AdminPage>
  )
}
