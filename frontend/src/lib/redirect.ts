/** Only follow same-site, path-only redirects (no open redirects). */
export function safeRedirect(from: unknown): string {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/\\')
    ? from
    : '/'
}
