'use client'

import { useState } from 'react'
import { formatAmount } from '@/lib/format'
import { getEffectivePrice } from '@/lib/pricing'
import type { DiscountType, PricedItem, PromotionScope, PromotionTarget } from '@/lib/pricing/types'
import { fieldClass, useFieldError } from './form'

interface Option {
  id: string
  name: string
}

export interface PromotionRulesProps {
  defaults: {
    discountType: DiscountType
    discountValue: number
    scope: PromotionScope
    targets: PromotionTarget[]
    weekdays: number[]
  }
  serviceCategories: Option[]
  productCategories: Option[]
  services: (Option & { categoryId: string | null; priceAmount: number })[]
  products: (Option & { categoryId: string | null; priceAmount: number })[]
}

const TYPES: { value: DiscountType; label: string; help: string }[] = [
  { value: 'percentage', label: 'Pourcentage', help: 'Ex. -20 % sur le prix' },
  { value: 'fixed_amount', label: 'Montant fixe', help: 'Ex. 5 000 FC de moins' },
  {
    value: 'display_only',
    label: 'Affichage seul',
    help: 'Annonce sur le site sans changer les prix (offre négociée au salon)',
  },
]

const SCOPES: { value: PromotionScope; label: string }[] = [
  { value: 'all_services', label: 'Toutes les prestations' },
  { value: 'all_products', label: 'Tous les produits' },
  { value: 'service_category', label: 'Une ou plusieurs catégories de prestations' },
  { value: 'product_category', label: 'Une ou plusieurs catégories de produits' },
  { value: 'items', label: 'Des prestations ou produits choisis' },
]

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function Error({ name }: { name: string }) {
  const error = useFieldError(name)
  return error ? <p className="text-accent text-sm font-semibold">{error}</p> : null
}

