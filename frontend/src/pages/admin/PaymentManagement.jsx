import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient.js'
import AdminLayout from '../../components/AdminLayout.jsx'
import DataTable from '../../components/DataTable.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function PaymentManagement() {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    axiosClient.get('/admin/payments').then((res) => setPayments(res.data ?? []))
  }, [])

  return (
    <AdminLayout title="Payment management">
      <DataTable
        columns={[
          { key: 'razorpayOrderId', label: 'Order ID' },
          { key: 'amount', label: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString('en-IN')}` },
          { key: 'mock', label: 'Mode', render: (r) => r.mock ? 'Mock' : 'Live' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
        ]}
        rows={payments}
      />
    </AdminLayout>
  )
}
