import React from "react";
import { FileText, Layers, Hash, HardDrive } from "lucide-react";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function StatsDashboard({ data, headers, filename, size }) {
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
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              File Name
            </p>
            <p
              className="text-sm font-semibold text-slate-100 truncate"
              title={filename}
            >
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
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              File Size
            </p>
            <p className="text-sm font-semibold text-slate-100">
              {formatFileSize(size)}
            </p>
          </div>
        </div>

        {/* Total Rows Card */}
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/15">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Rows
            </p>
            <p className="text-sm font-semibold text-slate-100">
              {data.length.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Columns Card */}
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/15">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Columns
            </p>
            <p className="text-sm font-semibold text-slate-100">
              {headers.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
