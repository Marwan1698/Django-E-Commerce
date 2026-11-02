import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'

import { CartNavLink } from '@/models/cart/components/CartNavLink'
import { useAuth } from '@/models/user/authContext'
import { Logo } from '@/shared/components/Logo'

const navLink = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-white/15 text-white' : 'text-navy-200 hover:bg-white/10 hover:text-white'
  }`

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const links = user ? (
    <>
      <NavLink to="/" end className={navLink} onClick={close}>Shop</NavLink>
      <NavLink to="/selling" className={navLink} onClick={close}>Sell</NavLink>
      <NavLink to="/orders" className={navLink} onClick={close}>Orders</NavLink>
      <CartNavLink className={navLink} onClick={close} />
      <NavLink to="/account" className={navLink} onClick={close}>{user.username}</NavLink>
      <button
        type="button"
        className="rounded-full px-4 py-2 text-left text-sm font-semibold text-navy-200 hover:bg-white/10 hover:text-white"
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
        className="rounded-full bg-white px-4 py-2 text-center text-sm font-bold text-navy-900 hover:bg-navy-50"
      >
        Sign up
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-20 px-4 pt-4">
      <div className="mx-auto max-w-6xl rounded-[1.75rem] bg-navy-900/95 shadow-lg shadow-navy-900/15 backdrop-blur">
        <div className="flex h-16 items-center justify-between pr-3 pl-4">
          <Link to="/" className="flex items-center gap-2.5 rounded-full text-xl font-extrabold tracking-tight text-white" onClick={close}>
            <Logo className="size-9" />
            eStore
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">{links}</nav>
          <button
            type="button"
            className="rounded-full p-2.5 text-white hover:bg-white/10 md:hidden"
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
          <nav id="mobile-nav" className="flex flex-col gap-1 border-t border-white/10 p-3 md:hidden" aria-label="Main">
            {links}
          </nav>
        )}
      </div>
    </header>
  )
}