export function PromotionRules({
  defaults,
  serviceCategories,
  productCategories,
  services,
  products,
}: PromotionRulesProps) {
  const [type, setType] = useState(defaults.discountType)
  const [value, setValue] = useState(defaults.discountValue ? String(defaults.discountValue) : '')
  const [scope, setScope] = useState(defaults.scope)
  const [targets, setTargets] = useState<PromotionTarget[]>(defaults.targets)
  const [weekdays, setWeekdays] = useState<number[]>(defaults.weekdays)

  const has = (t: PromotionTarget) =>
    targets.some((x) => x.targetType === t.targetType && x.targetId === t.targetId)
  const toggle = (t: PromotionTarget) =>
    setTargets((list) =>
      has(t)
        ? list.filter((x) => !(x.targetType === t.targetType && x.targetId === t.targetId))
        : [...list, t],
    )

  const checklist = (items: Option[], targetType: PromotionTarget['targetType']) => (
    <ul className="grid gap-2">
      {items.map((item) => {
        const target = { targetType, targetId: item.id }
        return (
          <li key={`${targetType}-${item.id}`}>
            <label className="border-line has-[:checked]:border-ink flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4">
              <input
                type="checkbox"
                checked={has(target)}
                onChange={() => toggle(target)}
                className="size-5 accent-[var(--accent)]"
              />
              {item.name}
            </label>
          </li>
        )
      })}
    </ul>
  )

  // Aperçu : quelques articles concernés, prix avant / après, calculés comme sur le site.
  const numericValue = Number(value.replace(/[\s  ]/g, '')) || 0
  const preview = {
    id: 'apercu',
    title: 'Aperçu',
    discountType: type,
    discountValue: type === 'display_only' ? 0 : numericValue,
    scope,
    targets,
    startsAt: null,
    endsAt: null,
    weekdays: null,
    isActive: true,
    priority: 0,
  }
  const sample: PricedItem[] = [
    ...services.map((s) => ({
      kind: 'service' as const,
      id: s.id,
      categoryId: s.categoryId,
      priceAmount: s.priceAmount,
      currency: 'CDF' as const,
    })),
    ...products.map((p) => ({
      kind: 'product' as const,
      id: p.id,
      categoryId: p.categoryId,
      priceAmount: p.priceAmount,
      currency: 'CDF' as const,
    })),
  ]
  const names = new Map([...services, ...products].map((i) => [i.id, i.name]))
  const affected = sample
    .map((item) => ({ item, price: getEffectivePrice(item, [preview], new Date()) }))
    .filter(({ price }) => price.amount < price.baseAmount)
    .slice(0, 4)

  return (
    <>
      <input type="hidden" name="discountType" value={type} />
      <input type="hidden" name="scope" value={scope} />
      <input type="hidden" name="targets" value={JSON.stringify(targets)} />
      <input type="hidden" name="weekdays" value={JSON.stringify(weekdays)} />

      <fieldset className="border-line grid gap-4 rounded-3xl border p-4 md:p-6">
        <legend className="font-display px-2 text-2xl font-semibold">1. Type de réduction</legend>
        <div className="grid gap-2">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-2 ${type === t.value ? 'border-ink bg-cream-deep' : 'border-line'}`}
            >
              <input
                type="radio"
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="size-5 accent-[var(--accent)]"
              />
              <span>
                <span className="block font-semibold">{t.label}</span>
                <span className="text-ink-soft block text-sm">{t.help}</span>
              </span>
            </label>
          ))}
        </div>
        {type !== 'display_only' && (
          <label className="grid gap-2 text-sm font-semibold">
            {type === 'percentage' ? 'Réduction (%)' : 'Réduction (FC)'}
            <input
              name="discountValue"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={fieldClass}
            />
            <Error name="discountValue" />
          </label>
        )}
      </fieldset>

      <fieldset className="border-line grid gap-4 rounded-3xl border p-4 md:p-6">
        <legend className="font-display px-2 text-2xl font-semibold">2. Ce qui est concerné</legend>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as PromotionScope)}
          className={fieldClass}
          aria-label="Portée"
        >
          {SCOPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {scope === 'service_category' && checklist(serviceCategories, 'service_category')}
        {scope === 'product_category' && checklist(productCategories, 'product_category')}
        {scope === 'items' && (
          <div className="grid gap-4">
            <p className="text-sm font-semibold">Prestations</p>
            {checklist(services, 'service')}
            <p className="text-sm font-semibold">Produits</p>
            {checklist(products, 'product')}
          </div>
        )}
        <Error name="targets" />
      </fieldset>

      <fieldset className="border-line grid gap-4 rounded-3xl border p-4 md:p-6">
        <legend className="font-display px-2 text-2xl font-semibold">3. Jours de la semaine</legend>
        <p className="text-ink-soft text-sm">
          Laissez tout décoché pour une promotion valable tous les jours. Cochez « Mardi » seul pour
          le Mardi Promo.
        </p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day, i) => {
            const iso = i + 1
            const on = weekdays.includes(iso)
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setWeekdays((list) =>
                    on ? list.filter((d) => d !== iso) : [...list, iso].sort(),
                  )
                }
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${on ? 'bg-accent text-accent-ink border-accent' : 'border-line'}`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="bg-cream-deep rounded-3xl p-4 md:p-6" aria-live="polite">
        <p className="font-semibold">Aperçu des prix</p>
        {type === 'display_only' ? (
          <p className="text-ink-soft mt-2 text-sm">
            Affichage seul : la promotion est annoncée sur le site, les prix ne changent pas.
          </p>
        ) : affected.length === 0 ? (
          <p className="text-ink-soft mt-2 text-sm">Aucun prix modifié avec ces réglages.</p>
        ) : (
          <ul className="mt-3 grid gap-2 text-sm">
            {affected.map(({ item, price }) => (
              <li key={`${item.kind}-${item.id}`} className="flex justify-between gap-4">
                <span>{names.get(item.id)}</span>
                <span className="whitespace-nowrap">
                  <s className="text-ink-soft">{formatAmount(price.baseAmount, 'CDF')}</s>{' '}
                  <strong className="text-accent">{formatAmount(price.amount, 'CDF')}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
