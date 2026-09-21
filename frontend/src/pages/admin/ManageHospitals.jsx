import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'
import DataTable from '../../components/DataTable.jsx'

const EMPTY_FORM = {
  name: '', address: '', city: '', locality: '', latitude: '', longitude: '',
  phone: '', email: '', description: '', facilities: '', specialties: '', openingHours: '',
  available: true, verified: false,
}

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  function load() {
    axiosClient.get('/hospitals', { params: { size: 100 } }).then((res) => setHospitals(res.data.content ?? []))
  }
  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) }
    if (editingId) {
      await axiosClient.put(`/admin/hospitals/${editingId}`, payload)
    } else {
      await axiosClient.post('/admin/hospitals', payload)
    }
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    load()
  }

  function startEdit(h) {
    setForm({
      name: h.name, address: h.address, city: h.city, locality: h.locality || '',
      latitude: h.latitude, longitude: h.longitude, phone: h.phone || '', email: h.email || '',
      description: h.description || '', facilities: (h.facilities || []).join(','),
      specialties: (h.specialties || []).join(','), openingHours: h.openingHours || '',
      available: h.available, verified: h.verified,
    })
    setEditingId(h.id)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this hospital? This cannot be undone.')) return
    await axiosClient.delete(`/admin/hospitals/${id}`)
    load()
  }

  return (
    <AdminLayout title="Manage hospitals">
      <div className="flex justify-end mb-4">
        <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(!showForm) }}
          className="bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-600">
          {showForm ? 'Close form' : '+ Add hospital'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-primary-100 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Locality" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input required type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input required type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Opening hours" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Facilities (comma separated)" value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Specialties (comma separated)" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm sm:col-span-2" rows={2} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Available</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} /> Verified (real provider data)</label>
          <button type="submit" className="sm:col-span-2 bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600">
            {editingId ? 'Save changes' : 'Create hospital'}
          </button>
        </form>
      )}

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'city', label: 'City' },
          { key: 'rating', label: 'Rating', render: (r) => r.rating?.toFixed(1) },
          { key: 'verified', label: 'Verified', render: (r) => r.verified ? 'Yes' : 'Demo' },
          { key: 'actions', label: '', render: (r) => (
            <div className="flex gap-3">
              <button onClick={() => startEdit(r)} className="text-primary-500 font-semibold hover:underline">Edit</button>
              <button onClick={() => handleDelete(r.id)} className="text-red-500 font-semibold hover:underline">Delete</button>
            </div>
          )},
        ]}
        rows={hospitals}
      />
    </AdminLayout>
  )
}
