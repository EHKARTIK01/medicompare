import React from 'react'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-ink mb-6">About MediCompare</h1>
      <p className="text-ink/70 leading-relaxed mb-4">
        In India, the price of the same medical test or consultation can vary significantly
        from one hospital to another, and patients rarely know what to expect before they
        arrive. MediCompare was built to close that gap by putting prices, ratings and
        appointment availability side by side, so patients can make informed decisions
        about where to seek care.
      </p>
      <p className="text-ink/70 leading-relaxed mb-4">
        This project is an academic final-year full-stack build. It currently runs on
        illustrative demo data across hospitals, prices and reviews — it is not connected
        to verified real-world provider pricing. The architecture (Spring Boot, React,
        MySQL, Redis, Razorpay, Google Maps) is designed so real provider data and payment
        credentials could be plugged in without changing the application's structure.
      </p>
      <h2 className="font-display text-xl font-bold text-ink mt-10 mb-4">What you can do here</h2>
      <ul className="list-disc pl-5 space-y-2 text-ink/70">
        <li>Search hospitals by city, locality, name or service</li>
        <li>Compare prices for the same test across multiple hospitals</li>
        <li>View hospital ratings, facilities, doctors and opening hours</li>
        <li>Book an appointment and pay online (mock payment mode by default)</li>
        <li>Track your appointment and payment history, and download invoices</li>
      </ul>
    </div>
  )
}
