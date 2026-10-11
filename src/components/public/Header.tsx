import Link from 'next/link'
import { Suspense } from 'react'
import { ButtonLink } from './ButtonLink'
import { CartLink } from './cart/CartLink'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { NAV_LINKS } from './nav'

export function Header() {
  return (
    <header className="border-line/70 bg-cream/90 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-4 px-4 md:px-8">
        <Logo />

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-6 lg:flex xl:gap-8"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-soft hover:text-ink text-sm font-medium whitespace-nowrap transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartLink />
          <ButtonLink href="/reservation" className="hidden min-h-11 px-5 lg:inline-flex">
            Prendre rendez-vous
          </ButtonLink>
          <Suspense fallback={<span className="size-11 lg:hidden" />}>
            <MobileMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
