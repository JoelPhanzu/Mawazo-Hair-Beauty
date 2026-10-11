import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { moveGalleryItem } from './actions'

export const metadata: Metadata = { title: 'Avant / Après' }

export default async function GalleryAdminPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.galleryItems)
    .orderBy(asc(schema.galleryItems.position))

  return (
    <AdminPage
      title="Avant / Après"
      description="Vos transformations. Avec une photo « avant », le site affiche un curseur de comparaison."
      action={{ href: '/admin/galerie/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucune réalisation. Ajoutez votre première transformation !</EmptyState>
      ) : (
        <ListCard>
          {rows.map((g, i) => (
            <li key={g.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/galerie/${g.id}`}
                  image={<Thumb src={g.afterImageUrl} />}
                  title={g.title ?? 'Sans titre'}
                  subtitle={g.beforeImageUrl ? 'Avant / après' : 'Photo seule'}
                  aside={
                    <>
                      {g.isPublished ? (
                        <Badge tone="success">En ligne</Badge>
                      ) : (
                        <Badge tone="muted">Masquée</Badge>
                      )}
                      {g.isFeatured && <Badge>Accueil</Badge>}
                    </>
                  }
                />
              </div>
              <MoveButtons
                onMove={moveGalleryItem.bind(null, g.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={g.title ?? 'la réalisation'}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
