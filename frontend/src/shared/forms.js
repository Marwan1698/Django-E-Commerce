import { ApiError, describeError } from './api'

/**
 * Copy DRF field errors ({"email": ["..."]}) onto react-hook-form fields.
 * Returns a message for anything that isn't tied to one of `fields`.
 */
export function applyServerErrors(error, setError, fields) {
  if (!(error instanceof ApiError) || typeof error.data !== 'object' || error.data === null) {
    return describeError(error)
  }
  let unmatched = false
  for (const [key, value] of Object.entries(error.data)) {
    const message = Array.isArray(value) ? String(value[0]) : String(value)
    if (fields.includes(key)) {
      setError(key, { type: 'server', message })
    } else {
      unmatched = true
    }
  }
  return unmatched ? describeError(error) : null
}
