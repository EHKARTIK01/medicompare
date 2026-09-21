import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient.js'
import SearchBar from '../components/SearchBar.jsx'
import HospitalCard from '../components/HospitalCard.jsx'

export default function HospitalListing() {
  const [searchParams] = useSearchParams()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const city = searchParams.get('city') || ''
  const query = searchParams.get('query') || ''

  useEffect(() => {
    setLoading(true)
    setError(null)
    axiosClient.get('/hospitals', { params: { city: city || undefined, query: query || undefined, page, size: 9 } })
      .then((res) => {
        setHospitals(res.data.content ?? [])
        setTotalPages(res.data.totalPages ?? 0)
      })
      .catch(() => setError('Something went wrong while searching. Please try again.'))
      .finally(() => setLoading(false))
  }, [city, query, page])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink mb-2">Find hospitals</h1>
      <p className="text-ink/60 mb-6">
        {city || query
          ? <>Showing results for {city && <strong>{city}</strong>}{city && query && ' · '}{query && <strong>"{query}"</strong>}</>
          : 'Showing all demo hospitals. Search by city, locality, hospital name or service to narrow results.'}
      </p>

      <div className="mb-8"><SearchBar compact /></div>

      {loading && <div className="text-center py-16 text-ink/50">Searching hospitals…</div>}
      {error && <div className="text-center py-16 text-red-500">{error}</div>}

      {!loading && !error && hospitals.length === 0 && (
        <div className="text-center py-16 border border-dashed border-primary-200 rounded-2xl">
          <p className="font-display text-lg font-semibold text-ink mb-2">No hospitals found</p>
          <p className="text-ink/50 text-sm">
            We couldn't find any demo hospitals matching this search. Try a nearby city
            like Kanpur, Lucknow, Delhi, Noida or Mumbai.
          </p>
        </div>
      )}

      {!loading && !error && hospitals.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hospitals.map((h) => <HospitalCard key={h.id} hospital={h} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border border-primary-200 disabled:opacity-40 text-sm font-medium">
                Previous
              </button>
              <span className="text-sm text-ink/50">Page {page + 1} of {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-primary-200 disabled:opacity-40 text-sm font-medium">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
