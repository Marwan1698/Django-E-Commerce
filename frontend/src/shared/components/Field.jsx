import { useId } from 'react'

const control =
  'block w-full rounded-2xl border-0 bg-slate-50 px-4 py-2.5 text-sm text-navy-900 ring-1 ring-slate-200 ring-inset transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-navy-600 aria-invalid:ring-red-300 file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-4 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-800'

/** Label + control + error/hint, wired up for screen readers. */
function Field({ label, error, hint, children }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-navy-900">
        {label}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, className: control })}
      {error ? (
        <p id={`${id}-error`} className="pl-1 text-sm text-red-700">
          {error.message}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="pl-1 text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function TextField({ label, error, hint, ...props }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(a11y) => <input {...a11y} {...props} />}
    </Field>
  )
}

export function TextAreaField({ label, error, hint, ...props }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(a11y) => <textarea rows={4} {...a11y} {...props} />}
    </Field>
  )
}

export function SelectField({ label, error, hint, children, ...props }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(a11y) => (
        <select {...a11y} {...props}>
          {children}
        </select>
      )}
    </Field>
  )
}
