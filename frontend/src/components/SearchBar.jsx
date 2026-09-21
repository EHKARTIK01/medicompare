import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ compact = false }) {
  const [city, setCity] = useState('')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city.trim()) params.set('city', city.trim())
    if (query.trim()) params.set('query', query.trim())
    navigate(`/hospitals?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl shadow-lg shadow-primary-900/5 border border-primary-100 p-2 flex flex-col sm:flex-row gap-2 ${compact ? '' : 'md:p-3'}`}
    >
      <div className="flex-1 flex items-center gap-2 px-3 py-2">
        <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or locality — e.g. Kanpur, Gomti Nagar"
          className="w-full outline-none text-sm placeholder:text-ink/40"
        />
      </div>
      <div className="hidden sm:block w-px bg-primary-100" />
      <div className="flex-1 flex items-center gap-2 px-3 py-2">
        <svg className="w-5 h-5 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hospital name or medical service"
          className="w-full outline-none text-sm placeholder:text-ink/40"
        />
      </div>
      <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        Search
      </button>
    </form>
  )
}
