import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

const buttons = {
  // Toolbar style: white pill, matches the search box.
  pill: 'rounded-full bg-white px-4 py-2.5 font-medium',
  // Form style: matches TextField.
  field: 'w-full rounded-2xl bg-slate-50 px-4 py-2.5 data-open:bg-white',
}

/**
 * A styled dropdown (the native <select> popup can't be styled). Keyboard and
 * screen-reader behaviour come from Headless UI's Listbox.
 *
 * @param {{ value: string, onChange: (value: string) => void,
 *   options: { value: string, label: string }[], placeholder?: string,
 *   prefix?: string, variant?: 'pill' | 'field', className?: string }} props
 *   Remaining props (id, aria-*, onBlur, disabled…) go to the button.
 */
export function Select({ value, onChange, options, placeholder = 'Choose…', prefix, variant = 'pill', className = '', disabled, ...buttonProps }) {
  const selected = options.find((o) => o.value === value)
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <ListboxButton
        {...buttonProps}
        className={`flex items-center justify-between gap-3 text-left text-sm text-navy-900 ring-1 ring-slate-200 transition ring-inset hover:ring-slate-300 focus:outline-none data-disabled:opacity-50 data-focus:ring-2 data-focus:ring-navy-600 data-open:ring-2 data-open:ring-navy-600 aria-invalid:ring-red-300 ${buttons[variant]} ${className}`}
      >
        <span className="truncate">
          {prefix && (
            <>
              <span className="text-slate-500">{prefix}</span>{' '}
            </>
          )}
          {selected ? selected.label : <span className="text-slate-400">{placeholder}</span>}
        </span>
        <svg className="size-4 shrink-0 text-slate-400 transition in-data-open:rotate-180" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 7.5 5 5 5-5" />
        </svg>
      </ListboxButton>
      <ListboxOptions
        anchor="bottom start"
        modal={false /* no scroll lock: the page must not shift when it opens */}
        transition
        className="z-30 max-h-72 min-w-(--button-width) overflow-y-auto rounded-2xl bg-white p-1.5 shadow-xl shadow-navy-900/10 ring-1 ring-slate-200 transition duration-100 ease-out [--anchor-gap:0.5rem] focus:outline-none data-closed:-translate-y-1 data-closed:opacity-0"
      >
        {options.map((o) => (
          <ListboxOption
            key={o.value}
            value={o.value}
            className="group flex cursor-pointer items-center gap-2 rounded-xl py-2 pr-4 pl-2.5 text-sm text-navy-800 select-none data-focus:bg-navy-50 data-selected:font-semibold data-selected:text-navy-900"
          >
            <svg className="invisible size-4 shrink-0 text-navy-700 group-data-selected:visible" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 10.5 3.5 3.5 7.5-8" />
            </svg>
            {o.label}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  )
}
