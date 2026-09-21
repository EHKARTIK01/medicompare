import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import PriceTable from '../components/PriceTable.jsx'

const SERVICES = [
  'MRI Scan', 'CT Scan', 'X-Ray', 'Blood Test', 'Ultrasound', 'ECG', 'Health Checkup',
  'Dental Consultation', 'General Consultation', 'Cardiology Consultation',
  'Dermatology Consultation', 'Orthopedic Consultation', 'ENT Consultation',
]

export default function ServiceComparison() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [service, setService] = useState(searchParams.get('service') || 'MRI Scan')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [sortBy, setSortBy] = useState('price_asc')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!service) return
    setLoading(true)
    setError(null)
    axiosClient.get('/compare', { params: { service, city: city || undefined, sortBy } })
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load price comparison for this service.'))
      .finally(() => setLoading(false))
  }, [service, city, sortBy])

  function handleServiceChange(value) {
    setService(value)
    setSearchParams({ service: value, ...(city ? { city } : {}) })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink mb-2">Compare prices</h1>
      <p className="text-ink/60 mb-6">See how the same test or consultation is priced across hospitals.</p>

      <div className="bg-white border border-primary-100 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-ink/50 block mb-1">Service</label>
          <select value={service} onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm">
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/50 block mb-1">City (optional)</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Kanpur"
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/50 block mb-1">Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm">
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Rating</option>
            <option value="distance">Distance</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-16 text-ink/50">Comparing prices…</div>}
      {error && <div className="text-center py-16 text-red-500">{error}</div>}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-semibold mb-1">Lowest</p>
              <p className="font-display text-xl font-bold text-emerald-700">₹{Number(data.lowestPrice).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-center">
              <p className="text-xs text-primary-600 font-semibold mb-1">Average</p>
              <p className="font-display text-xl font-bold text-primary-600">₹{Number(data.averagePrice).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-xs text-red-600 font-semibold mb-1">Highest</p>
              <p className="font-display text-xl font-bold text-red-600">₹{Number(data.highestPrice).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <PriceTable items={data.results} lowestPrice={data.lowestPrice} />
          <p className="text-xs text-ink/40 mt-4">Demo data — illustrative only, not verified provider pricing.</p>
        </>
      )}
    </div>
  )
}
