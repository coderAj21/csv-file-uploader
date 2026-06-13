import React, { useState, useMemo, useEffect } from "react";
import { BarChart2, TrendingUp, ScatterChart, BarChart } from "lucide-react";

export default function CSVChart({ data, headers }) {
  const [xAxisCol, setXAxisCol] = useState("");
  const [yAxisCol, setYAxisCol] = useState("");
  const [chartType, setChartType] = useState("bar"); // bar, line, scatter
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Auto-detect columns
  const columnAnalysis = useMemo(() => {
    if (!data || data.length === 0 || !headers)
      return { numericCols: [], allCols: [] };

    const numericCols = [];
    const allCols = [...headers];

    headers.forEach((col) => {
      let numericCount = 0;
      let validCount = 0;

      data.forEach((row) => {
        const val = row[col];
        if (val !== undefined && val !== null && val !== "") {
          validCount++;
          const num = Number(val);
          if (!isNaN(num) && typeof val !== "boolean") {
            numericCount++;
          }
        }
      });

      if (validCount > 0 && numericCount / validCount >= 0.7) {
        numericCols.push(col);
      }
    });

    return { numericCols, allCols };
  }, [data, headers]);

  // Set default axes when column analysis completes
  useEffect(() => {
    const { numericCols, allCols } = columnAnalysis;
    if (numericCols.length > 0) {
      setYAxisCol(numericCols[0]);

      // Look for a reasonable X axis (preferably first column if it's text/name, or first distinct column)
      const nonNumeric = allCols.find((col) => !numericCols.includes(col));
      if (nonNumeric) {
        setXAxisCol(nonNumeric);
      } else {
        setXAxisCol(allCols[0]);
      }
    }
  }, [columnAnalysis]);

  // Process data points for the chart - Limit to 30 items for visualization readability
  const chartPoints = useMemo(() => {
    if (!data || !xAxisCol || !yAxisCol) return [];

    // Take first 30 rows to fit nicely on screen
    const sample = data.slice(0, 30);

    return sample.map((row, index) => {
      let xVal = row[xAxisCol];
      let yVal = Number(row[yAxisCol]);

      // Formatting x values for cleaner displays
      if (typeof xVal === "boolean") xVal = xVal ? "True" : "False";
      if (xVal === null || xVal === undefined) xVal = `Row ${index + 1}`;

      return {
        label: String(xVal),
        value: isNaN(yVal) ? 0 : yVal,
        originalIndex: index,
        row,
      };
    });
  }, [data, xAxisCol, yAxisCol]);

  // Calculate SVG layout parameters
  const svgConfig = useMemo(() => {
    if (chartPoints.length === 0) return null;

    const width = 800;
    const height = 300;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 45;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Y axis range (include 0, or scale to min/max)
    const yValues = chartPoints.map((p) => p.value);
    const maxYVal = Math.max(...yValues, 0);
    const minYVal = Math.min(...yValues, 0);

    const yRange = maxYVal - minYVal === 0 ? 100 : (maxYVal - minYVal) * 1.1; // 10% headroom
    const yMaxBound = maxYVal + (maxYVal - minYVal) * 0.05;
    const yMinBound = minYVal - (maxYVal - minYVal) * 0.05;

    // Function to calculate Y pixel coordinate
    const getYPixel = (value) => {
      const percentage = (value - yMinBound) / (yMaxBound - yMinBound);
      return height - paddingBottom - percentage * chartHeight;
    };

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartWidth,
      chartHeight,
      yMaxBound,
      yMinBound,
      getYPixel,
    };
  }, [chartPoints]);

  if (
    columnAnalysis.numericCols.length === 0 ||
    chartPoints.length === 0 ||
    !svgConfig
  ) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center space-y-2">
        <p className="text-slate-400 font-medium">Visualizations Unavailable</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No numeric columns were detected in your CSV dataset to plot on the
          Y-Axis.
        </p>
      </div>
    );
  }

  const {
    width,
    height,
    paddingLeft,
    chartWidth,
    chartHeight,
    paddingTop,
    paddingBottom,
    yMaxBound,
    yMinBound,
    getYPixel,
  } = svgConfig;

  // Grid tick markers for Y axis (4 levels)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = yMinBound + (i * (yMaxBound - yMinBound)) / 4;
    return {
      value,
      y: getYPixel(value),
    };
  });

  return (
    <div className="glass-panel p-5 rounded-2xl shadow-md space-y-4">
      {/* Chart Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Interactive Visualization
          </h2>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50">
            Showing first {chartPoints.length} records
          </span>
        </div>

        {/* Configurations Selector Panel */}
        <div className="flex flex-wrap items-center gap-3">
          {/* X Axis select */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400">X:</span>
            <select
              value={xAxisCol}
              onChange={(e) => setXAxisCol(e.target.value)}
              className="px-2.5 py-1 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-200 outline-none cursor-pointer"
            >
              {columnAnalysis.allCols.map((col) => (
                <option key={col} value={col} className="bg-slate-900">
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Y Axis select */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400">Y:</span>
            <select
              value={yAxisCol}
              onChange={(e) => setYAxisCol(e.target.value)}
              className="px-2.5 py-1 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-200 outline-none cursor-pointer"
            >
              {columnAnalysis.numericCols.map((col) => (
                <option key={col} value={col} className="bg-slate-900">
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className="flex bg-slate-950/60 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setChartType("bar")}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                chartType === "bar"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Bar Chart"
            >
              <BarChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                chartType === "line"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Line Chart"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("scatter")}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                chartType === "scatter"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Scatter Chart"
            >
              <ScatterChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-x-auto pb-2">
        <div className="min-w-[800px] select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            className="overflow-visible"
          >
            {/* Gradients definitions */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="hoverBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="lineFillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines & Y Tick Labels */}
            {yTicks.map((tick, index) => (
              <g key={index}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={width - svgConfig.paddingRight}
                  y2={tick.y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray={
                    index === 0 || tick.value === 0 ? "0" : "4 4"
                  }
                />
                <text
                  x={paddingLeft - 10}
                  y={tick.y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {tick.value.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                    notation:
                      Math.abs(tick.value) >= 10000 ? "scientific" : "standard",
                  })}
                </text>
              </g>
            ))}

            {/* X-Axis Labels */}
            {chartPoints.map((point, index) => {
              const xSpacing = chartWidth / chartPoints.length;
              const xPos = paddingLeft + index * xSpacing + xSpacing / 2;

              // Skip labels for readability if too crowded
              const shouldShowLabel =
                chartPoints.length <= 15 ||
                index % Math.ceil(chartPoints.length / 15) === 0;

              return (
                shouldShowLabel && (
                  <text
                    key={index}
                    x={xPos}
                    y={height - paddingBottom + 16}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                    className="origin-center"
                    transform={`rotate(-25, ${xPos}, ${height - paddingBottom + 16})`}
                  >
                    {point.label.length > 12
                      ? point.label.substring(0, 10) + "..."
                      : point.label}
                  </text>
                )
              );
            })}

            {/* Render chart items */}
            {chartType === "bar" &&
              chartPoints.map((point, index) => {
                const xSpacing = chartWidth / chartPoints.length;
                const barWidth = Math.max(xSpacing * 0.7, 4);
                const xPos =
                  paddingLeft + index * xSpacing + (xSpacing - barWidth) / 2;

                const yZero = getYPixel(0);
                const yVal = getYPixel(point.value);

                const barHeight = Math.abs(yZero - yVal);
                const yPos = point.value >= 0 ? yVal : yZero;

                const isHovered =
                  hoveredPoint &&
                  hoveredPoint.originalIndex === point.originalIndex;

                return (
                  <rect
                    key={index}
                    x={xPos}
                    y={yPos}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={Math.min(barWidth / 4, 3)}
                    fill={
                      isHovered ? "url(#hoverBarGradient)" : "url(#barGradient)"
                    }
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={(e) =>
                      setHoveredPoint({
                        ...point,
                        x: xPos + barWidth / 2,
                        y: yPos,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

            {chartType === "line" && (
              <>
                {/* Gradient Fill Under Line */}
                <path
                  d={`
                    M ${paddingLeft + chartWidth / chartPoints.length / 2} ${getYPixel(0)}
                    ${chartPoints
                      .map((point, index) => {
                        const xSpacing = chartWidth / chartPoints.length;
                        const x = paddingLeft + index * xSpacing + xSpacing / 2;
                        const y = getYPixel(point.value);
                        return `L ${x} ${y}`;
                      })
                      .join(" ")}
                    L ${paddingLeft + (chartPoints.length - 1) * (chartWidth / chartPoints.length) + chartWidth / chartPoints.length / 2} ${getYPixel(0)}
                    Z
                  `}
                  fill="url(#lineFillGradient)"
                />

                {/* Continuous Line */}
                <path
                  d={chartPoints
                    .map((point, index) => {
                      const xSpacing = chartWidth / chartPoints.length;
                      const x = paddingLeft + index * xSpacing + xSpacing / 2;
                      const y = getYPixel(point.value);
                      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Nodes/Dots on Line */}
                {chartPoints.map((point, index) => {
                  const xSpacing = chartWidth / chartPoints.length;
                  const xPos = paddingLeft + index * xSpacing + xSpacing / 2;
                  const yPos = getYPixel(point.value);
                  const isHovered =
                    hoveredPoint &&
                    hoveredPoint.originalIndex === point.originalIndex;

                  return (
                    <circle
                      key={index}
                      cx={xPos}
                      cy={yPos}
                      r={isHovered ? 5.5 : 3.5}
                      fill={isHovered ? "#a78bfa" : "#4f46e5"}
                      stroke={isHovered ? "#ffffff" : "#1e1b4b"}
                      strokeWidth={isHovered ? 1.5 : 1}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() =>
                        setHoveredPoint({ ...point, x: xPos, y: yPos })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </>
            )}

            {chartType === "scatter" &&
              chartPoints.map((point, index) => {
                const xSpacing = chartWidth / chartPoints.length;
                const xPos = paddingLeft + index * xSpacing + xSpacing / 2;
                const yPos = getYPixel(point.value);
                const isHovered =
                  hoveredPoint &&
                  hoveredPoint.originalIndex === point.originalIndex;

                return (
                  <circle
                    key={index}
                    cx={xPos}
                    cy={yPos}
                    r={isHovered ? 7 : 5}
                    fill={isHovered ? "#c084fc" : "#818cf8"}
                    fillOpacity={isHovered ? 1.0 : 0.75}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 1.5 : 0.5}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() =>
                      setHoveredPoint({ ...point, x: xPos, y: yPos })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
          </svg>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-10 bg-slate-950/95 border border-indigo-500/30 px-3 py-2 rounded-lg text-xs shadow-xl pointer-events-none transition-all duration-75 space-y-0.5"
            style={{
              left: `${Math.min(hoveredPoint.x + 10, width - 150)}px`,
              top: `${Math.min(hoveredPoint.y - 15, height - 70)}px`,
            }}
          >
            <p className="font-semibold text-slate-200 truncate max-w-[150px]">
              {xAxisCol}: {hoveredPoint.label}
            </p>
            <p className="font-medium text-indigo-300 font-mono">
              {yAxisCol}:{" "}
              {hoveredPoint.value.toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
