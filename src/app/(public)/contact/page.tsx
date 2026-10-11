import type { Metadata } from 'next'
import {
  EnvelopeSimple,
  InstagramLogo,
  MapPin,
  Phone,
  WhatsappLogo,
} from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { PageHeader } from '@/components/public/PageHeader'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { getPageSections, getSiteSettings } from '@/lib/data/public'
import { formatPhone, groupOpeningHours } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Contact et accès',
  description:
    'Adresse, horaires, téléphone et WhatsApp du salon Mawazo Hair & Beauty à Lingwala, Kinshasa.',
}

export default async function ContactPage() {
  const [settings, { contact_intro: intro, home_visit: visit }] = await Promise.all([
    getSiteSettings(),
    getPageSections(),
  ])

  const row = 'flex items-start gap-4 py-5'
  return (
    <>
      <PageHeader title={intro?.title ?? 'Contact'} intro={intro?.body} />
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 pb-24 md:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <ul className="divide-line border-line divide-y border-y text-lg">
            {settings.address && (
              <li className={row}>
                <MapPin size={24} className="text-accent mt-0.5 shrink-0" aria-hidden />
                <div>
                  <p>{settings.address}</p>
                  {settings.googleMapsUrl && (
                    <a
                      href={settings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-sm font-semibold underline underline-offset-4"
                    >
                      Voir l&apos;itinéraire
                    </a>
                  )}
                </div>
              </li>
            )}
            {settings.phone && (
              <li className={row}>
                <Phone size={24} className="text-accent mt-0.5 shrink-0" aria-hidden />
                <a href={`tel:${settings.phone}`} className="hover:text-accent">
                  {formatPhone(settings.phone)}
                </a>
              </li>
            )}
            {settings.emails.length > 0 && (
              <li className={row}>
                <EnvelopeSimple size={24} className="text-accent mt-0.5 shrink-0" aria-hidden />
                <div className="grid gap-1">
                  {settings.emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="hover:text-accent break-all">
                      {email}
                    </a>
                  ))}
                </div>
              </li>
            )}
            {settings.socialLinks.instagram && (
              <li className={row}>
                <InstagramLogo size={24} className="text-accent mt-0.5 shrink-0" aria-hidden />
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  Instagram
                </a>
              </li>
            )}
          </ul>

          <dl className="mt-10 grid gap-4 sm:grid-cols-2">
            {groupOpeningHours(settings.openingHours).map((g) => (
              <div key={g.days}>
                <dt className="text-ink-soft text-sm">{g.days}</dt>
                <dd className="font-display mt-1 text-2xl font-semibold">{g.hours}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink
              href={buildWhatsAppUrl(
                settings.whatsappNumber,
                'Bonjour Mawazo, je souhaite un renseignement.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
            >
              <WhatsappLogo size={18} weight="fill" aria-hidden />
              Écrire sur WhatsApp
            </ButtonLink>
            <ButtonLink href="/reservation" variant="outline">
              Prendre rendez-vous
            </ButtonLink>
          </div>
        </div>

        <PhotoSlot
          src={visit?.imageUrl}
          alt="Le salon Mawazo à Lingwala"
          brief="intérieur du salon ou devanture"
          className="aspect-[4/5] lg:aspect-auto lg:min-h-[560px]"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </>
  )
}
