import React from 'react'

const STYLES = {
  PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-primary-50 text-primary-600 border-primary-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
  PAID:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  CREATED:   'bg-amber-50 text-amber-700 border-amber-200',
  FAILED:    'bg-red-50 text-red-600 border-red-200',
  NOT_INITIATED: 'bg-ink/5 text-ink/60 border-ink/10',
}

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-ink/5 text-ink/60 border-ink/10'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status?.replaceAll('_', ' ')}
    </span>
  )
}
