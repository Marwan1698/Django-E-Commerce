import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { ApiError, describeError } from './api'

/**
 * Copy DRF field errors ({"email": ["..."]}) onto react-hook-form fields.
 * Returns a message for anything that isn't tied to a known field.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  if (!(error instanceof ApiError) || typeof error.data !== 'object' || error.data === null) {
    return describeError(error)
  }
  let unmatched = false
  for (const [key, value] of Object.entries(error.data)) {
    const message = Array.isArray(value) ? String(value[0]) : String(value)
    if ((fields as readonly string[]).includes(key)) {
      setError(key as Path<T>, { type: 'server', message })
    } else {
      unmatched = true
    }
  }
  return unmatched ? describeError(error) : null
}
