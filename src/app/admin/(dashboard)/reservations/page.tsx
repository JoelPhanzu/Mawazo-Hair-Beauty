import type { Metadata } from 'next'
import Link from 'next/link'
import { and, asc, desc, eq, gte, lt, type SQL } from 'drizzle-orm'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { BOOKING_STATUSES } from '@/db/schema'
import { BOOKING_TONES } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { kinshasaDateString } from '@/lib/dates'

export const metadata: Metadata = { title: 'Réservations' }

const PERIODS = {
  'a-venir': 'À venir',
  aujourdhui: "Aujourd'hui",
  passees: 'Passées',
} as const

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export default async function BookingsPage({ searchParams }: PageProps<'/admin/reservations'>) {
  await requireUser()
  const params = await searchParams
  const period = (
    typeof params.periode === 'string' && params.periode in PERIODS ? params.periode : 'a-venir'
  ) as keyof typeof PERIODS
  const status = BOOKING_STATUSES.find((s) => s === params.statut)

  const today = kinshasaDateString(new Date())
  const conditions: SQL[] = []
  if (period === 'a-venir') conditions.push(gte(schema.bookings.requestedDate, today))
  if (period === 'aujourdhui') conditions.push(eq(schema.bookings.requestedDate, today))
  if (period === 'passees') conditions.push(lt(schema.bookings.requestedDate, today))
  if (status) conditions.push(eq(schema.bookings.status, status))

  const order =
    period === 'passees'
      ? [desc(schema.bookings.requestedDate), desc(schema.bookings.requestedTime)]
      : [asc(schema.bookings.requestedDate), asc(schema.bookings.requestedTime)]
  const rows = await getDb()
    .select()
    .from(schema.bookings)
    .where(and(...conditions))
    .orderBy(...order)
    .limit(200)

  const link = (next: { periode?: string; statut?: string }) => {
    const query = new URLSearchParams({
      periode: next.periode ?? period,
      ...((next.statut ?? status) ? { statut: next.statut ?? status! } : {}),
    })
    if (next.statut === '') query.delete('statut')
    return `/admin/reservations?${query}`
  }
  const pill = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold ${
      active ? 'bg-ink text-cream border-ink' : 'border-line'
    }`

  return (
    <AdminPage
      title="Réservations"
      action={{ href: '/admin/reservations/nouveau', label: 'Noter un RDV' }}
    >
      <div className="grid gap-3">
        <nav aria-label="Période" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((p) => (
            <Link key={p} href={link({ periode: p })} className={pill(p === period)}>
              {PERIODS[p]}
            </Link>
          ))}
        </nav>
        <nav aria-label="Statut" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Link href={link({ statut: '' })} className={pill(!status)}>
            Tous les statuts
          </Link>
          {BOOKING_STATUSES.map((s) => (
            <Link key={s} href={link({ statut: s })} className={`${pill(s === status)} capitalize`}>
              {s}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState>Aucune réservation pour ce filtre.</EmptyState>
        ) : (
          <ListCard>
            {rows.map((b) => (
              <li key={b.id}>
                <ListRow
                  href={`/admin/reservations/${b.id}`}
                  title={b.customerName}
                  subtitle={`${dateFormatter.format(new Date(`${b.requestedDate}T12:00:00Z`))} à ${b.requestedTime.replace(':', 'h')} - ${b.serviceName}`}
                  aside={
                    <>
                      <Badge tone={BOOKING_TONES[b.status]}>{b.status}</Badge>
                      <span className="text-ink-soft text-xs">{b.reference}</span>
                    </>
                  }
                />
              </li>
            ))}
          </ListCard>
        )}
      </div>
    </AdminPage>
  )
}
