import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

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

export default function RuleBuilder({ headers, activeFilters, onFiltersChange, setCurrentPage }) {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('contains');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    if (headers && headers.length > 0) {
      if (!selectedColumn || !headers.includes(selectedColumn)) {
        setSelectedColumn(headers[0]);
      }
    }
  }, [headers, selectedColumn]);

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

  const getOperatorLabel = (value) => {
    const op = OPERATORS.find((o) => o.value === value);
    return op ? op.label : value;
  };

  return (
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
          className="h-[32px] px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg flex items-center space-x-1 transition-all cursor-pointer text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Rule</span>
        </button>
      </form>

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
  );
}
