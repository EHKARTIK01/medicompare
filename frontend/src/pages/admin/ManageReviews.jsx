import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'
import DataTable from '../../components/DataTable.jsx'

export default function ManageReviews() {
  const [reviews, setReviews] = useState([])

  function load() {
    axiosClient.get('/admin/reviews').then((res) => setReviews(res.data ?? []))
  }
  useEffect(() => { load() }, [])

  async function setApproval(id, approved) {
    await axiosClient.put(`/admin/reviews/${id}/approval`, null, { params: { approved } })
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this review permanently?')) return
    await axiosClient.delete(`/admin/reviews/${id}`)
    load()
  }

  return (
    <AdminLayout title="Manage reviews">
      <DataTable
        columns={[
          { key: 'rating', label: 'Rating', render: (r) => `★ ${r.rating}` },
          { key: 'comment', label: 'Comment' },
          { key: 'approved', label: 'Status', render: (r) => r.approved ? 'Approved' : 'Hidden' },
          { key: 'actions', label: '', render: (r) => (
            <div className="flex gap-3">
              <button onClick={() => setApproval(r.id, !r.approved)} className="text-primary-500 font-semibold hover:underline">
                {r.approved ? 'Hide' : 'Approve'}
              </button>
              <button onClick={() => handleDelete(r.id)} className="text-red-500 font-semibold hover:underline">Delete</button>
            </div>
          )},
        ]}
        rows={reviews}
      />
    </AdminLayout>
  )
}
