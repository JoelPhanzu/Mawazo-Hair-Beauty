import Link from 'next/link'
import {
  FacebookLogo,
  InstagramLogo,
  SnapchatLogo,
  TiktokLogo,
  WhatsappLogo,
  YoutubeLogo,
} from '@phosphor-icons/react/ssr'
import { getSiteSettings } from '@/lib/data/public'
import { formatPhone, groupOpeningHours } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Logo } from './Logo'
import { NAV_LINKS } from './nav'

const SOCIAL_ICONS = {
  instagram: { label: 'Instagram', Icon: InstagramLogo },
  facebook: { label: 'Facebook', Icon: FacebookLogo },
  tiktok: { label: 'TikTok', Icon: TiktokLogo },
  youtube: { label: 'YouTube', Icon: YoutubeLogo },
  snapchat: { label: 'Snapchat', Icon: SnapchatLogo },
} as const

export async function Footer() {
  const settings = await getSiteSettings()
  const socials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter(
    (key) => settings.socialLinks[key],
  )

  return (
    <footer className="border-line border-t">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-14 sm:grid-cols-2 md:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          {settings.tagline && (
            <p className="text-ink-soft mt-5 max-w-[30ch] text-sm">{settings.tagline}</p>
          )}
          <div className="mt-6 flex gap-2">
            <a
              href={buildWhatsAppUrl(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="border-line hover:border-ink flex size-11 items-center justify-center rounded-full border"
            >
              <WhatsappLogo size={20} aria-hidden />
            </a>
            {socials.map((key) => {
              const { label, Icon } = SOCIAL_ICONS[key]
              return (
                <a
                  key={key}
                  href={settings.socialLinks[key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="border-line hover:border-ink flex size-11 items-center justify-center rounded-full border"
                >
                  <Icon size={20} aria-hidden />
                </a>
              )
            })}
          </div>
        </div>

        <nav aria-label="Pied de page">
          <ul className="grid gap-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink-soft hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/reservation" className="text-ink-soft hover:text-ink">
                Prendre rendez-vous
              </Link>
            </li>
          </ul>
        </nav>

        <div className="grid content-start gap-2 text-sm">
          {settings.address && <p className="text-ink-soft max-w-[28ch]">{settings.address}</p>}
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="text-ink-soft hover:text-ink">
              {formatPhone(settings.phone)}
            </a>
          )}
          {settings.emails.map((email) => (
            <a
              key={email}
              href={`mailto:${email}`}
              className="text-ink-soft hover:text-ink break-all"
            >
              {email}
            </a>
          ))}
        </div>

        <dl className="grid content-start gap-3 text-sm">
          {groupOpeningHours(settings.openingHours).map((group) => (
            <div key={group.days}>
              <dt className="text-ink-soft">{group.days}</dt>
              <dd className="font-semibold">{group.hours}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="text-ink-soft mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4 px-4 pb-8 text-xs md:px-8">
        <p>© {settings.businessName}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/mentions-legales" className="hover:text-ink">
            Mentions légales
          </Link>
          <p>
            by <span className="text-ink font-semibold">Lean Market</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
