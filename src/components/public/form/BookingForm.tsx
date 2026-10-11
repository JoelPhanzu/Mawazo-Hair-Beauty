'use client'

import { WhatsappLogo } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { buildBookingMessage } from '@/lib/messages'
import { normalizeCongoPhone } from '@/lib/phone'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Field, inputClass, textareaClass } from './Field'

interface BookingFormProps {
  services: { slug: string; name: string }[]
  slots: string[]
  minDate: string
  defaultService?: string
  whatsappNumber: string
}

type Errors = Record<string, string>

export function BookingForm({
  services,
  slots,
  minDate,
  defaultService,
  whatsappNumber,
}: BookingFormProps) {
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<{ url: string; reference: string | null } | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      customerName: String(form.get('customerName') ?? ''),
      customerPhone: String(form.get('customerPhone') ?? ''),
      serviceSlug: String(form.get('serviceSlug') ?? ''),
      requestedDate: String(form.get('requestedDate') ?? ''),
      requestedTime: String(form.get('requestedTime') ?? ''),
      message: String(form.get('message') ?? ''),
    }
    setPending(true)
    setErrors({})

    let url: string
    let reference: string | null = null
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!result.ok) {
        setErrors(result.errors ?? { form: 'Vérifiez le formulaire.' })
        setPending(false)
        return
      }
      url = result.whatsappUrl
      reference = result.reference
    } catch {
      // Coupure réseau : on ouvre WhatsApp avec le message, sans référence.
      const service = services.find((s) => s.slug === payload.serviceSlug)
      url = buildWhatsAppUrl(
        whatsappNumber,
        buildBookingMessage({
          ...payload,
          reference: null,
          customerPhone: normalizeCongoPhone(payload.customerPhone) ?? payload.customerPhone,
          serviceName: service?.name ?? payload.serviceSlug,
        }),
      )
    }
    setDone({ url, reference })
    setPending(false)
    window.location.assign(url)
  }

  if (done) {
    return (
      <div className="border-line border p-6 md:p-10" role="status">
        <h2 className="font-display text-4xl font-medium">Demande prête</h2>
        <p className="mt-4 max-w-[48ch]">
          Envoyez le message WhatsApp qui vient de s’ouvrir : le salon vous confirme le rendez-vous
          par retour de message. Aucun créneau n’est réservé tant qu’il n’est pas confirmé.
        </p>
        {done.reference && (
          <p className="mt-4">
            Votre référence : <strong className="text-accent">{done.reference}</strong>
          </p>
        )}
        <a
          href={done.url}
          className="bg-whatsapp mt-8 inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white dark:text-[#10261a]"
        >
          <WhatsappLogo size={18} weight="fill" aria-hidden />
          Ouvrir WhatsApp
        </a>
      </div>
    )
  }

  const describedBy = (name: string) => (errors[name] ? `${name}-error` : undefined)

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <Field id="serviceSlug" label="Prestation" error={errors.serviceSlug}>
        <select
          id="serviceSlug"
          name="serviceSlug"
          defaultValue={defaultService ?? ''}
          required
          aria-invalid={Boolean(errors.serviceSlug)}
          aria-describedby={describedBy('serviceSlug')}
          className={inputClass}
        >
          <option value="" disabled>
            Choisir une prestation
          </option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="requestedDate" label="Date souhaitée" error={errors.requestedDate}>
          <input
            id="requestedDate"
            name="requestedDate"
            type="date"
            min={minDate}
            required
            aria-invalid={Boolean(errors.requestedDate)}
            aria-describedby={describedBy('requestedDate')}
            className={inputClass}
          />
        </Field>
        <Field id="requestedTime" label="Heure souhaitée" error={errors.requestedTime}>
          <select
            id="requestedTime"
            name="requestedTime"
            defaultValue=""
            required
            aria-invalid={Boolean(errors.requestedTime)}
            aria-describedby={describedBy('requestedTime')}
            className={inputClass}
          >
            <option value="" disabled>
              Choisir un créneau
            </option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot.replace(':', 'h')}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="customerName" label="Nom complet" error={errors.customerName}>
          <input
            id="customerName"
            name="customerName"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.customerName)}
            aria-describedby={describedBy('customerName')}
            className={inputClass}
          />
        </Field>
        <Field
          id="customerPhone"
          label="Téléphone (WhatsApp)"
          error={errors.customerPhone}
          hint="Ex. 0850 871 455 ou +243 850 871 455"
        >
          <input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.customerPhone)}
            aria-describedby={describedBy('customerPhone') ?? 'customerPhone-hint'}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="message" label="Message" optional error={errors.message}>
        <textarea id="message" name="message" rows={3} className={textareaClass} />
      </Field>

      {errors.form && (
        <p className="text-accent font-semibold" role="alert">
          {errors.form}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink hover:bg-ink hover:text-cream inline-flex min-h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60"
        >
          <WhatsappLogo size={18} weight="fill" aria-hidden />
          {pending ? 'Envoi…' : 'Envoyer ma demande sur WhatsApp'}
        </button>
        <p className="text-ink-soft mt-3 text-sm">
          Le salon confirme votre rendez-vous par WhatsApp.
        </p>
      </div>
    </form>
  )
}
