import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AddButton, AdminPage, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { moveCategory, type CategoryKind } from './actions'

export const metadata: Metadata = { title: 'Catégories' }

export default async function CategoriesPage() {
  await requireUser()
  const db = getDb()
  const [serviceCats, productCats] = await Promise.all([
    db.select().from(schema.serviceCategories).orderBy(asc(schema.serviceCategories.position)),
    db.select().from(schema.productCategories).orderBy(asc(schema.productCategories.position)),
  ])

  const sections: { kind: CategoryKind; title: string; rows: typeof serviceCats }[] = [
    { kind: 'prestations', title: 'Catégories de prestations', rows: serviceCats },
    { kind: 'boutique', title: 'Catégories de la boutique', rows: productCats },
  ]

  return (
    <AdminPage
      title="Catégories"
      description="Elles regroupent les prestations et les produits sur le site."
    >
      <div className="grid gap-12">
        {sections.map(({ kind, title, rows }) => (
          <section key={kind}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-3xl font-semibold">{title}</h2>
              <AddButton href={`/admin/categories/${kind}/nouveau`} label="Ajouter" />
            </div>
            <div className="mt-4">
              {rows.length === 0 ? (
                <EmptyState>Aucune catégorie.</EmptyState>
              ) : (
                <ListCard>
                  {rows.map((c, i) => (
                    <li key={c.id} className="flex items-center pr-1">
                      <div className="min-w-0 grow">
                        <ListRow
                          href={`/admin/categories/${kind}/${c.id}`}
                          image={<Thumb src={c.imageUrl} />}
                          title={c.name}
                        />
                      </div>
                      <MoveButtons
                        onMove={moveCategory.bind(null, kind, c.id)}
                        first={i === 0}
                        last={i === rows.length - 1}
                        label={c.name}
                      />
                    </li>
                  ))}
                </ListCard>
              )}
            </div>
          </section>
        ))}
      </div>
    </AdminPage>
  )
}
