import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { formatAmount } from '@/lib/format'
import { moveService } from './actions'

export const metadata: Metadata = { title: 'Prestations' }

export default async function ServicesAdminPage() {
  await requireUser()
  const rows = await getDb().select().from(schema.services).orderBy(asc(schema.services.position))

  return (
    <AdminPage
      title="Prestations"
      description="L'ordre de la liste est celui du site. Utilisez les flèches pour le changer."
      action={{ href: '/admin/prestations/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucune prestation pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((s, i) => (
            <li key={s.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/prestations/${s.id}`}
                  image={<Thumb src={s.imageUrl} />}
                  title={s.name}
                  subtitle={`${s.priceIsFrom ? 'À partir de ' : ''}${formatAmount(s.priceAmount, s.currency)}`}
                  aside={
                    <>
                      {s.isPublished ? (
                        <Badge tone="success">En ligne</Badge>
                      ) : (
                        <Badge tone="muted">Masquée</Badge>
                      )}
                      {s.isFeatured && <Badge>Accueil</Badge>}
                    </>
                  }
                />
              </div>
              <MoveButtons
                onMove={moveService.bind(null, s.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={s.name}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
