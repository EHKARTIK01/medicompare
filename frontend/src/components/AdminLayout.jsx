import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/hospitals', label: 'Hospitals' },
  { to: '/admin/doctors', label: 'Doctors' },
  { to: '/admin/services', label: 'Medical Services' },
  { to: '/admin/prices', label: 'Prices' },
  { to: '/admin/appointments', label: 'Appointments' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/payments', label: 'Payments' },
]

export default function AdminLayout({ title, children }) {
  const { pathname } = useLocation()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
      <aside className="md:sticky md:top-20 h-fit">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-3 px-1">Admin panel</p>
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                pathname === item.to ? 'bg-primary-500 text-white' : 'text-ink/70 hover:bg-primary-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <h1 className="font-display text-2xl font-bold text-ink mb-6">{title}</h1>
        {children}
      </div>
    </div>
  )
}
