import { Link, Outlet, ScrollRestoration, useMatches } from 'react-router'

import { Logo } from '@/shared/components/Logo'

import { Navbar } from './Navbar'

const YEAR = new Date().getFullYear()

export function Layout() {
  // Re-keying the page wrapper replays its entrance animation on navigation.
  // Routes that share a `handle.page` (the shop and its categories) count as
  // one page, so switching category doesn't replay it.
  const match = useMatches().at(-1)
  const pageKey = match?.handle?.page ?? match?.pathname

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollRestoration />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div key={pageKey} className="animate-page-in">
          <Outlet />
        </div>
      </main>
      <footer className="mt-12 rounded-t-[2.5rem] bg-navy-950 px-4 py-10 text-navy-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-white">
            <Logo className="size-8" />
            eStore
          </Link>
          <p className="text-sm">Buy and sell, all in one place.</p>
          <p className="text-sm text-navy-300">© {YEAR} eStore</p>
        </div>
      </footer>
    </div>
  )
}
