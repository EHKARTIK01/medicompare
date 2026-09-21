import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import StatusBadge from '../components/StatusBadge.jsx'

// Loads the Razorpay checkout script on demand (no-op if already loaded or in mock mode).
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function AppointmentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)

  function load() {
    axiosClient.get(`/appointments/${id}`).then((res) => setAppointment(res.data))
  }

  useEffect(() => { load() }, [id])

  async function handlePay() {
    setPaying(true)
    setError(null)
    try {
      const { data: order } = await axiosClient.post('/payments/create-order', { appointmentId: Number(id) })

      if (order.mockMode) {
        // Simulated gateway: no real Razorpay checkout — verify immediately against the backend,
        // which performs its own server-side confirmation before marking anything as paid.
        await axiosClient.post('/payments/verify', {
          appointmentId: Number(id),
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: 'mock_pay_client_placeholder',
          razorpaySignature: 'mock_signature_placeholder',
        })
        load()
        return
      }

      const ok = await loadRazorpayScript()
      if (!ok) { setError('Could not load the payment gateway. Please try again.'); return }

      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: 'MediCompare',
        description: 'Appointment payment',
        handler: async (response) => {
          await axiosClient.post('/payments/verify', {
            appointmentId: Number(id),
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          load()
        },
      })
      rzp.open()
    } catch (err) {
      setError(err?.response?.data?.message || 'Payment could not be completed.')
    } finally {
      setPaying(false)
    }
  }

  if (!appointment) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-ink/50">Loading…</div>

  const needsPayment = appointment.paymentStatus === 'NOT_INITIATED' || appointment.paymentStatus === 'CREATED' || appointment.paymentStatus === 'FAILED'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="text-xs text-ink/40 mb-6">← Back</button>

      <div className="bg-white border border-primary-100 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">{appointment.serviceName}</h1>
            <p className="text-ink/60 text-sm">{appointment.hospitalName}</p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <dl className="grid grid-cols-2 gap-y-3 text-sm mb-6">
          <dt className="text-ink/50">Doctor</dt><dd>{appointment.doctorName || 'Not specified'}</dd>
          <dt className="text-ink/50">Date</dt><dd>{appointment.slotDate}</dd>
          <dt className="text-ink/50">Time</dt><dd>{appointment.slotTime?.slice(0, 5)}</dd>
          <dt className="text-ink/50">Patient</dt><dd>{appointment.patientName}</dd>
          <dt className="text-ink/50">Payment status</dt><dd><StatusBadge status={appointment.paymentStatus} /></dd>
        </dl>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</div>}

        {needsPayment && appointment.status !== 'CANCELLED' && (
          <button onClick={handlePay} disabled={paying} className="w-full bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600 disabled:opacity-60">
            {paying ? 'Processing…' : 'Pay now'}
          </button>
        )}

        {appointment.paymentStatus === 'PAID' && (
          <button onClick={() => navigate(`/invoice/${id}`)} className="w-full border border-primary-500 text-primary-500 font-semibold py-2.5 rounded-lg hover:bg-primary-50">
            View invoice
          </button>
        )}
      </div>
    </div>
  )
}
