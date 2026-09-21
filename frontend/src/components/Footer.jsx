import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-7 w-7 rounded-lg bg-teal-400 flex items-center justify-center text-ink font-display font-bold text-xs">M</span>
            <span className="font-display font-bold text-white">MediCompare</span>
          </div>
          <p className="max-w-sm text-white/60">
            Helping patients see hospital prices, ratings and appointment availability
            side by side, before they choose care.
          </p>
          <p className="mt-4 text-xs uppercase tracking-wide text-amber-400/90 font-semibold">
            Demo data — illustrative only, not verified provider pricing
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link to="/hospitals" className="hover:text-white">Find hospitals</Link></li>
            <li><Link to="/compare" className="hover:text-white">Compare prices</Link></li>
            <li><Link to="/about" className="hover:text-white">About MediCompare</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-white/60">
            <li><Link to="/login" className="hover:text-white">Log in</Link></li>
            <li><Link to="/register" className="hover:text-white">Sign up</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} MediCompare. Built as an academic full-stack project.
      </div>
    </footer>
  )
}
