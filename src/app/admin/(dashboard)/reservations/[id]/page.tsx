import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { WhatsappLogo } from '@phosphor-icons/react/ssr'
import { StatusButtons } from '@/components/admin/StatusButtons'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { BOOKING_STATUSES } from '@/db/schema'
import { requireUser } from '@/lib/auth/session'
import { formatIsoDate, kinshasaDateString } from '@/lib/dates'
import { formatPhone } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { setBookingStatus } from '../actions'
import { AdminBookingForm } from '../BookingForm'

const SOURCES = { site: 'Site internet', whatsapp: 'WhatsApp', manuelle: 'Téléphone ou salon' }

/** /admin/reservations/nouveau ou /admin/reservations/<id> */
export default async function BookingPage({ params }: PageProps<'/admin/reservations/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const isNew = id === 'nouveau'
  const [[booking], services] = await Promise.all([
    isNew
      ? Promise.resolve([undefined])
      : db.select().from(schema.bookings).where(eq(schema.bookings.id, id)),
    db
      .select({ id: schema.services.id, name: schema.services.name })
      .from(schema.services)
      .orderBy(asc(schema.services.position)),
  ])
  if (!isNew && !booking) notFound()

  if (!booking) {
    return (
      <AdminPage
        title="Noter un rendez-vous"
        back={{ href: '/admin/reservations', label: 'Réservations' }}
      >
        <AdminBookingForm services={services} minDate={kinshasaDateString(new Date())} />
      </AdminPage>
    )
  }

  const reply = buildWhatsAppUrl(
    booking.customerPhone,
    `Bonjour ${booking.customerName}, ici le salon Mawazo. Votre rendez-vous ${booking.serviceName} du ${formatIsoDate(booking.requestedDate)} à ${booking.requestedTime.replace(':', 'h')} est `,
  )

  return (
    <AdminPage
      title={booking.customerName}
      description={`${booking.reference} - ${SOURCES[booking.source]}`}
      back={{ href: '/admin/reservations', label: 'Réservations' }}
    >
      <div className="grid gap-8">
        <div className="bg-cream-deep rounded-3xl p-5">
          <p className="font-display text-2xl font-semibold">{booking.serviceName}</p>
          <p className="mt-1 capitalize">
            {formatIsoDate(booking.requestedDate)} à {booking.requestedTime.replace(':', 'h')}
          </p>
          <p className="text-ink-soft mt-1">{formatPhone(booking.customerPhone)}</p>
          {booking.message && <p className="mt-3 italic">« {booking.message} »</p>}
          <a
            href={reply}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp mt-5 inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white dark:text-[#10261a]"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            Répondre sur WhatsApp
          </a>
        </div>

        <section>
          <h2 className="mb-3 font-semibold">Statut</h2>
          <StatusButtons
            statuses={BOOKING_STATUSES}
            current={booking.status}
            onChange={setBookingStatus.bind(null, booking.id)}
          />
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-semibold">Modifier</h2>
          <AdminBookingForm booking={booking} services={services} />
        </section>
      </div>
    </AdminPage>
  )
}
