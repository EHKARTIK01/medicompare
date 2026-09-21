import React from 'react'
import { Link } from 'react-router-dom'

export default function PriceTable({ items, lowestPrice }) {
  if (!items?.length) {
    return (
      <div className="text-center py-12 text-ink/50 border border-dashed border-primary-200 rounded-2xl">
        No prices found for this search. Try a different city or service.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-primary-100 rounded-2xl bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-primary-100">
            <th className="px-4 py-3 font-medium">Hospital</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Rating</th>
            <th className="px-4 py-3 font-medium">Distance</th>
            <th className="px-4 py-3 font-medium tabular">Price</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isLowest = lowestPrice != null && Number(item.price) === Number(lowestPrice)
            return (
              <tr key={item.hospitalId} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/40">
                <td className="px-4 py-3 font-semibold text-ink">{item.hospitalName}</td>
                <td className="px-4 py-3 text-ink/60">{item.locality ? `${item.locality}, ` : ''}{item.city}</td>
                <td className="px-4 py-3 text-ink/60">{item.rating?.toFixed(1) ?? '—'} ★ ({item.reviewCount ?? 0})</td>
                <td className="px-4 py-3 text-ink/60">{item.distanceKm != null ? `${item.distanceKm} km` : '—'}</td>
                <td className="px-4 py-3 font-display font-bold tabular">
                  <span className={isLowest ? 'text-emerald-600' : 'text-ink'}>₹{Number(item.price).toLocaleString('en-IN')}</span>
                  {isLowest && <span className="ml-2 text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md align-middle">LOWEST</span>}
                  {!item.available && <span className="ml-2 text-[10px] font-semibold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md align-middle">UNAVAILABLE</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/hospitals/${item.hospitalId}#book`} className="text-primary-500 font-semibold hover:underline whitespace-nowrap">
                    Book →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
