import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function UserDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    axiosClient.get('/appointments/me').then((res) => setAppointments(res.data ?? []))
  }, [])

  const upcoming = appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED')

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
      <p className="text-ink/60 mb-8">Here's a quick look at your healthcare activity.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-primary-100 rounded-2xl p-5">
          <p className="text-xs text-ink/50 mb-1">Total appointments</p>
          <p className="font-display text-3xl font-bold text-ink">{appointments.length}</p>
        </div>
        <div className="bg-white border border-primary-100 rounded-2xl p-5">
          <p className="text-xs text-ink/50 mb-1">Upcoming</p>
          <p className="font-display text-3xl font-bold text-primary-500">{upcoming.length}</p>
        </div>
        <div className="bg-white border border-primary-100 rounded-2xl p-5">
          <p className="text-xs text-ink/50 mb-1">Completed</p>
          <p className="font-display text-3xl font-bold text-emerald-600">{appointments.filter((a) => a.status === 'COMPLETED').length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Recent appointments</h2>
        <Link to="/appointments" className="text-sm font-semibold text-primary-500 hover:underline">View all →</Link>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-primary-200 rounded-2xl">
          <p className="text-ink/50 mb-4">You haven't booked any appointments yet.</p>
          <Link to="/hospitals" className="text-primary-500 font-semibold hover:underline">Find a hospital →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.slice(0, 5).map((a) => (
            <Link key={a.id} to={`/appointments/${a.id}`} className="flex items-center justify-between bg-white border border-primary-100 rounded-xl p-4 hover:border-primary-300">
              <div>
                <p className="font-semibold text-sm">{a.serviceName} — {a.hospitalName}</p>
                <p className="text-xs text-ink/50">{a.slotDate} {a.slotTime?.slice(0, 5)}</p>
              </div>
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
