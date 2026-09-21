import React, { useEffect, useRef, useState } from 'react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

/**
 * Renders a real Google Map when VITE_GOOGLE_MAPS_API_KEY is configured.
 * Falls back to a clearly-labelled static/mock map when it isn't, so the
 * app keeps working end-to-end without requiring API credentials.
 */
export default function MapView({ latitude, longitude, label, markers = [] }) {
  const mapRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return

    if (window.google?.maps) {
      setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`
    script.async = true
    script.onload = () => setLoaded(true)
    script.onerror = () => setFailed(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google?.maps) return

    const center = { lat: latitude, lng: longitude }
    const map = new window.google.maps.Map(mapRef.current, {
      center, zoom: 13, disableDefaultUI: true, zoomControl: true,
    })

    const points = markers.length ? markers : [{ latitude, longitude, name: label }]
    points.forEach((m) => {
      new window.google.maps.Marker({
        position: { lat: m.latitude, lng: m.longitude },
        map,
        title: m.name,
      })
    })
  }, [loaded, latitude, longitude, markers, label])

  if (!GOOGLE_MAPS_API_KEY || failed) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-primary-100 bg-primary-50 h-64 flex flex-col items-center justify-center gap-2 text-center px-6">
        <svg className="w-10 h-10 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm font-semibold text-primary-600">Map preview unavailable</p>
        <p className="text-xs text-ink/50 max-w-xs">
          Google Maps isn't configured for this deployment (VITE_GOOGLE_MAPS_API_KEY is unset).
          Approximate coordinates: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}.
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank" rel="noreferrer"
          className="text-xs font-semibold text-primary-500 underline"
        >
          Open in Google Maps ↗
        </a>
      </div>
    )
  }

  return <div ref={mapRef} className="rounded-2xl overflow-hidden border border-primary-100 h-64 w-full" />
}
