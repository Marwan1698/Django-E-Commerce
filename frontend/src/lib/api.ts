// Thin fetch wrapper around the Django API.
//
// Auth model: the access token lives only in memory (this module). The
// refresh token is an httpOnly cookie the browser sends to /api/auth/*;
// on a 401 we refresh once and retry the original request.

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export type ApiErrorData = Record<string, unknown> | string | null

export class ApiError extends Error {
  status: number
  data: ApiErrorData

  constructor(status: number, data: ApiErrorData) {
    super(errorMessage(data) ?? `Request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

let accessToken: string | null = null
let refreshing: Promise<string | null> | null = null
let onSessionExpired: (() => void) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

/** Get a new access token from the refresh cookie. Concurrent callers share one request. */
export function refreshAccessToken(): Promise<string | null> {
  refreshing ??= fetch(`${API_URL}/api/auth/refresh/`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      // 200 → new token; 204 → no session (anonymous); 401 → session expired.
      const token = res.status === 200 ? ((await res.json()) as { access: string }).access : null
      setAccessToken(token)
      return token
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

// These handle credentials themselves; a 401 from them must not trigger a refresh.
const TOKEN_ENDPOINTS = new Set([
  '/api/auth/login/',
  '/api/auth/register/',
  '/api/auth/refresh/',
  '/api/auth/logout/',
])

type Body = FormData | object | undefined

interface RequestOptions {
  method?: string
  body?: Body
  /** Query-string params; empty values are skipped. */
  params?: Record<string, string | number | boolean | undefined | null>
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const url = new URL(`${API_URL}${path}`, window.location.origin)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function send(path: string, { method = 'GET', body, params }: RequestOptions) {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body // the browser sets the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  return fetch(buildUrl(path, params), { method, headers, body: payload, credentials: 'include' })
}

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options)

  if (res.status === 401 && !TOKEN_ENDPOINTS.has(path)) {
    const hadToken = accessToken !== null
    if (await refreshAccessToken()) {
      res = await send(path, options)
    } else if (hadToken) {
      onSessionExpired?.()
    }
  }

  if (res.status === 204) return undefined as T
  const contentType = res.headers.get('content-type') ?? ''
  const data = contentType.includes('json') ? await res.json() : await res.text()
  if (!res.ok) throw new ApiError(res.status, data || null)
  return data as T
}

/** Best human-readable message from a DRF error payload. */
export function errorMessage(data: unknown): string | undefined {
  if (!data) return undefined
  if (typeof data === 'string') return data.startsWith('<') ? undefined : data
  if (Array.isArray(data)) return errorMessage(data[0])
  if (typeof data === 'object') {
    const record = data as Record<string, unknown>
    for (const key of ['detail', 'non_field_errors', 'cart', 'status']) {
      if (record[key]) return errorMessage(record[key])
    }
    const first = Object.values(record)[0]
    return errorMessage(first)
  }
  return undefined
}

export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return 'Too many attempts. Please wait a minute and try again.'
    return error.message
  }
  return 'Something went wrong. Please check your connection and try again.'
}
