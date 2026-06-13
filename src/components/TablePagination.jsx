import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

export default function TablePagination({
  currentPage,
  totalPages,
  itemsPerPage,
  handleItemsPerPageChange,
  handlePageChange,
  processedDataLength,
}) {
  if (processedDataLength === 0) return null;

  return (
    <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-950/20 text-xs text-slate-400 font-medium">
      <div className="flex items-center space-x-2">
        <span>Show</span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:border-indigo-500/50 outline-none cursor-pointer"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>entries</span>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2.5">
        <span className="mr-2.5">
          Page <span className="text-slate-200">{currentPage}</span> of{' '}
          <span className="text-slate-200">{totalPages}</span>
        </span>

        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-0.5 shadow-inner">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed hover:bg-slate-900/60 transition-all cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed hover:bg-slate-900/60 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed hover:bg-slate-900/60 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed hover:bg-slate-900/60 transition-all cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
