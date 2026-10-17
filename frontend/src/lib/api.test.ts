import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api, ApiError, errorMessage, setAccessToken, setSessionExpiredHandler } from './api'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  setAccessToken(null)
  setSessionExpiredHandler(null)
})
afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

const headersOf = (init: RequestInit | undefined) => (init?.headers ?? {}) as Record<string, string>
const authHeader = (call: number) => headersOf(fetchMock.mock.calls[call][1]).Authorization

describe('api', () => {
  it('sends the access token and JSON body', async () => {
    setAccessToken('abc')
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }))
    await api('/api/cart/items/', { method: 'POST', body: { product_id: 1 } })
    const [, init] = fetchMock.mock.calls[0]
    expect(authHeader(0)).toBe('Bearer abc')
    expect(init?.body).toBe('{"product_id":1}')
  })

  it('refreshes once on 401 and retries the request with the new token', async () => {
    setAccessToken('expired')
    fetchMock
      .mockResolvedValueOnce(json(401, { detail: 'expired' }))
      .mockResolvedValueOnce(json(200, { access: 'fresh' }))
      .mockResolvedValueOnce(json(200, { id: 1 }))

    await expect(api('/api/cart/')).resolves.toEqual({ id: 1 })
    expect(String(fetchMock.mock.calls[1][0])).toContain('/api/auth/refresh/')
    expect(authHeader(2)).toBe('Bearer fresh')
  })

  it('shares one refresh between concurrent 401s', async () => {
    setAccessToken('expired')
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input)
      if (url.includes('/refresh/')) return json(200, { access: 'fresh' })
      const auth = headersOf(init).Authorization
      return auth === 'Bearer fresh' ? json(200, { url }) : json(401, {})
    })

    await Promise.all([api('/api/cart/'), api('/api/orders/'), api('/api/auth/me/')])
    const refreshes = fetchMock.mock.calls.filter(([u]) => String(u).includes('/refresh/'))
    expect(refreshes).toHaveLength(1)
  })

  it('signals session expiry when the refresh fails', async () => {
    const expired = vi.fn()
    setSessionExpiredHandler(expired)
    setAccessToken('expired')
    fetchMock.mockResolvedValueOnce(json(401, {})).mockResolvedValueOnce(json(401, {}))

    await expect(api('/api/cart/')).rejects.toMatchObject({ status: 401 })
    expect(expired).toHaveBeenCalledOnce()
  })

  it('treats a 204 from refresh as "no session" without signalling expiry', async () => {
    const expired = vi.fn()
    setSessionExpiredHandler(expired)
    fetchMock.mockResolvedValueOnce(json(401, {})).mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(api('/api/cart/')).rejects.toMatchObject({ status: 401 })
    expect(expired).not.toHaveBeenCalled()
  })

  it('does not try to refresh after a failed login', async () => {
    fetchMock.mockResolvedValueOnce(json(400, { non_field_errors: ['Invalid credentials.'] }))
    await expect(api('/api/auth/login/', { method: 'POST', body: {} })).rejects.toThrow('Invalid credentials.')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('returns undefined for 204 responses', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(api('/api/auth/logout/', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('skips empty query params', async () => {
    fetchMock.mockResolvedValueOnce(json(200, {}))
    await api('/api/products/', { params: { page: 2, search: '', category: undefined } })
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/api\/products\/\?page=2$/)
  })
})

describe('errorMessage', () => {
  it.each([
    [{ detail: 'Not found.' }, 'Not found.'],
    [{ non_field_errors: ['Bad.'] }, 'Bad.'],
    [{ cart: ['Only 1 of Laptop left in stock.'] }, 'Only 1 of Laptop left in stock.'],
    [{ email: ['Taken.'] }, 'Taken.'],
    ['<!doctype html>', undefined],
  ])('%j → %s', (data, expected) => {
    expect(errorMessage(data)).toBe(expected)
  })

  it('is used as the ApiError message', () => {
    expect(new ApiError(400, { detail: 'Nope' }).message).toBe('Nope')
  })
})
