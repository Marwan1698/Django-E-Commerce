/** Only follow same-site, path-only redirects (no open redirects). */
export function safeRedirect(from) {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/\\')
    ? from
    : '/'
}
