import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'

export default function Invoice() {
  const { appointmentId } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axiosClient.get(`/invoices/appointment/${appointmentId}`)
      .then((res) => setInvoice(res.data))
      .catch(() => setError('Invoice not available yet for this appointment.'))
  }, [appointmentId])

  if (error) return <div className="max-w-xl mx-auto px-4 py-16 text-center text-ink/50">{error}</div>
  if (!invoice) return <div className="max-w-xl mx-auto px-4 py-16 text-center text-ink/50">Loading invoice…</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-10 print:py-0">
      <div className="bg-white border border-primary-100 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-display font-bold text-lg text-ink">MediCompare</p>
            <p className="text-xs text-ink/50">Healthcare Price Transparency Platform</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink/50">Invoice</p>
            <p className="font-semibold text-sm">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="border-t border-b border-primary-100 py-4 mb-4 flex justify-between text-sm">
          <span className="text-ink/50">Issued</span>
          <span>{new Date(invoice.issuedAt).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between items-baseline mb-8">
          <span className="text-ink/60">Total amount paid</span>
          <span className="font-display text-3xl font-bold tabular">₹{Number(invoice.totalAmount).toLocaleString('en-IN')}</span>
        </div>

        <button onClick={() => window.print()} className="w-full border border-primary-500 text-primary-500 font-semibold py-2.5 rounded-lg hover:bg-primary-50 print:hidden">
          Download / Print invoice
        </button>
      </div>
    </div>
  )
}
