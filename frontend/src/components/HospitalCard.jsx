import React from 'react'
import { Link } from 'react-router-dom'

export default function HospitalCard({ hospital }) {
  const specialties = Array.isArray(hospital.specialties)
    ? hospital.specialties
    : typeof hospital.specialties === 'string'
      ? hospital.specialties.split(',').map((specialty) => specialty.trim()).filter(Boolean)
      : []

  return (
    <div className="bg-white rounded-2xl border border-primary-100 p-5 flex flex-col gap-3 hover:shadow-lg hover:shadow-primary-900/5 transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-lg text-ink leading-snug">{hospital.name}</h3>
          <p className="text-sm text-ink/60">{hospital.locality ? `${hospital.locality}, ` : ''}{hospital.city}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1 bg-primary-50 text-primary-600 px-2 py-1 rounded-lg text-sm font-semibold">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.285-3.958z"/></svg>
          {hospital.rating?.toFixed(1) ?? '—'}
          <span className="text-primary-400 font-normal">({hospital.reviewCount ?? 0})</span>
        </div>
      </div>

      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specialties.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-teal-400/10 text-teal-500 px-2 py-1 rounded-md font-medium">{s}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-ink/60 pt-1">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {hospital.openingHours || 'Hours not listed'}
        </span>
        {hospital.distanceKm != null && <span>{hospital.distanceKm} km away</span>}
      </div>

      <div className="flex gap-2 pt-2">
        <Link to={`/hospitals/${hospital.id}`} className="flex-1 text-center text-sm font-semibold border border-primary-500 text-primary-500 py-2 rounded-lg hover:bg-primary-50 transition-colors">
          View details
        </Link>
        <Link to={`/hospitals/${hospital.id}#book`} className="flex-1 text-center text-sm font-semibold bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors">
          Book appointment
        </Link>
      </div>
    </div>
  )
}
