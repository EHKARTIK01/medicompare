import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'
import DataTable from '../../components/DataTable.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([])
  const [status, setStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  function load() {
    setLoading(true)
    axiosClient.get('/admin/appointments', { params: status !== 'ALL' ? { status } : {} })
      .then((res) => setAppointments(res.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status])

  async function handleConfirm(id) {
    await axiosClient.post(`/admin/appointments/${id}/confirm`)
    setMessage({ type: 'success', text: `Appointment #${id} confirmed.` })
    load()
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this appointment? This frees up the slot.')) return
    await axiosClient.post(`/admin/appointments/${id}/cancel`)
    setMessage({ type: 'success', text: `Appointment #${id} cancelled.` })
    load()
  }

  return (
    <AdminLayout title="Manage appointments">
      {message && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              status === s ? 'bg-primary-500 text-white border-primary-500' : 'border-primary-200 text-ink/60 hover:border-primary-400'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink/50">Loading appointments…</div>
      ) : (
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'hospitalName', label: 'Hospital' },
            { key: 'serviceName', label: 'Service' },
            { key: 'patientName', label: 'Patient' },
            { key: 'slotDate', label: 'Date' },
            { key: 'slotTime', label: 'Time', render: (r) => r.slotTime?.slice(0, 5) },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'paymentStatus', label: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} /> },
            { key: 'actions', label: '', render: (r) => (
              <div className="flex gap-3">
                {r.status === 'PENDING' && (
                  <button onClick={() => handleConfirm(r.id)} className="text-primary-500 font-semibold hover:underline whitespace-nowrap">Confirm</button>
                )}
                {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                  <button onClick={() => handleCancel(r.id)} className="text-red-500 font-semibold hover:underline whitespace-nowrap">Cancel</button>
                )}
              </div>
            )},
          ]}
          rows={appointments}
          emptyMessage="No appointments match this filter."
        />
      )}
    </AdminLayout>
  )
}
