import React from 'react'

/** Generic reusable admin table: columns = [{key, label, render?}], rows = array of objects. */
export default function DataTable({ columns, rows, emptyMessage = 'No records found.', pageSize = 10 }) {
  const [page, setPage] = React.useState(0)

  React.useEffect(() => { setPage(0) }, [rows])

  if (!rows?.length) {
    return <div className="text-center py-12 text-ink/50 border border-dashed border-primary-200 rounded-2xl">{emptyMessage}</div>
  }

  const totalPages = Math.ceil(rows.length / pageSize)
  const visibleRows = rows.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <div>
      <div className="overflow-x-auto border border-primary-100 rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-primary-100">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/40">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-ink/80 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-primary-200 disabled:opacity-40 text-xs font-medium">
            Previous
          </button>
          <span className="text-xs text-ink/50">Page {page + 1} of {totalPages} ({rows.length} total)</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-primary-200 disabled:opacity-40 text-xs font-medium">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
