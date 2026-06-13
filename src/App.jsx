import React, { useState, useMemo } from 'react';
import CSVUploader from './components/CSVUploader';
import StatsDashboard from './components/StatsDashboard';
import CSVChart from './components/CSVChart';
import DataTable from './components/DataTable';
import { Database, FileSpreadsheet, RotateCcw } from 'lucide-react';

export default function App() {
  const [csvData, setCsvData] = useState(null); // { data, headers, filename, size }
  const [activeFilters, setActiveFilters] = useState([]);
  const [inlineFilters, setInlineFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState('');

  const handleDataLoaded = (dataObject) => {
    setCsvData(dataObject);
    setActiveFilters([]);
    setInlineFilters({});
    setGlobalSearch('');
  };

  const handleReset = () => {
    setCsvData(null);
    setActiveFilters([]);
    setInlineFilters({});
    setGlobalSearch('');
  };

  // Perform multi-criteria filtering, global search, and inline column searching
  const filteredData = useMemo(() => {
    if (!csvData || !csvData.data) return [];

    return csvData.data.filter((row) => {
      // 1. Apply Global Search across all columns (if search string exists)
      if (globalSearch.trim() !== '') {
        const query = globalSearch.toLowerCase();
        const matchesSearch = Object.keys(row).some((key) => {
          const val = row[key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!matchesSearch) return false;
      }

      // 2. Apply inline column searches (quick column filtering)
      for (const col of Object.keys(inlineFilters)) {
        const val = inlineFilters[col];
        if (val !== undefined && val !== null && val.trim() !== '') {
          const rowVal = row[col];
          if (rowVal === null || rowVal === undefined) return false;
          
          const strRowVal = String(rowVal).toLowerCase();
          const strSearchVal = val.toLowerCase();
          if (!strRowVal.includes(strSearchVal)) return false;
        }
      }

      // 3. Apply structured advanced rules with AND logic
      for (const filter of activeFilters) {
        const rowVal = row[filter.column];
        const op = filter.operator;
        const filterVal = filter.value;

        // Handle empty condition checks first
        if (op === 'is_empty') {
          const isEmpty = rowVal === null || rowVal === undefined || String(rowVal).trim() === '';
          if (!isEmpty) return false;
          continue;
        }
        if (op === 'is_not_empty') {
          const isNotEmpty = rowVal !== null && rowVal !== undefined && String(rowVal).trim() !== '';
          if (!isNotEmpty) return false;
          continue;
        }

        // If other operators require a value, verify existence
        if (rowVal === null || rowVal === undefined) return false;

        const strRowVal = String(rowVal).toLowerCase();
        const strFilterVal = filterVal.toLowerCase();

        if (op === 'contains') {
          if (!strRowVal.includes(strFilterVal)) return false;
        } else if (op === 'equals') {
          // Check if both numeric for mathematical equality
          const numRow = Number(rowVal);
          const numFilter = Number(filterVal);
          if (!isNaN(numRow) && !isNaN(numFilter) && typeof rowVal !== 'boolean') {
            if (numRow !== numFilter) return false;
          } else {
            if (strRowVal !== strFilterVal) return false;
          }
        } else if (op === 'starts_with') {
          if (!strRowVal.startsWith(strFilterVal)) return false;
        } else if (op === 'ends_with') {
          if (!strRowVal.endsWith(strFilterVal)) return false;
        } else if (op === 'greater_than') {
          const numRow = Number(rowVal);
          const numFilter = Number(filterVal);
          if (isNaN(numRow) || isNaN(numFilter) || numRow <= numFilter) return false;
        } else if (op === 'less_than') {
          const numRow = Number(rowVal);
          const numFilter = Number(filterVal);
          if (isNaN(numRow) || isNaN(numFilter) || numRow >= numFilter) return false;
        }
      }

      return true;
    });
  }, [csvData, activeFilters, inlineFilters, globalSearch]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-600/20">
            <FileSpreadsheet className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent m-0 tracking-tight">
              SpectraCSV
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">CSV Parser & Analytical Dashboard</p>
          </div>
        </div>

        {csvData && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-red-500/30 hover:bg-red-950/10 text-slate-300 hover:text-red-400 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset File</span>
          </button>
        )}
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center">
        {!csvData ? (
          /* Upload Screen */
          <div className="space-y-8 animate-fade-in max-w-3xl mx-auto w-full">
            <div className="text-center space-y-3">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20 uppercase tracking-widest">
                Data Inspector
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
                Visualize and filter your CSV instantly
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base">
                Upload any comma-separated spreadsheet to clean, search, analyze, and chart your data.
                All processing is performed directly in your browser.
              </p>
            </div>

            <CSVUploader onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          /* Dashboard Layout */
          <div className="space-y-6 md:space-y-8 animate-fade-in w-full">
            {/* 1. Dashboard Overview Metrics */}
            <StatsDashboard
              data={csvData.data}
              headers={csvData.headers}
              filename={csvData.filename}
              size={csvData.size}
            />

            {/* 2. Full-width Custom SVG Chart */}
            <div className="w-full">
              <CSVChart data={filteredData} headers={csvData.headers} />
            </div>

            {/* 3. Interactive Data Table View with Integrated Filters */}
            <DataTable
              rawCount={csvData.data.length}
              filteredData={filteredData}
              headers={csvData.headers}
              filename={csvData.filename}
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
              inlineFilters={inlineFilters}
              onInlineFiltersChange={setInlineFilters}
              globalSearch={globalSearch}
              onSearchChange={setGlobalSearch}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-[10px] text-slate-600 bg-slate-950/40">
        SpectraCSV Data Inspector &copy; {new Date().getFullYear()} &middot; Built with React & Tailwind CSS
      </footer>
    </div>
  );
}
