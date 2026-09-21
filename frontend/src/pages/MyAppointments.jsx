import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    axiosClient.get('/appointments/me').then((res) => setAppointments(res.data ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCancel(id) {
    if (!confirm('Cancel this appointment?')) return
    await axiosClient.post(`/appointments/${id}/cancel`)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">My appointments</h1>

      {loading && <div className="text-center py-16 text-ink/50">Loading…</div>}

      {!loading && appointments.length === 0 && (
        <div className="text-center py-16 border border-dashed border-primary-200 rounded-2xl">
          <p className="text-ink/50 mb-4">No appointments yet.</p>
          <Link to="/hospitals" className="text-primary-500 font-semibold hover:underline">Find a hospital →</Link>
        </div>
      )}

      <div className="space-y-3">
        {appointments.map((a) => (
          <div key={a.id} className="bg-white border border-primary-100 rounded-xl p-4 flex items-center justify-between gap-4">
            <Link to={`/appointments/${a.id}`} className="flex-1">
              <p className="font-semibold text-sm">{a.serviceName} — {a.hospitalName}</p>
              <p className="text-xs text-ink/50">{a.doctorName ? `${a.doctorName} · ` : ''}{a.slotDate} {a.slotTime?.slice(0, 5)}</p>
            </Link>
            <StatusBadge status={a.status} />
            {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
              <button onClick={() => handleCancel(a.id)} className="text-xs font-semibold text-red-500 hover:underline whitespace-nowrap">
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
