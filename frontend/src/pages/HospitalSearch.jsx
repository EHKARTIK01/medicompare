import React from 'react'
import { Navigate } from 'react-router-dom'

// The dedicated search page simply lands the user on the listing page with
// query params — HospitalListing owns the search form + results together.
export default function HospitalSearch() {
  return <Navigate to="/hospitals" replace />
}
