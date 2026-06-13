import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileWarning, CheckCircle, Database } from 'lucide-react';

const SAMPLE_CSV = `Name,Department,Age,Salary,Hire Date,Performance Score,Remote
Alice Johnson,Engineering,28,95000,2022-03-15,4.8,true
Bob Smith,Marketing,34,75000,2021-06-20,3.9,false
Charlie Brown,Engineering,42,120000,2018-09-10,4.5,true
Diana Prince,Product,31,105000,2023-01-10,4.9,true
Evan Wright,Sales,25,55000,2024-02-01,3.5,false
Fiona Gallagher,HR,29,68000,2022-11-05,4.2,false
George Costanza,Sales,45,48000,2019-04-01,2.1,true
Harriet Tubman,Operations,50,110000,2015-05-12,5.0,false
Ian Malcolm,Engineering,38,115000,2020-07-22,4.6,true
Julia Roberts,Marketing,27,72000,2023-08-14,4.1,false
Kevin Bacon,Product,36,98000,2022-10-10,4.0,true
Laura Croft,Operations,32,87000,2021-12-01,4.7,true
Michael Scott,Sales,43,62000,2013-02-18,3.2,false
Nancy Drew,Security,24,65000,2024-05-20,4.4,true
Obi-Wan Kenobi,Training,57,135000,2010-06-01,4.9,true
Peggy Carter,Operations,35,92000,2018-04-15,4.8,false
Quentin Tarantino,Marketing,48,80000,2017-11-30,3.8,true
Rachel Green,HR,26,60000,2023-05-01,3.6,false
Steve Rogers,Security,102,70000,1945-08-01,5.0,false
Tony Stark,Engineering,48,250000,2008-05-02,4.9,true`;

export default function CSVUploader({ onDataLoaded }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    // Validate that it's a CSV
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'csv' && file.type !== 'text/csv') {
      setError('Please upload a valid CSV file.');
      return;
    }

    setError('');
    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        setIsLoading(false);
        if (results.errors.length > 0 && results.data.length === 0) {
          setError('Failed to parse CSV file. Please check its structure.');
          console.error(results.errors);
          return;
        }

        const headers = results.meta.fields || [];
        if (headers.length === 0) {
          setError('The CSV file does not contain any columns.');
          return;
        }

        onDataLoaded({
          data: results.data,
          headers,
          filename: file.name,
          size: file.size,
        });
      },
      error: (err) => {
        setIsLoading(false);
        setError(`Error parsing CSV: ${err.message}`);
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const loadSample = () => {
    setIsLoading(true);
    setError('');
    
    // Simulate slight delay for premium feedback
    setTimeout(() => {
      Papa.parse(SAMPLE_CSV, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: true,
        complete: (results) => {
          setIsLoading(false);
          onDataLoaded({
            data: results.data,
            headers: results.meta.fields || [],
            filename: 'Sample_Employee_Data.csv',
            size: SAMPLE_CSV.length,
          });
        },
        error: (err) => {
          setIsLoading(false);
          setError(`Error loading sample data: ${err.message}`);
        }
      });
    }, 600);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all duration-300 glass-panel ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-950/20 scale-[1.01] shadow-[0_0_20px_rgba(99,102,241,0.15)]'
            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
          id="csv-file-input"
        />

        {isLoading ? (
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-300 font-medium animate-pulse">Parsing CSV data...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-100">
                Drag and drop your CSV file here
              </p>
              <p className="text-sm text-slate-400">
                or click the button to browse from your computer
              </p>
            </div>

            <button
              onClick={onButtonClick}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 cursor-pointer"
            >
              Select File
            </button>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-950/20 border border-red-500/20 px-4 py-2 rounded-lg text-sm mt-2">
                <FileWarning className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-6 border-t border-slate-800/80 w-full flex flex-col items-center space-y-2">
              <p className="text-xs text-slate-500">Don't have a CSV file on hand?</p>
              <button
                onClick={loadSample}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-indigo-300 hover:text-indigo-200 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Load Sample Employee Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
