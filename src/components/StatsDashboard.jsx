import React, { useMemo } from 'react';
import { FileText, Layers, Hash, HardDrive, Calculator } from 'lucide-react';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function StatsDashboard({ data, headers, filename, size }) {
  // Identify numeric columns and compute basic statistics
  const numericStats = useMemo(() => {
    if (!data || data.length === 0 || !headers) return [];

    const stats = [];

    headers.forEach((col) => {
      // Check if values in the column are mostly numeric (ignoring nulls/blanks)
      let numericCount = 0;
      let validCount = 0;
      let min = Infinity;
      let max = -Infinity;
      let sum = 0;

      data.forEach((row) => {
        const val = row[col];
        if (val !== undefined && val !== null && val !== '') {
          validCount++;
          // In PapaParse, dynamicTyping converts digits to numbers.
          // We double check if it is a number or can be parsed as a number.
          const num = Number(val);
          if (!isNaN(num) && typeof val !== 'boolean') {
            numericCount++;
            if (num < min) min = num;
            if (num > max) max = num;
            sum += num;
          }
        }
      });

      // If at least 70% of the non-empty rows are numeric, treat as numeric column
      if (validCount > 0 && (numericCount / validCount) >= 0.7) {
        stats.push({
          column: col,
          min: min === Infinity ? 0 : min,
          max: max === -Infinity ? 0 : max,
          avg: numericCount > 0 ? (sum / numericCount) : 0,
          totalCount: numericCount,
        });
      }
    });

    return stats;
  }, [data, headers]);

  return (
    <div className="space-y-6">
      {/* File Overview Metadata Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* File Name Card */}
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/15">
            <FileText className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">File Name</p>
            <p className="text-sm font-semibold text-slate-100 truncate" title={filename}>
              {filename}
            </p>
          </div>
        </div>

        {/* File Size Card */}
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/15">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">File Size</p>
            <p className="text-sm font-semibold text-slate-100">{formatFileSize(size)}</p>
          </div>
        </div>

        {/* Total Rows Card */}
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/15">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Rows</p>
            <p className="text-sm font-semibold text-slate-100">{data.length.toLocaleString()}</p>
          </div>
        </div>

        {/* Total Columns Card */}
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/15">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Columns</p>
            <p className="text-sm font-semibold text-slate-100">{headers.length}</p>
          </div>
        </div>
      </div>

      {/* Numeric Inferences Dashboard section */}
      {numericStats.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
              Numeric Column Insights
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {numericStats.map((stat) => (
              <div
                key={stat.column}
                className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-200"
              >
                {/* Visual Accent Glow on Hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>

                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-200 truncate pr-4" title={stat.column}>
                    {stat.column}
                  </h4>
                  <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50">
                    Numeric
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Min</p>
                    <p className="text-xs font-bold text-slate-300 mt-0.5 truncate" title={stat.min}>
                      {typeof stat.min === 'number' && !Number.isInteger(stat.min) ? stat.min.toFixed(2) : stat.min}
                    </p>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Average</p>
                    <p className="text-xs font-bold text-indigo-400 mt-0.5 truncate" title={stat.avg}>
                      {stat.avg.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Max</p>
                    <p className="text-xs font-bold text-slate-300 mt-0.5 truncate" title={stat.max}>
                      {typeof stat.max === 'number' && !Number.isInteger(stat.max) ? stat.max.toFixed(2) : stat.max}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
