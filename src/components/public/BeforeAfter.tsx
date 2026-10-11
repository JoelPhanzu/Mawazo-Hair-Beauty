'use client'

import Image from 'next/image'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import { useId, useState } from 'react'

interface BeforeAfterProps {
  beforeSrc: string
  afterSrc: string
  alt: string
  sizes?: string
  className?: string
}

/** Comparateur avant / après : un curseur révèle la photo « avant » par-dessus la photo « après ». */
export function BeforeAfter({ beforeSrc, afterSrc, alt, sizes, className = '' }: BeforeAfterProps) {
  const [position, setPosition] = useState(50)
  const id = useId()

  return (
    <div className={`relative overflow-hidden select-none ${className}`}>
      <Image src={afterSrc} alt={`${alt}, après`} fill sizes={sizes} className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={beforeSrc} alt={`${alt}, avant`} fill sizes={sizes} className="object-cover" />
      </div>

      <div
        className="bg-cream pointer-events-none absolute inset-y-0 w-0.5"
        style={{ left: `${position}%` }}
        aria-hidden
      >
        <span className="bg-cream text-ink absolute top-1/2 left-1/2 flex size-10 -translate-1/2 items-center justify-center rounded-full text-xs font-semibold shadow-[0_6px_20px_-6px_rgb(43_27_21/0.5)]">
          <ArrowsLeftRight size={18} aria-hidden />
        </span>
      </div>
      <span className="bg-ink/75 text-cream pointer-events-none absolute top-3 left-3 px-2 py-1 text-xs font-semibold">
        Avant
      </span>
      <span className="bg-ink/75 text-cream pointer-events-none absolute top-3 right-3 px-2 py-1 text-xs font-semibold">
        Après
      </span>

      <label htmlFor={id} className="sr-only">
        Comparer avant et après
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}
