import React from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown, X } from 'lucide-react';

export default function TableHeader({
  headers,
  visibleColumns,
  sortColumn,
  sortDirection,
  handleSort,
  showInlineFilters,
  inlineFilters,
  handleInlineFilterChange,
}) {
  return (
    <thead className="bg-slate-950/70">
      {/* Header Column Titles */}
      <tr>
        {headers.map(
          (header) =>
            visibleColumns[header] && (
              <th
                key={header}
                onClick={() => handleSort(header)}
                className="px-5 py-3.5 text-xs font-semibold text-slate-300 hover:text-slate-100 select-none cursor-pointer border-b border-slate-800/80 transition-colors"
              >
                <div className="flex items-center space-x-1.5 max-w-[200px]">
                  <span className="truncate">{header}</span>
                  {sortColumn === header ? (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-500 hover:text-slate-400 shrink-0" />
                  )}
                </div>
              </th>
            )
        )}
      </tr>

      {/* Header Column Filters Row (if toggled) */}
      {showInlineFilters && (
        <tr className="bg-slate-950/45 border-b border-slate-800/85">
          {headers.map(
            (header) =>
              visibleColumns[header] && (
                <td key={`filter-${header}`} className="px-4 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Filter ${header}...`}
                      value={inlineFilters[header] || ''}
                      onChange={(e) => handleInlineFilterChange(header, e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 focus:border-indigo-500/30 rounded-md text-[11px] text-slate-300 placeholder-slate-600 outline-none"
                    />
                    {(inlineFilters[header] || '') !== '' && (
                      <button
                        onClick={() => handleInlineFilterChange(header, '')}
                        className="absolute right-1.5 top-1.5 hover:bg-slate-800 text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </td>
              )
          )}
        </tr>
      )}
    </thead>
  );
}
