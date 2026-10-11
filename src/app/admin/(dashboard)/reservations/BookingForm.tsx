import {
  AdminForm,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/admin/form'
import type { bookings } from '@/db/schema'
import { bookingTimeSlots } from '@/lib/dates'
import { formatPhone } from '@/lib/format'
import { saveBooking } from './actions'

type Booking = typeof bookings.$inferSelect

export function AdminBookingForm({
  booking,
  services,
  minDate,
}: {
  booking?: Booking
  services: { id: string; name: string }[]
  minDate?: string
}) {
  const slots = bookingTimeSlots()
  return (
    <AdminForm
      action={saveBooking.bind(null, booking?.id ?? null)}
      submitLabel={booking ? 'Enregistrer' : 'Enregistrer le rendez-vous'}
      redirectBase={`/admin/reservations`}
    >
      <FormSection title="Rendez-vous">
        <SelectField
          name="serviceId"
          label="Prestation"
          defaultValue={booking?.serviceId}
          emptyLabel="Choisir"
          options={services.map((s) => ({ value: s.id, label: s.name }))}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="requestedDate"
            label="Date"
            type="date"
            defaultValue={booking?.requestedDate ?? minDate}
          />
          <SelectField
            name="requestedTime"
            label="Heure"
            defaultValue={booking?.requestedTime}
            emptyLabel="Choisir"
            options={[...new Set([...(booking ? [booking.requestedTime] : []), ...slots])]
              .sort()
              .map((s) => ({ value: s, label: s.replace(':', 'h') }))}
          />
        </div>
        {!booking && (
          <SelectField
            name="source"
            label="Pris par"
            defaultValue="manuelle"
            options={[
              { value: 'manuelle', label: 'Téléphone ou au salon' },
              { value: 'whatsapp', label: 'WhatsApp' },
            ]}
          />
        )}
      </FormSection>
      <FormSection title="Cliente">
        <TextField name="customerName" label="Nom" defaultValue={booking?.customerName} />
        <TextField
          name="customerPhone"
          label="Téléphone"
          type="tel"
          inputMode="tel"
          defaultValue={booking ? formatPhone(booking.customerPhone) : ''}
        />
        <TextAreaField
          name="message"
          label="Message de la cliente"
          defaultValue={booking?.message}
          rows={2}
        />
        <TextAreaField
          name="internalNote"
          label="Note interne (jamais visible par la cliente)"
          defaultValue={booking?.internalNote}
          rows={2}
        />
      </FormSection>
    </AdminForm>
  )
}
