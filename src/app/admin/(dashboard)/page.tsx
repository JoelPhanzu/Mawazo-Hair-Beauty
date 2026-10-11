import Link from 'next/link'
import { and, asc, desc, eq, gt, inArray } from 'drizzle-orm'
import { CalendarPlus, PlusCircle, Tag } from '@phosphor-icons/react/ssr'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { kinshasaDateString } from '@/lib/dates'
import { formatAmount } from '@/lib/format'
import { getActivePromotions } from '@/lib/pricing'
import { getPromotions } from '@/lib/data/public'
import { BOOKING_TONES, ORDER_TONES } from '@/lib/admin/labels'

const shortDate = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export default async function DashboardPage() {
  const user = await requireUser()
  const db = getDb()
  const today = kinshasaDateString(new Date())

  const [todayBookings, upcoming, pendingOrders, promotions] = await Promise.all([
    db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.requestedDate, today))
      .orderBy(asc(schema.bookings.requestedTime)),
    db
      .select()
      .from(schema.bookings)
      .where(
        and(
          gt(schema.bookings.requestedDate, today),
          inArray(schema.bookings.status, ['nouvelle', 'confirmée']),
        ),
      )
      .orderBy(asc(schema.bookings.requestedDate), asc(schema.bookings.requestedTime))
      .limit(6),
    db
      .select()
      .from(schema.orders)
      .where(inArray(schema.orders.status, ['nouvelle', 'confirmée', 'payée']))
      .orderBy(desc(schema.orders.createdAt))
      .limit(6),
    getPromotions(),
  ])
  const activeToday = getActivePromotions(promotions, new Date())

  const shortcuts = [
    { href: '/admin/reservations/nouveau', label: 'Noter un rendez-vous', Icon: CalendarPlus },
    { href: '/admin/produits/nouveau', label: 'Ajouter un produit', Icon: PlusCircle },
    { href: '/admin/promotions/nouveau', label: 'Créer une promotion', Icon: Tag },
  ]

  return (
    <AdminPage title={`Bonjour ${user.fullName.split(' ')[0]}`}>
      <div className="grid gap-10">
        <ul className="grid grid-cols-3 gap-3">
          {shortcuts.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="border-line hover:border-ink flex h-full min-h-24 flex-col items-start justify-between gap-2 rounded-3xl border p-3 text-sm font-semibold md:p-4"
              >
                <Icon size={24} className="text-accent" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <section>
          <h2 className="font-display text-3xl font-semibold">Aujourd&apos;hui</h2>
          <div className="mt-4">
            {todayBookings.length === 0 ? (
              <EmptyState>Aucun rendez-vous aujourd&apos;hui.</EmptyState>
            ) : (
              <ListCard>
                {todayBookings.map((b) => (
                  <li key={b.id}>
                    <ListRow
                      href={`/admin/reservations/${b.id}`}
                      title={`${b.requestedTime.replace(':', 'h')} - ${b.customerName}`}
                      subtitle={b.serviceName}
                      aside={<Badge tone={BOOKING_TONES[b.status]}>{b.status}</Badge>}
                    />
                  </li>
                ))}
              </ListCard>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl font-semibold">À venir</h2>
            <Link href="/admin/reservations" className="text-accent min-h-11 text-sm font-semibold">
              Tout voir
            </Link>
          </div>
          <div className="mt-4">
            {upcoming.length === 0 ? (
              <EmptyState>Pas de rendez-vous à venir.</EmptyState>
            ) : (
              <ListCard>
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <ListRow
                      href={`/admin/reservations/${b.id}`}
                      title={b.customerName}
                      subtitle={`${shortDate.format(new Date(`${b.requestedDate}T12:00:00Z`))} à ${b.requestedTime.replace(':', 'h')} - ${b.serviceName}`}
                      aside={<Badge tone={BOOKING_TONES[b.status]}>{b.status}</Badge>}
                    />
                  </li>
                ))}
              </ListCard>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl font-semibold">Commandes à traiter</h2>
            <Link href="/admin/commandes" className="text-accent min-h-11 text-sm font-semibold">
              Tout voir
            </Link>
          </div>
          <div className="mt-4">
            {pendingOrders.length === 0 ? (
              <EmptyState>Aucune commande en attente.</EmptyState>
            ) : (
              <ListCard>
                {pendingOrders.map((o) => (
                  <li key={o.id}>
                    <ListRow
                      href={`/admin/commandes/${o.id}`}
                      title={`${o.reference} - ${o.customerName}`}
                      subtitle={formatAmount(o.totalAmount, o.currency)}
                      aside={<Badge tone={ORDER_TONES[o.status]}>{o.status}</Badge>}
                    />
                  </li>
                ))}
              </ListCard>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-semibold">
            Promotions actives aujourd&apos;hui
          </h2>
          <div className="mt-4">
            {activeToday.length === 0 ? (
              <EmptyState>Aucune promotion active aujourd&apos;hui.</EmptyState>
            ) : (
              <ListCard>
                {activeToday.map((p) => (
                  <li key={p.id}>
                    <ListRow
                      href={`/admin/promotions/${p.id}`}
                      title={p.title}
                      subtitle={p.subtitle}
                    />
                  </li>
                ))}
              </ListCard>
            )}
          </div>
        </section>
      </div>
    </AdminPage>
  )
}
