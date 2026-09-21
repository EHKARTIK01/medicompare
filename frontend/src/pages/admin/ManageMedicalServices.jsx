import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'
import DataTable from '../../components/DataTable.jsx'

export default function ManageMedicalServices() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', category: '', description: '' })

  function load() {
    axiosClient.get('/admin/services').then((res) => setServices(res.data ?? []))
  }
  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    await axiosClient.post('/admin/services', form)
    setForm({ name: '', category: '', description: '' })
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this service? Any prices attached to it will also be removed.')) return
    await axiosClient.delete(`/admin/services/${id}`)
    load()
  }

  return (
    <AdminLayout title="Manage medical services">
      <form onSubmit={handleSubmit} className="bg-white border border-primary-100 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input required placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm sm:col-span-1" />
        <input required placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm sm:col-span-1" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-primary-200 rounded-lg px-3 py-2 text-sm sm:col-span-1" />
        <button type="submit" className="bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600 sm:col-span-1">Add service</button>
      </form>

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'description', label: 'Description' },
          { key: 'actions', label: '', render: (r) => (
            <button onClick={() => handleDelete(r.id)} className="text-red-500 font-semibold hover:underline">Delete</button>
          )},
        ]}
        rows={services}
      />
    </AdminLayout>
  )
}
