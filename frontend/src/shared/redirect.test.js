import { expect, it } from 'vitest'

import { safeRedirect } from './redirect'

it.each([
  ['/cart', '/cart'],
  ['/products/1?x=1', '/products/1?x=1'],
  ['//evil.com', '/'],
  ['/\\evil.com', '/'],
  ['https://evil.com', '/'],
  [undefined, '/'],
])('safeRedirect(%j) → %s', (input, expected) => {
  expect(safeRedirect(input)).toBe(expected)
})
