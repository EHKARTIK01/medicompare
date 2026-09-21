import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'
import DataTable from '../../components/DataTable.jsx'

export default function ManageUsers() {
  const [users, setUsers] = useState([])

  function load() {
    axiosClient.get('/admin/users').then((res) => setUsers(res.data ?? []))
  }
  useEffect(() => { load() }, [])

  async function toggleStatus(id) {
    await axiosClient.put(`/admin/users/${id}/toggle-status`)
    load()
  }

  return (
    <AdminLayout title="Manage users">
      <DataTable
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (r) => r.role.replace('ROLE_', '') },
          { key: 'enabled', label: 'Status', render: (r) => r.enabled ? 'Active' : 'Disabled' },
          { key: 'actions', label: '', render: (r) => (
            <button onClick={() => toggleStatus(r.id)} className="text-primary-500 font-semibold hover:underline">
              {r.enabled ? 'Disable' : 'Enable'}
            </button>
          )},
        ]}
        rows={users}
      />
    </AdminLayout>
  )
}
