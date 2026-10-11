import Link from 'next/link'

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex flex-col leading-none"
      aria-label="Mawazo Hair & Beauty, accueil"
    >
      <span className="font-display text-[1.7rem] font-semibold tracking-tight">Mawazo</span>
      <span className="text-ink-soft mt-0.5 text-[0.62rem] font-semibold tracking-[0.28em] uppercase">
        Hair &amp; Beauty
      </span>
    </Link>
  )
}
