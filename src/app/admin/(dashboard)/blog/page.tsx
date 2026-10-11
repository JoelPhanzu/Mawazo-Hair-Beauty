import type { Metadata } from 'next'
import { desc } from 'drizzle-orm'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Blog' }

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function BlogAdminPage() {
  await requireUser()
  const rows = await getDb().select().from(schema.posts).orderBy(desc(schema.posts.createdAt))
  const now = new Date()

  return (
    <AdminPage title="Blog" action={{ href: '/admin/blog/nouveau', label: 'Écrire' }}>
      {rows.length === 0 ? (
        <EmptyState>Aucun article.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((p) => (
            <li key={p.id}>
              <ListRow
                href={`/admin/blog/${p.id}`}
                image={<Thumb src={p.imageUrl} />}
                title={p.title}
                subtitle={p.publishedAt ? dateFormatter.format(p.publishedAt) : 'Brouillon'}
                aside={
                  !p.publishedAt ? (
                    <Badge tone="muted">Brouillon</Badge>
                  ) : p.publishedAt > now ? (
                    <Badge>Programmé</Badge>
                  ) : (
                    <Badge tone="success">En ligne</Badge>
                  )
                }
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
