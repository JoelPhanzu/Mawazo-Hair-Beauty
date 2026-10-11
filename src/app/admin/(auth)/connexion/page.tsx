import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { LoginForm } from '@/components/admin/LoginForm'
import { isDatabaseConfigured } from '@/db'
import { getCurrentUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
}

/** Déjà connectée : direction le tableau de bord. */
async function RedirectIfLoggedIn() {
  if (isDatabaseConfigured() && (await getCurrentUser())) redirect('/admin')
  return null
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <div className="w-full max-w-sm">
        <p className="font-display text-4xl font-semibold">Mawazo</p>
        <p className="text-ink-soft mt-1">Espace de gestion du salon</p>
        <div className="mt-10">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
