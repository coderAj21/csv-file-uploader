import React, { useState } from 'react';
import { Search, Filter, RotateCcw, Eye, Download } from 'lucide-react';

export default function TableToolbar({
  globalSearch,
  onSearchChange,
  setCurrentPage,
  showAdvancedFilters,
  setShowAdvancedFilters,
  activeFilters,
  showInlineFilters,
  setShowInlineFilters,
  inlineFilters,
  resetAllFilters,
  processedDataLength,
  rawCount,
  headers,
  visibleColumns,
  toggleColumnVisibility,
  exportToCSV,
}) {
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const activeFiltersCount = activeFilters.length + Object.values(inlineFilters).filter(Boolean).length;

  return (
    <div className="p-4 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/35">
      <div className="flex flex-wrap items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search table..."
            value={globalSearch}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Advanced Filter Builder Button */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-3 py-1.5 border text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${
            showAdvancedFilters || activeFilters.length > 0
              ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Rule Builder</span>
          {activeFilters.length > 0 && (
            <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.2 text-[9px] font-bold">
              {activeFilters.length}
            </span>
          )}
        </button>

        {/* Inline Filters Toggle */}
        <button
          onClick={() => setShowInlineFilters(!showInlineFilters)}
          className={`px-3 py-1.5 border text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${
            showInlineFilters || Object.values(inlineFilters).filter(Boolean).length > 0
              ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Column Filters</span>
          {Object.values(inlineFilters).filter(Boolean).length > 0 && (
            <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.2 text-[9px] font-bold">
              {Object.values(inlineFilters).filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Reset Filters */}
        {(activeFiltersCount > 0 || globalSearch) && (
          <button
            onClick={resetAllFilters}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Visibility / Export options */}
      <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-auto">
        <div className="text-[10px] text-slate-500 font-medium mr-2">
          Filtered: <span className="text-slate-300">{processedDataLength.toLocaleString()}</span> / {rawCount.toLocaleString()}
        </div>

        {/* Columns Visibility */}
        <div className="relative">
          <button
            onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
            className="px-3 py-1.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Columns</span>
          </button>

          {isColumnDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsColumnDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-52 max-h-56 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-20 p-2 space-y-1">
                <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider px-2 py-1">
                  Columns to display
                </div>
                {headers.map((h) => (
                  <label
                    key={h}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-xs text-slate-300 hover:text-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={!!visibleColumns[h]}
                      onChange={() => toggleColumnVisibility(h)}
                      className="rounded text-indigo-600 bg-slate-900 border-slate-800 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="truncate">{h}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Export button */}
        <button
          onClick={exportToCSV}
          disabled={processedDataLength === 0}
          className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 disabled:cursor-not-allowed border border-emerald-600/20 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
