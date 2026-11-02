/** Smoothly scroll an element into view, honouring reduced-motion settings. */
export function scrollToElement(el) {
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
