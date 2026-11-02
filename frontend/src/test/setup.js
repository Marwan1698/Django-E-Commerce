import '@testing-library/jest-dom/vitest'

// jsdom has no ResizeObserver; Headless UI uses it to position dropdowns.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
