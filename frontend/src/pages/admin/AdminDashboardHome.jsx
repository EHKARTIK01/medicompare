import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    axiosClient.get('/admin/dashboard/stats').then((res) => setStats(res.data))
  }, [])

  const cards = stats ? [
    { label: 'Hospitals', value: stats.totalHospitals, color: 'text-primary-500' },
    { label: 'Users', value: stats.totalUsers, color: 'text-ink' },
    { label: 'Total appointments', value: stats.totalAppointments, color: 'text-ink' },
    { label: 'Pending', value: stats.pendingAppointments, color: 'text-amber-600' },
    { label: 'Confirmed', value: stats.confirmedAppointments, color: 'text-primary-500' },
    { label: 'Completed', value: stats.completedAppointments, color: 'text-emerald-600' },
    { label: 'Cancelled', value: stats.cancelledAppointments, color: 'text-red-500' },
    { label: 'Revenue (₹)', value: Number(stats.totalRevenue).toLocaleString('en-IN'), color: 'text-emerald-600' },
  ] : []

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-primary-100 rounded-2xl p-5">
            <p className="text-xs text-ink/50 mb-1">{c.label}</p>
            <p className={`font-display text-2xl font-bold ${c.color}`}>{c.value ?? '—'}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
