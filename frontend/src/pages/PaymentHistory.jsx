import React, { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function PaymentHistory() {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    axiosClient.get('/payments/me').then((res) => setPayments(res.data ?? []))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Payment history</h1>

      {payments.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-primary-200 rounded-2xl text-ink/50">
          No payments yet.
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="bg-white border border-primary-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm tabular">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                <p className="text-xs text-ink/50">{p.razorpayOrderId} {p.mock && '· mock payment'}</p>
                <p className="text-xs text-ink/40">{new Date(p.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
