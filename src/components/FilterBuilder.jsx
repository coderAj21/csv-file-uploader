import React, { useState, useEffect } from 'react';
import { Plus, X, Filter, RotateCcw, Search } from 'lucide-react';

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

export default function FilterBuilder({ headers, data, onFiltersChange, onSearchChange }) {
  const [activeFilters, setActiveFilters] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Form state
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('contains');
  const [filterValue, setFilterValue] = useState('');

  // Set default selected column when headers load
  useEffect(() => {
    if (headers && headers.length > 0 && !selectedColumn) {
      setSelectedColumn(headers[0]);
    }
  }, [headers]);

  // Propagate filter changes to parent
  useEffect(() => {
    onFiltersChange(activeFilters);
  }, [activeFilters, onFiltersChange]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setGlobalSearch(val);
    onSearchChange(val);
  };

  const addFilter = (e) => {
    e.preventDefault();
    if (!selectedColumn || !selectedOperator) return;

    // Check if operator doesn't require a value
    const noValueRequired = selectedOperator === 'is_empty' || selectedOperator === 'is_not_empty';
    if (!noValueRequired && filterValue.trim() === '') return;

    // Generate unique ID
    const newFilter = {
      id: Date.now().toString(),
      column: selectedColumn,
      operator: selectedOperator,
      value: noValueRequired ? '' : filterValue.trim(),
    };

    setActiveFilters([...activeFilters, newFilter]);
    setFilterValue(''); // Reset value field
  };

  const removeFilter = (id) => {
    setActiveFilters(activeFilters.filter((f) => f.id !== id));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setGlobalSearch('');
    onSearchChange('');
  };

  const getOperatorLabel = (value) => {
    const op = OPERATORS.find((o) => o.value === value);
    return op ? op.label : value;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl shadow-md space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-100">Data Filtering</h2>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search across all columns..."
            value={globalSearch}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200"
          />
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* Filter Creator Form */}
      <form onSubmit={addFilter} className="flex flex-wrap items-end gap-3.5">
        {/* Column Select */}
        <div className="flex flex-col space-y-1.5 min-w-[150px] flex-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Select Column
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:border-indigo-500/50 outline-none cursor-pointer"
          >
            {headers.map((h) => (
              <option key={h} value={h} className="bg-slate-900">
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Operator Select */}
        <div className="flex flex-col space-y-1.5 min-w-[130px] flex-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Condition
          </label>
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:border-indigo-500/50 outline-none cursor-pointer"
          >
            {OPERATORS.map((op) => (
              <option key={op.value} value={op.value} className="bg-slate-900">
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value Input */}
        {selectedOperator !== 'is_empty' && selectedOperator !== 'is_not_empty' && (
          <div className="flex flex-col space-y-1.5 min-w-[180px] flex-[2]">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Value
            </label>
            <input
              type="text"
              placeholder="Enter filter value..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:border-indigo-500/50 outline-none placeholder-slate-600"
            />
          </div>
        )}

        {/* Add Filter Button */}
        <button
          type="submit"
          className="h-[38px] px-5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Filter</span>
        </button>

        {/* Reset / Clear All Button */}
        {(activeFilters.length > 0 || globalSearch) && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="h-[38px] px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-sm font-semibold rounded-xl flex items-center space-x-1.5 transition-all duration-150 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </form>

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Active filters:
          </span>
          {activeFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 rounded-full text-xs text-indigo-300 shadow-sm"
            >
              <span className="font-semibold text-slate-200">{filter.column}</span>
              <span className="text-slate-400 text-[10px]">{getOperatorLabel(filter.operator)}</span>
              {filter.value !== '' && (
                <span className="font-mono bg-indigo-950/50 px-1.5 py-0.5 rounded text-indigo-200">
                  "{filter.value}"
                </span>
              )}
              <button
                type="button"
                onClick={() => removeFilter(filter.id)}
                className="hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-200 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
