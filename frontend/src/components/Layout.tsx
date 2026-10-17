import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'

import { useAuth } from '@/auth/AuthContext'
import { useCart } from '@/features/cart/api'

const YEAR = new Date().getFullYear()

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`

function CartLink({ onClick }: { onClick?: () => void }) {
  const { data: cart } = useCart()
  const count = cart?.item_count ?? 0
  return (
    <NavLink to="/cart" className={navLink} onClick={onClick}>
      Cart
      {count > 0 && (
        <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
          {count}
          <span className="sr-only"> items</span>
        </span>
      )}
    </NavLink>
  )
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const links = user ? (
    <>
      <NavLink to="/" end className={navLink} onClick={close}>Shop</NavLink>
      <NavLink to="/selling" className={navLink} onClick={close}>Sell</NavLink>
      <NavLink to="/orders" className={navLink} onClick={close}>Orders</NavLink>
      <CartLink onClick={close} />
      <NavLink to="/account" className={navLink} onClick={close}>{user.username}</NavLink>
      <button
        type="button"
        className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:text-slate-900"
        onClick={async () => {
          close()
          await logout()
          navigate('/')
        }}
      >
        Log out
      </button>
    </>
  ) : (
    <>
      <NavLink to="/" end className={navLink} onClick={close}>Shop</NavLink>
      <NavLink to="/login" className={navLink} onClick={close}>Log in</NavLink>
      <Link
        to="/register"
        onClick={close}
        className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Sign up
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <img src="/favicon.svg" alt="" className="size-7" />
          eStore
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">{links}</nav>
        <button
          type="button"
          className="rounded-md p-2 text-slate-600 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Toggle menu</span>
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden" aria-label="Main">
          {links}
        </nav>
      )}
    </header>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © {YEAR} eStore
      </footer>
    </div>
  )
}
