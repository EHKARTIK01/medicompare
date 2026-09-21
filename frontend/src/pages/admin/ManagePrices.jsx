import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'
import DataTable from '../../components/DataTable.jsx'

export default function ManagePrices() {
  const [hospitals, setHospitals] = useState([])
  const [services, setServices] = useState([])
  const [hospitalId, setHospitalId] = useState('')
  const [prices, setPrices] = useState([])
  const [form, setForm] = useState({ medicalServiceId: '', price: '', available: true })

  useEffect(() => {
    axiosClient.get('/hospitals', { params: { size: 100 } }).then((res) => setHospitals(res.data.content ?? []))
    axiosClient.get('/admin/services').then((res) => setServices(res.data ?? []))
  }, [])

  function loadPrices(id) {
    if (!id) { setPrices([]); return }
    axiosClient.get(`/admin/services/prices/${id}`).then((res) => setPrices(res.data ?? []))
  }

  useEffect(() => { loadPrices(hospitalId) }, [hospitalId])

  async function handleSubmit(e) {
    e.preventDefault()
    await axiosClient.put(`/admin/services/${hospitalId}/price/${form.medicalServiceId}`, {
      price: Number(form.price), available: form.available,
    })
    setForm({ medicalServiceId: '', price: '', available: true })
    loadPrices(hospitalId)
  }

  return (
    <AdminLayout title="Manage prices">
      <div className="mb-6">
        <label className="text-xs text-ink/50 block mb-1">Hospital</label>
        <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} className="w-full sm:w-96 border border-primary-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Select a hospital…</option>
          {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name} — {h.city}</option>)}
        </select>
      </div>

      {hospitalId && (
        <>
          <form onSubmit={handleSubmit} className="bg-white border border-primary-100 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select required value={form.medicalServiceId} onChange={(e) => setForm({ ...form, medicalServiceId: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Select service…</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Available</label>
            <button type="submit" className="bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600">Set price</button>
          </form>

          <DataTable
            columns={[
              { key: 'medicalService', label: 'Service', render: (r) => r.medicalService?.name },
              { key: 'price', label: 'Price', render: (r) => `₹${Number(r.price).toLocaleString('en-IN')}` },
              { key: 'available', label: 'Available', render: (r) => r.available ? 'Yes' : 'No' },
            ]}
            rows={prices}
          />
        </>
      )}
    </AdminLayout>
  )
}
