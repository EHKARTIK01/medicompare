import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import MapView from '../components/MapView.jsx'
import BookingWidget from '../components/BookingWidget.jsx'

export default function HospitalDetails() {
  const { id } = useParams()
  const [hospital, setHospital] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [reviews, setReviews] = useState([])
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      axiosClient.get(`/hospitals/${id}`),
      axiosClient.get(`/hospitals/${id}/doctors`),
      axiosClient.get(`/reviews/hospital/${id}`),
    ]).then(([hRes, dRes, rRes]) => {
      setHospital(hRes.data)
      setDoctors(dRes.data ?? [])
      setReviews(rRes.data ?? [])
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-ink/50">Loading hospital details…</div>
  if (!hospital) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-ink/50">Hospital not found.</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="font-display text-3xl font-bold text-ink">{hospital.name}</h1>
          <div className="shrink-0 flex items-center gap-1 bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg font-semibold">
            ★ {hospital.rating?.toFixed(1)} <span className="text-primary-400 font-normal text-sm">({hospital.reviewCount})</span>
          </div>
        </div>
        <p className="text-ink/60 mb-6">{hospital.address}</p>

        {!hospital.verified && (
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 inline-block px-3 py-1.5 rounded-full mb-6">
            Demo data — illustrative only
          </div>
        )}

        <p className="text-ink/70 mb-8 leading-relaxed">{hospital.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div>
            <p className="text-xs text-ink/40 mb-1">Opening hours</p>
            <p className="font-semibold text-sm">{hospital.openingHours}</p>
          </div>
          <div>
            <p className="text-xs text-ink/40 mb-1">Phone</p>
            <p className="font-semibold text-sm">{hospital.phone}</p>
          </div>
          <div>
            <p className="text-xs text-ink/40 mb-1">Email</p>
            <p className="font-semibold text-sm truncate">{hospital.email}</p>
          </div>
        </div>

        {hospital.facilities?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-3">Facilities</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.facilities.map((f) => (
                <span key={f} className="text-xs bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full font-medium">{f}</span>
              ))}
            </div>
          </div>
        )}

        {hospital.specialties?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((s) => (
                <span key={s} className="text-xs bg-teal-400/10 text-teal-500 px-3 py-1.5 rounded-full font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {doctors.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-3">Doctors</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {doctors.map((d) => (
                <div key={d.id} className="border border-primary-100 rounded-xl p-4">
                  <p className="font-semibold text-sm">{d.name}</p>
                  <p className="text-xs text-ink/50">{d.specialization} · {d.qualification}</p>
                  <p className="text-xs text-ink/50 mt-1">{d.experienceYears} yrs experience · ★ {d.rating?.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="font-display font-semibold mb-3">Location</h3>
          <MapView latitude={hospital.latitude} longitude={hospital.longitude} label={hospital.name} />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Patient reviews</h3>
            <Link to={`/compare?city=${hospital.city}`} className="text-sm font-semibold text-primary-500 hover:underline">Compare prices →</Link>
          </div>
          {reviews.length === 0 && <p className="text-sm text-ink/50">No reviews yet.</p>}
          <div className="space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="border border-primary-100 rounded-xl p-4">
                <p className="text-sm font-semibold mb-1">★ {r.rating} / 5</p>
                <p className="text-sm text-ink/60">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="book" className="lg:sticky lg:top-20 h-fit">
        <BookingWidget hospital={hospital} doctors={doctors} />
      </div>
    </div>
  )
}
