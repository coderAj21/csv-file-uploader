import React from 'react';

export default function TableBody({
  headers,
  visibleColumns,
  paginatedData,
  hasVisibleColumns,
}) {
  return (
    <tbody className="divide-y divide-slate-800/50 bg-slate-900/10">
      {!hasVisibleColumns ? (
        <tr>
          <td colSpan={headers.length} className="px-5 py-8 text-center text-xs text-slate-500">
            All columns hidden. Check some in the Columns list above.
          </td>
        </tr>
      ) : paginatedData.length === 0 ? (
        <tr>
          <td colSpan={headers.length} className="px-5 py-8 text-center text-xs text-slate-500">
            No matching records found. Try clearing active filters or search phrases.
          </td>
        </tr>
      ) : (
        paginatedData.map((row, rIndex) => (
          <tr key={rIndex} className="hover:bg-slate-900/40 transition-colors duration-100">
            {headers.map(
              (header) =>
                visibleColumns[header] && (
                  <td
                    key={header}
                    className="px-5 py-3 text-xs text-slate-300 border-b border-slate-800/20 max-w-[220px] truncate"
                  >
                    {row[header] === true || row[header] === 'true' ? (
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/15">
                        True
                      </span>
                    ) : row[header] === false || row[header] === 'false' ? (
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700/50">
                        False
                      </span>
                    ) : row[header] === null || row[header] === undefined || row[header] === '' ? (
                      <span className="text-slate-600 italic font-mono">-</span>
                    ) : (
                      String(row[header])
                    )}
                  </td>
                )
            )}
          </tr>
        ))
      )}
    </tbody>
  );
}
