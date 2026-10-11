import { formatAmount } from '@/lib/format'
import type { EffectivePrice } from '@/lib/pricing/types'

interface PriceTagProps {
  price: EffectivePrice
  isFrom?: boolean
  className?: string
}

/** « À partir de 30 000 FC ~~50 000 FC~~ ». Le prix vient toujours de getEffectivePrice(). */
export function PriceTag({ price, isFrom, className = '' }: PriceTagProps) {
  const discounted = price.amount < price.baseAmount
  return (
    <p className={`text-sm ${className}`}>
      {isFrom && <span className="text-ink-soft">À partir de </span>}
      <span className={`font-semibold whitespace-nowrap ${discounted ? 'text-accent' : ''}`}>
        {formatAmount(price.amount, price.currency)}
      </span>
      {discounted && (
        <>
          {' '}
          <s className="text-ink-soft whitespace-nowrap">
            {formatAmount(price.baseAmount, price.currency)}
          </s>
        </>
      )}
    </p>
  )
}
