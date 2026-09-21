import React, { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-ink mb-2">Contact us</h1>
      <p className="text-ink/60 mb-8">Questions, feedback, or partnership ideas — we'd like to hear them.</p>

      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="font-display font-semibold text-emerald-700 mb-1">Message sent</p>
          <p className="text-sm text-emerald-700/80">This is a demo form — no message was actually delivered.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-primary-100 rounded-2xl p-6">
          <div>
            <label className="text-xs text-ink/60 block mb-1">Name</label>
            <input required className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/60 block mb-1">Email</label>
            <input required type="email" className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/60 block mb-1">Message</label>
            <textarea required rows={4} className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="w-full bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600">
            Send message
          </button>
        </form>
      )}
    </div>
  )
}
