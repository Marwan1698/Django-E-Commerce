import { useState } from 'react'

const sizes = {
  md: { box: 'p-1', step: 'size-9 text-lg', input: 'w-10 text-sm' },
  sm: { box: 'p-0.5', step: 'size-7 text-base', input: 'w-7 text-sm' },
}

/**
 * − [n] + control. The buttons change the value at once; a typed number is
 * applied (clamped to min…max) on Enter or when the box loses focus.
 */
export function QuantityStepper({ value, onChange, min = 1, max, disabled = false, label = 'Quantity', size = 'md' }) {
  const s = sizes[size]
  const step = `flex items-center justify-center rounded-full font-bold text-navy-900 transition hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent ${s.step}`
  const [draft, setDraft] = useState(String(value))
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    setDraft(String(value))
  }

  const clamp = (n) => Math.min(max ?? Infinity, Math.max(min, n))
  const commit = () => {
    const n = clamp(Math.floor(Number(draft)) || min)
    setDraft(String(n))
    if (n !== value) onChange(n)
  }

  return (
    <div className={`inline-flex items-center rounded-full bg-slate-100 ${s.box}`} role="group" aria-label={label}>
      <button type="button" className={step} disabled={disabled || value <= min} onClick={() => onChange(clamp(value - 1))} aria-label="Decrease quantity">
        −
      </button>
      <input
        aria-label={label}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
        }}
        className={`${s.input} [appearance:textfield] border-0 bg-transparent p-0 text-center font-bold text-navy-900 focus:ring-0 disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />
      <button type="button" className={step} disabled={disabled || (max !== undefined && value >= max)} onClick={() => onChange(clamp(value + 1))} aria-label="Increase quantity">
        +
      </button>
    </div>
  )
}
