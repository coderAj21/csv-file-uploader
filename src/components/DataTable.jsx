import React, { useState, useMemo } from 'react';
import TableToolbar from './TableToolbar';
import RuleBuilder from './RuleBuilder';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TablePagination from './TablePagination';

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
  
  // UI states for collapsible panels
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showInlineFilters, setShowInlineFilters] = useState(false);

  // Initialize visible columns
  useMemo(() => {
    const visibility = {};
    headers.forEach((h) => {
      visibility[h] = true;
    });
    setVisibleColumns(visibility);
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

  return (
    <div className="glass-panel rounded-2xl shadow-md overflow-hidden flex flex-col">
      {/* 1. Integrated Filter Toolbar */}
      <TableToolbar
        globalSearch={globalSearch}
        onSearchChange={onSearchChange}
        setCurrentPage={setCurrentPage}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        activeFilters={activeFilters}
        showInlineFilters={showInlineFilters}
        setShowInlineFilters={setShowInlineFilters}
        inlineFilters={inlineFilters}
        resetAllFilters={resetAllFilters}
        processedDataLength={processedData.length}
        rawCount={rawCount}
        headers={headers}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
        exportToCSV={exportToCSV}
      />

      {/* 2. Expanded Advanced Rule Builder Drawer */}
      {showAdvancedFilters && (
        <RuleBuilder
          headers={headers}
          activeFilters={activeFilters}
          onFiltersChange={onFiltersChange}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* 3. Main Table Scroll Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-slate-800/80 text-left border-collapse">
          <TableHeader
            headers={headers}
            visibleColumns={visibleColumns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            handleSort={handleSort}
            showInlineFilters={showInlineFilters}
            inlineFilters={inlineFilters}
            handleInlineFilterChange={handleInlineFilterChange}
          />
          <TableBody
            headers={headers}
            visibleColumns={visibleColumns}
            paginatedData={paginatedData}
            hasVisibleColumns={hasVisibleColumns}
          />
        </table>
      </div>

      {/* 4. Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        handleItemsPerPageChange={handleItemsPerPageChange}
        handlePageChange={handlePageChange}
        processedDataLength={processedData.length}
      />
    </div>
  );
}
