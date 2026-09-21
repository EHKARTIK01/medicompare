import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'
import DataTable from '../../components/DataTable.jsx'

const EMPTY_FORM = { hospitalId: '', name: '', specialization: '', qualification: '', experienceYears: '', rating: '' }

export default function ManageDoctors() {
  const [hospitals, setHospitals] = useState([])
  const [hospitalId, setHospitalId] = useState('')
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showSlotForm, setShowSlotForm] = useState(null)
  const [slotRange, setSlotRange] = useState({ startDate: '', endDate: '' })
  const [message, setMessage] = useState(null)

  useEffect(() => {
    axiosClient.get('/hospitals', { params: { size: 100 } }).then((res) => setHospitals(res.data.content ?? []))
  }, [])

  function loadDoctors(hId) {
    axiosClient.get('/admin/doctors', { params: hId ? { hospitalId: hId } : {} })
      .then((res) => setDoctors(res.data ?? []))
  }
  useEffect(() => { loadDoctors(hospitalId) }, [hospitalId])

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      experienceYears: Number(form.experienceYears) || 0,
      rating: form.rating ? Number(form.rating) : undefined,
    }
    if (editingId) {
      await axiosClient.put(`/admin/doctors/${editingId}`, payload)
    } else {
      await axiosClient.post('/admin/doctors', payload)
    }
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    loadDoctors(hospitalId)
  }

  function startEdit(d) {
    setForm({
      hospitalId: d.hospital?.id || hospitalId, name: d.name, specialization: d.specialization,
      qualification: d.qualification || '', experienceYears: d.experienceYears, rating: d.rating,
    })
    setEditingId(d.id)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this doctor? Any associated slots will also be removed.')) return
    await axiosClient.delete(`/admin/doctors/${id}`)
    loadDoctors(hospitalId)
  }

  async function handleGenerateSlots(doctorId) {
    if (!slotRange.startDate || !slotRange.endDate) return
    await axiosClient.post('/admin/slots/generate', { doctorId, startDate: slotRange.startDate, endDate: slotRange.endDate })
    setMessage({ type: 'success', text: `Slots generated for doctor #${doctorId}.` })
    setShowSlotForm(null)
  }

  return (
    <AdminLayout title="Manage doctors">
      {message && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">{message.text}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} className="border border-primary-200 rounded-lg px-3 py-2 text-sm w-72">
          <option value="">All hospitals</option>
          {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name} — {h.city}</option>)}
        </select>
        <button onClick={() => { setForm({ ...EMPTY_FORM, hospitalId }); setEditingId(null); setShowForm(!showForm) }}
          className="bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-600">
          {showForm ? 'Close form' : '+ Add doctor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-primary-100 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select required value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Select hospital…</option>
            {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name} — {h.city}</option>)}
          </select>
          <input required placeholder="Doctor name (e.g. Dr. Anil Sharma)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Experience (years)" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input type="number" step="0.1" placeholder="Rating (0-5)" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="sm:col-span-2 bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600">
            {editingId ? 'Save changes' : 'Add doctor'}
          </button>
        </form>
      )}

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'specialization', label: 'Specialization' },
          { key: 'experienceYears', label: 'Experience', render: (r) => `${r.experienceYears} yrs` },
          { key: 'rating', label: 'Rating', render: (r) => `★ ${r.rating?.toFixed(1)}` },
          { key: 'actions', label: '', render: (r) => (
            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <button onClick={() => startEdit(r)} className="text-primary-500 font-semibold hover:underline">Edit</button>
                <button onClick={() => handleDelete(r.id)} className="text-red-500 font-semibold hover:underline">Delete</button>
                <button onClick={() => setShowSlotForm(showSlotForm === r.id ? null : r.id)} className="text-teal-500 font-semibold hover:underline">
                  Generate slots
                </button>
              </div>
              {showSlotForm === r.id && (
                <div className="flex gap-2 items-center">
                  <input type="date" value={slotRange.startDate} onChange={(e) => setSlotRange({ ...slotRange, startDate: e.target.value })} className="border border-primary-200 rounded-lg px-2 py-1 text-xs" />
                  <input type="date" value={slotRange.endDate} onChange={(e) => setSlotRange({ ...slotRange, endDate: e.target.value })} className="border border-primary-200 rounded-lg px-2 py-1 text-xs" />
                  <button onClick={() => handleGenerateSlots(r.id)} className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-lg">Generate</button>
                </div>
              )}
            </div>
          )},
        ]}
        rows={doctors}
      />
    </AdminLayout>
  )
}
