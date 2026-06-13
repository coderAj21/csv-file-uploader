import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Download,
  Filter,
  Plus,
  X,
  RotateCcw,
  Search,
} from 'lucide-react';

const OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

export default function DataTable({
  rawCount,
  filteredData,
  headers,
  filename,
  // Filter states lifted from parent
  activeFilters,
  onFiltersChange,
  inlineFilters,
  onInlineFiltersChange,
  globalSearch,
  onSearchChange,
}) {
  // Sort state
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Visibility states
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  
  // UI states for collapsible panels
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showInlineFilters, setShowInlineFilters] = useState(false);

  // Form state for Advanced Filter Builder
  const [selectedColumn, setSelectedColumn] = useState(headers[0] || '');
  const [selectedOperator, setSelectedOperator] = useState('contains');
  const [filterValue, setFilterValue] = useState('');

  // Initialize visible columns
  useMemo(() => {
    const visibility = {};
    headers.forEach((h) => {
      visibility[h] = true;
    });
    setVisibleColumns(visibility);
    if (headers.length > 0 && !selectedColumn) {
      setSelectedColumn(headers[0]);
    }
  }, [headers]);

  // Handle column header clicks for sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Sort the filtered data
  const processedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      const numA = Number(valA);
      const numB = Number(valB);

      const isNumA = !isNaN(numA) && typeof valA !== 'boolean' && valA !== '';
      const isNumB = !isNaN(numB) && typeof valB !== 'boolean' && valB !== '';

      if (isNumA && isNumB) {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginated data slice
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Advanced Filter Handlers
  const addAdvancedFilter = (e) => {
    e.preventDefault();
    if (!selectedColumn || !selectedOperator) return;

    const noValueRequired = selectedOperator === 'is_empty' || selectedOperator === 'is_not_empty';
    if (!noValueRequired && filterValue.trim() === '') return;

    const newFilter = {
      id: Date.now().toString(),
      column: selectedColumn,
      operator: selectedOperator,
      value: noValueRequired ? '' : filterValue.trim(),
    };

    onFiltersChange([...activeFilters, newFilter]);
    setFilterValue('');
    setCurrentPage(1);
  };

  const removeAdvancedFilter = (id) => {
    onFiltersChange(activeFilters.filter((f) => f.id !== id));
    setCurrentPage(1);
  };

  // Inline Filter Handlers
  const handleInlineFilterChange = (column, val) => {
    onInlineFiltersChange({
      ...inlineFilters,
      [column]: val,
    });
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    onFiltersChange([]);
    onInlineFiltersChange({});
    onSearchChange('');
    setCurrentPage(1);
  };

  const getOperatorLabel = (value) => {
    const op = OPERATORS.find((o) => o.value === value);
    return op ? op.label : value;
  };

  const exportToCSV = () => {
    if (processedData.length === 0) return;

    const exportHeaders = headers.filter((h) => visibleColumns[h]);
    let csvContent = exportHeaders.join(',') + '\n';

    processedData.forEach((row) => {
      const line = exportHeaders.map((header) => {
        let val = row[header];
        if (val === undefined || val === null) return '""';
        let strVal = String(val);
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          strVal = `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      });
      csvContent += line.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `filtered_${filename || 'data.csv'}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasVisibleColumns = Object.values(visibleColumns).some(Boolean);
  const activeFiltersCount = activeFilters.length + Object.values(inlineFilters).filter(Boolean).length;

  return (
    <div className="glass-panel rounded-2xl shadow-md overflow-hidden flex flex-col">
      {/* 1. Integrated Filter Toolbar */}
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
            Filtered: <span className="text-slate-300">{processedData.length.toLocaleString()}</span> / {rawCount.toLocaleString()}
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
            disabled={processedData.length === 0}
            className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 disabled:cursor-not-allowed border border-emerald-600/20 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Expanded Advanced Rule Builder Drawer */}
      {showAdvancedFilters && (
        <div className="px-4 py-3 bg-slate-900/15 border-b border-slate-800/60 space-y-3">
          <form onSubmit={addAdvancedFilter} className="flex flex-wrap items-end gap-3.5">
            <div className="flex flex-col space-y-1 min-w-[140px] flex-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Column
              </label>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none cursor-pointer"
              >
                {headers.map((h) => (
                  <option key={h} value={h} className="bg-slate-900">
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1 min-w-[120px] flex-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Condition
              </label>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none cursor-pointer"
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value} className="bg-slate-900">
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedOperator !== 'is_empty' && selectedOperator !== 'is_not_empty' && (
              <div className="flex flex-col space-y-1 min-w-[160px] flex-[2]">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Value
                </label>
                <input
                  type="text"
                  placeholder="Filter query..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none placeholder-slate-600"
                />
              </div>
            )}

            <button
              type="submit"
              className="h-[32px] px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg flex items-center space-x-1 transition-all cursor-pointer text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </form>

          {/* Active Advanced Filter Badges */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-slate-900/30">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Rules:
              </span>
              {activeFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center space-x-1 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[11px] text-indigo-300 shadow-sm"
                >
                  <span className="font-semibold text-slate-200">{filter.column}</span>
                  <span className="text-slate-400 text-[9px]">{getOperatorLabel(filter.operator)}</span>
                  {filter.value !== '' && (
                    <span className="font-mono bg-indigo-950/50 px-1 py-0.1 rounded text-indigo-200">
                      "{filter.value}"
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAdvancedFilter(filter.id)}
                    className="hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-200 p-0.5 rounded-full cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Main Table Scroll Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-slate-800/80 text-left border-collapse">
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
        </table>
      </div>

      {/* 4. Pagination Footer */}
      {processedData.length > 0 && (
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
      )}
    </div>
  );
}
