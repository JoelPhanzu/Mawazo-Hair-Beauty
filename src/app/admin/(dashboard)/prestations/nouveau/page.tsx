import { asc } from 'drizzle-orm'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { ServiceForm } from '../ServiceForm'

export default async function NewServicePage() {
  await requireUser()
  const categories = await getDb()
    .select({ id: schema.serviceCategories.id, name: schema.serviceCategories.name })
    .from(schema.serviceCategories)
    .orderBy(asc(schema.serviceCategories.position))
  return (
    <AdminPage
      title="Nouvelle prestation"
      back={{ href: '/admin/prestations', label: 'Prestations' }}
    >
      <ServiceForm categories={categories} />
    </AdminPage>
  )
}
