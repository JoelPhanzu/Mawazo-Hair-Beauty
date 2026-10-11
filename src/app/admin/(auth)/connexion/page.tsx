import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { LoginForm } from '@/components/admin/LoginForm'
import { SetupForm } from '@/components/admin/SetupForm'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import { getCurrentUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
}

/** Connexion, ou création du premier compte si aucun n'existe encore. */
async function Content() {
  await connection()
  if (!isDatabaseConfigured()) {
    return <p className="text-ink-soft">La base de données n’est pas encore reliée au site.</p>
  }
  if (await getCurrentUser()) redirect('/admin')

  const users = await getDb().select({ id: schema.users.id }).from(schema.users).limit(1)
  if (users.length === 0) {
    return (
      <>
        <p className="mb-6">
          Bienvenue ! Créez le compte de la gérante avec le code de première connexion remis par
          Lean Market.
        </p>
        <SetupForm />
      </>
    )
  }
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="font-display text-4xl font-semibold">Mawazo</p>
        <p className="text-ink-soft mt-1">Espace de gestion du salon</p>
        <div className="mt-10">
          <Suspense fallback={<div className="bg-cream-deep h-64 animate-pulse rounded-3xl" />}>
            <Content />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
