import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-primary-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-display font-bold text-sm">M</span>
          <span className="font-display font-bold text-lg text-ink">MediCompare</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink/80">
          <Link to="/hospitals" className="hover:text-primary-500">Find Hospitals</Link>
          <Link to="/compare" className="hover:text-primary-500">Compare Prices</Link>
          <Link to="/about" className="hover:text-primary-500">About</Link>
          <Link to="/contact" className="hover:text-primary-500">Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!user && (
            <>
              <Link to="/login" className="text-sm font-medium text-ink/80 hover:text-primary-500">Log in</Link>
              <Link to="/register" className="text-sm font-semibold bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">Sign up</Link>
            </>
          )}
          {user && (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="text-sm font-medium text-ink/80 hover:text-primary-500">
                Hi, {user.fullName?.split(' ')[0]}
              </Link>
              {!isAdmin && (
                <Link to="/profile" className="text-sm font-medium text-ink/80 hover:text-primary-500">Profile</Link>
              )}
              <button
                onClick={() => { logout(); navigate('/') }}
                className="text-sm font-semibold border border-primary-500 text-primary-500 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Log out
              </button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <div className="w-6 h-0.5 bg-ink mb-1.5" />
          <div className="w-6 h-0.5 bg-ink mb-1.5" />
          <div className="w-6 h-0.5 bg-ink" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-primary-100 px-4 py-3 flex flex-col gap-3 bg-white">
          <Link to="/hospitals" onClick={() => setOpen(false)}>Find Hospitals</Link>
          <Link to="/compare" onClick={() => setOpen(false)}>Compare Prices</Link>
          <Link to="/about" onClick={() => setOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="font-semibold text-primary-500">Sign up</Link>
            </>
          ) : (
            <>
              <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setOpen(false)}>Dashboard</Link>
              {!isAdmin && <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>}
              <button onClick={() => { logout(); navigate('/'); setOpen(false) }} className="text-left text-primary-500 font-semibold">Log out</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
