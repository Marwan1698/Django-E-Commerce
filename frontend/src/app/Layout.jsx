import { Link, Outlet, ScrollRestoration } from 'react-router'

import { Logo } from '@/shared/components/Logo'

import { Navbar } from './Navbar'

const YEAR = new Date().getFullYear()

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollRestoration />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-12 rounded-t-[2.5rem] bg-navy-950 px-4 py-10 text-navy-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-white">
            <Logo className="size-8" />
            Bazario
          </Link>
          <p className="text-sm">Buy and sell, all in one place.</p>
          <p className="text-sm text-navy-300">© {YEAR} Bazario</p>
        </div>
      </footer>
    </div>
  )
}
