import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar.jsx'
import HospitalCard from '../components/HospitalCard.jsx'
import axiosClient from '../api/axiosClient.js'

const POPULAR_SERVICES = [
  'MRI Scan', 'CT Scan', 'Blood Test', 'X-Ray', 'Health Checkup',
  'Cardiology Consultation', 'Dental Consultation', 'Ultrasound',
]

const STEPS = [
  { title: 'Search', desc: 'Tell us your city and the test or consultation you need.' },
  { title: 'Compare', desc: 'See prices, ratings and distance side by side across hospitals.' },
  { title: 'Book', desc: 'Pick a slot, confirm your details, and pay securely online.' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [sample, setSample] = useState(null)

  useEffect(() => {
    axiosClient.get('/hospitals', { params: { size: 6 } })
      .then((res) => setFeatured(res.data.content ?? []))
      .catch(() => setFeatured([]))

    axiosClient.get('/compare', { params: { service: 'MRI Scan' } })
      .then((res) => setSample(res.data))
      .catch(() => setSample(null))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 to-transparent">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-600 bg-primary-100 px-3 py-1 rounded-full mb-5">
              Healthcare price transparency
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink leading-[1.1] mb-5">
              Know the price before you choose care.
            </h1>
            <p className="text-lg text-ink/60 mb-8 max-w-xl">
              MediCompare helps you compare healthcare prices, hospitals, ratings and
              appointment availability in one place — so you can decide with confidence.
            </p>
          </div>

          <SearchBar />

          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-ink/50">
            <span>Popular:</span>
            {POPULAR_SERVICES.slice(0, 4).map((s) => (
              <Link key={s} to={`/compare?service=${encodeURIComponent(s)}`} className="hover:text-primary-500 underline decoration-primary-200">
                {s}
              </Link>
            ))}
          </div>

          {/* Signature element: a live-looking price comparison strip for one sample service */}
          {sample && sample.results?.length > 0 && (
            <div className="mt-14 bg-white rounded-2xl border border-primary-100 shadow-xl shadow-primary-900/5 p-5 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-semibold text-ink">MRI Scan — price snapshot</p>
                <Link to="/compare?service=MRI%20Scan" className="text-sm font-semibold text-primary-500 hover:underline">Compare all →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sample.results.slice(0, 3).map((item) => {
                  const isLowest = Number(item.price) === Number(sample.lowestPrice)
                  return (
                    <div key={item.hospitalId} className={`rounded-xl p-4 border ${isLowest ? 'border-emerald-300 bg-emerald-50/60' : 'border-primary-100'}`}>
                      <p className="text-xs text-ink/50 truncate mb-1">{item.hospitalName}</p>
                      <p className="font-display text-2xl font-bold tabular text-ink">₹{Number(item.price).toLocaleString('en-IN')}</p>
                      {isLowest && <p className="text-[11px] font-semibold text-emerald-600 mt-1">Lowest price found</p>}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-ink/40 mt-4">Demo data — illustrative only, not verified provider pricing.</p>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-ink mb-8">How MediCompare works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="bg-white border border-primary-100 rounded-2xl p-6">
              <div className="h-10 w-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-display font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-ink/60 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured hospitals */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-ink">Featured hospitals</h2>
          <Link to="/hospitals" className="text-sm font-semibold text-primary-500 hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((h) => <HospitalCard key={h.id} hospital={h} />)}
        </div>
      </section>

      {/* Benefits + trust notice */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink mb-4">Why patients use MediCompare</h2>
          <ul className="space-y-3 text-ink/70 text-sm">
            <li className="flex gap-3"><span className="text-primary-500 font-bold">✓</span> Compare the same test across multiple hospitals in seconds</li>
            <li className="flex gap-3"><span className="text-primary-500 font-bold">✓</span> See ratings, distance and availability together</li>
            <li className="flex gap-3"><span className="text-primary-500 font-bold">✓</span> Book a slot and pay online without visiting in person first</li>
            <li className="flex gap-3"><span className="text-primary-500 font-bold">✓</span> Keep a record of every booking, payment and invoice</li>
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-display font-semibold text-amber-800 mb-2">A note on our data</h3>
          <p className="text-sm text-amber-800/80">
            This platform currently runs on illustrative demo data for hospitals, prices and
            reviews. It is not connected to verified real-world provider pricing. Hospitals
            marked "verified" in a future version would reflect data confirmed directly with providers.
          </p>
        </div>
      </section>
    </div>
  )
}
