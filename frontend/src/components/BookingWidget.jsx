import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import { useAuth } from '../context/AuthContext.jsx'

const STEP = { SERVICE: 0, DOCTOR: 1, SLOT: 2, DETAILS: 3, DONE: 4 }

export default function BookingWidget({ hospital, doctors }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(STEP.SERVICE)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [form, setForm] = useState({ patientName: '', patientPhone: '', patientAge: '', notes: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [bookedAppointment, setBookedAppointment] = useState(null)

  useEffect(() => {
    axiosClient.get(`/hospitals/${hospital.id}/services`).then((res) => setServices(res.data ?? []))
  }, [hospital.id])

  useEffect(() => {
    if (step === STEP.SLOT && selectedDoctor && date) {
      axiosClient.get('/slots', { params: { doctorId: selectedDoctor.id, date } })
        .then((res) => setSlots(res.data ?? []))
        .catch(() => setSlots([]))
    }
  }, [step, selectedDoctor, date])

  function relevantDoctors() {
    if (!selectedService) return doctors
    const match = doctors.filter((d) => d.specialization?.toLowerCase().includes(selectedService.category?.toLowerCase()))
    return match.length ? match : doctors
  }

  async function handleBook(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await axiosClient.post('/appointments', {
        hospitalId: hospital.id,
        medicalServiceId: selectedService.medicalServiceId,
        doctorId: selectedDoctor?.id,
        slotId: selectedSlot.id,
        ...form,
      })
      setBookedAppointment(data)
      setStep(STEP.DONE)
    } catch (err) {
      setError(err?.response?.data?.message || 'This slot may have just been booked. Please choose another.')
      setStep(STEP.SLOT)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-white border border-primary-100 rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-2">Book an appointment</h3>
        <p className="text-sm text-ink/60 mb-4">Log in to book an appointment at {hospital.name}.</p>
        <button onClick={() => navigate('/login')} className="w-full bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600">
          Log in to book
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-primary-100 rounded-2xl p-6">
      <h3 className="font-display font-semibold text-lg mb-4">Book an appointment</h3>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</div>}

      {step === STEP.SERVICE && (
        <div className="space-y-2">
          <p className="text-sm text-ink/60 mb-3">Select a service</p>
          {services.map((s) => (
            <button
              key={s.hospitalServiceId}
              disabled={!s.available}
              onClick={() => { setSelectedService(s); setStep(STEP.DOCTOR) }}
              className="w-full flex items-center justify-between px-4 py-3 border border-primary-100 rounded-lg text-left hover:border-primary-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium">{s.serviceName}</span>
              <span className="text-sm font-display font-bold">₹{Number(s.price).toLocaleString('en-IN')}</span>
            </button>
          ))}
        </div>
      )}

      {step === STEP.DOCTOR && (
        <div className="space-y-2">
          <p className="text-sm text-ink/60 mb-3">Select a doctor (optional)</p>
          <button onClick={() => { setSelectedDoctor(null); setStep(STEP.SLOT) }} className="w-full px-4 py-3 border border-dashed border-primary-200 rounded-lg text-sm text-ink/60 hover:border-primary-400">
            No preference — any available doctor
          </button>
          {relevantDoctors().map((d) => (
            <button key={d.id} onClick={() => { setSelectedDoctor(d); setStep(STEP.SLOT) }} className="w-full flex items-center justify-between px-4 py-3 border border-primary-100 rounded-lg text-left hover:border-primary-400">
              <span>
                <span className="text-sm font-medium block">{d.name}</span>
                <span className="text-xs text-ink/50">{d.specialization}</span>
              </span>
              <span className="text-xs text-ink/50">★ {d.rating?.toFixed(1)}</span>
            </button>
          ))}
          <button onClick={() => setStep(STEP.SERVICE)} className="text-xs text-ink/40 mt-2">← Back</button>
        </div>
      )}

      {step === STEP.SLOT && (
        <div>
          <label className="text-sm text-ink/60 block mb-2">Date</label>
          <input type="date" value={date} min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm mb-4" />

          {!selectedDoctor && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              Select a doctor first to see their available slots.
            </p>
          )}

          {selectedDoctor && (
            <>
              <p className="text-sm text-ink/60 mb-2">Available time slots</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {slots.length === 0 && <p className="col-span-3 text-sm text-ink/40">No open slots on this date. Try another date.</p>}
                {slots.map((s) => (
                  <button key={s.id} onClick={() => setSelectedSlot(s)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold border ${selectedSlot?.id === s.id ? 'bg-primary-500 text-white border-primary-500' : 'border-primary-200 hover:border-primary-400'}`}>
                    {s.slotTime?.slice(0, 5)}
                  </button>
                ))}
              </div>
              <button disabled={!selectedSlot} onClick={() => setStep(STEP.DETAILS)}
                className="w-full bg-primary-500 text-white font-semibold py-2.5 rounded-lg disabled:opacity-40">
                Continue
              </button>
            </>
          )}
          <button onClick={() => setStep(STEP.DOCTOR)} className="text-xs text-ink/40 mt-3 block">← Back</button>
        </div>
      )}

      {step === STEP.DETAILS && (
        <form onSubmit={handleBook} className="space-y-3">
          <div>
            <label className="text-xs text-ink/60 block mb-1">Patient name</label>
            <input required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/60 block mb-1">Phone number</label>
            <input required value={form.patientPhone} onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
              className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/60 block mb-1">Age (optional)</label>
            <input value={form.patientAge} onChange={(e) => setForm({ ...form, patientAge: e.target.value })}
              className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/60 block mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-primary-500 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
            {submitting ? 'Booking…' : 'Confirm appointment'}
          </button>
          <button type="button" onClick={() => setStep(STEP.SLOT)} className="text-xs text-ink/40 block">← Back</button>
        </form>
      )}

      {step === STEP.DONE && bookedAppointment && (
        <div>
          <div className="text-center py-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl">✓</div>
            <p className="font-display font-semibold mb-1">Appointment created</p>
            <p className="text-sm text-ink/60 mb-4">Complete payment to confirm your slot.</p>
          </div>
          <button onClick={() => navigate(`/appointments/${bookedAppointment.id}`)} className="w-full bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600">
            Proceed to payment
          </button>
        </div>
      )}
    </div>
  )
}
