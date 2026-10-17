import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react'
import type { FieldError } from 'react-hook-form'

const control =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600 aria-invalid:ring-red-400'

interface FieldProps {
  label: string
  error?: FieldError
  hint?: ReactNode
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string; className: string }) => ReactNode
}

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy, className: control })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error.message}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

type Common = { label: string; error?: FieldError; hint?: ReactNode }

export function TextField({ label, error, hint, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(a11y) => <input {...a11y} {...props} />}
    </Field>
  )
}

export function TextAreaField({ label, error, hint, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(a11y) => <textarea rows={4} {...a11y} {...props} />}
    </Field>
  )
}

export function SelectField({ label, error, hint, children, ...props }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
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
