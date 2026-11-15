"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type HistoryPoint = {
  date: string;
  close: number;
};

type ForecastDay = {
  horizon: number;
  date: string | null;
  naive: {
    high: number;
    low: number;
    close: number;
  };
  random_forest: {
    close: number;
  } | null;
  xgboost: {
    high?: number;
    low?: number;
    close?: number;
  };
};

type ForecastResponse = {
  last_date: string;
  last_close: number;
  historical: HistoryPoint[];
  forecasts: ForecastDay[];
  warning: string;
};

type SeriesKey =
  | "actual"
  | "naive"
  | "randomForest"
  | "linearRegression"
  | "xgboost";

const SERIES: {
  key: SeriesKey;
  label: string;
  color: string;
}[] = [
  { key: "actual", label: "Actual Close", color: "#16a34a" },
  { key: "naive", label: "Naive (Last Close)", color: "#3b82f6" },
  { key: "randomForest", label: "Random Forest", color: "#f59e0b" },
  { key: "linearRegression", label: "Linear Regression", color: "#a78bfa" },
  { key: "xgboost", label: "XGBoost", color: "#ef4444" },
];

type ChartRange = {
  startIndex: number;
  endIndex: number;
};


export default function GoldChart() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [visibleLines, setVisibleLines] = useState<Record<SeriesKey, boolean>>({
    actual: true,
    naive: true,
    randomForest: true,
    linearRegression: true,
    xgboost: true,
  });

  const [chartRange, setChartRange] = useState<ChartRange>({
    startIndex: 0,
    endIndex: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${API_URL}/ml/forecast/7-days`);

        if (!response.ok) {
          throw new Error("Unable to load 7-day forecast data.");
        }

        const data: ForecastResponse = await response.json();

        const historyCount = data.historical.length;
        const forecastCount = data.forecasts.length;
        const totalCount = historyCount + forecastCount;

        // Start with an equal number of historical and forecast points.
        const startIndex = Math.max(0, historyCount - forecastCount);

        setChartRange({
          startIndex,
          endIndex: totalCount - 1,
        });

        setForecast(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function toggleLine(key: SeriesKey) {
    setVisibleLines(current => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function showForecastFocus() {
    if (!forecast) return;

    const historyCount = forecast.historical.length;
    const forecastCount = forecast.forecasts.length;

    setChartRange({
      startIndex: Math.max(0, historyCount - forecastCount),
      endIndex: historyCount + forecastCount - 1,
    });
  }

  function showAllData() {
    if (!forecast) return;

    setChartRange({
      startIndex: 0,
      endIndex: forecast.historical.length + forecast.forecasts.length - 1,
    });
  }

  if (loading) return <p>Loading gold chart...</p>;
  if (error) return <p>{error}</p>;
  if (!forecast) return <p>No chart data available.</p>;

  const chartData = [
    ...forecast.historical.map(point => ({
      date: point.date,
      actual: point.close,
      naive: null as number | null,
      randomForest: null as number | null,
      linearRegression: null as number | null,
      xgboost: null as number | null,
    })),

    ...forecast.forecasts.map(day => ({
      date: day.date ?? "",
      actual: null,
      naive: day.naive.close,
      randomForest: day.random_forest?.close ?? null,
      linearRegression: null,
      xgboost: day.xgboost.close ?? null,
    })),
  ];

  return (
    <section className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">
          Gold Price — 7 Day Forecast
        </h2>

        <p className="text-sm text-zinc-400">
          Historical Price vs. 7 Trading Day Forecast · XAU / USD
        </p>
      </div>

      {/* Chart Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={showForecastFocus}
          className="rounded-md border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/20"
        >
          Forecast Focus
        </button>

        <button
          type="button"
          onClick={showAllData}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          Show All
        </button>

        <span className="text-xs text-zinc-500">
          Drag the selector below the chart to zoom and pan.
        </span>
      </div>

      {/* Interactive Legend */}
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-3">
        {SERIES.map(series => {
          const isVisible = visibleLines[series.key];

          return (
            <button
              key={series.key}
              type="button"
              onClick={() => toggleLine(series.key)}
              aria-pressed={isVisible}
              className={`flex items-center gap-2 text-sm transition-opacity ${
                isVisible
                  ? "text-zinc-200 opacity-100"
                  : "text-zinc-500 opacity-50"
              }`}
            >
              <span
                className="h-0.5 w-5 rounded"
                style={{ backgroundColor: series.color }}
              />

              <span className={isVisible ? "" : "line-through"}>
                {series.label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ width: "100%", height: 440, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 15, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              tickFormatter={value => {
                const date = new Date(`${value}T00:00:00Z`);

                return date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  timeZone: "UTC",
                });
              }}
              interval="preserveStartEnd"
              angle={-35}
              textAnchor="end"
              height={60}
            />

            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              tickFormatter={value => `$${Number(value).toLocaleString()}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={value =>
                typeof value === "number" ? `$${value.toFixed(2)}` : "—"
              }
            />

            <ReferenceLine
              x={forecast.forecasts[0]?.date ?? ""}
              stroke="#a1a1aa"
              strokeWidth={2}
              strokeDasharray="5 4"
              label={{
                value: "FORECAST START",
                position: "insideTopRight",
                fill: "#d4d4d8",
                fontSize: 11,
              }}
            />

            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Close"
              stroke="#16a34a"
              strokeWidth={2}
              strokeOpacity={0.65}
              dot={{ r: 3 }}
              connectNulls
              hide={!visibleLines.actual}
            />

            <Line
              type="monotone"
              dataKey="naive"
              name="Naive (Last Close)"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3 }}
              connectNulls
              hide={!visibleLines.naive}
            />

            <Line
              type="monotone"
              dataKey="randomForest"
              name="Random Forest"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 5 }}
              connectNulls={false}
              hide={!visibleLines.randomForest}
            />

            <Line
              type="monotone"
              dataKey="linearRegression"
              name="Linear Regression"
              stroke="#a78bfa"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              connectNulls
              hide={!visibleLines.linearRegression}
            />

            <Line
              type="monotone"
              dataKey="xgboost"
              name="XGBoost"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              connectNulls
              hide={!visibleLines.xgboost}
            />

            <Brush
              dataKey="date"
              height={25}
              stroke="#71717a"
              fill="#27272a"
              startIndex={chartRange.startIndex}
              endIndex={chartRange.endIndex}
              onChange={range => {
                if (
                  typeof range.startIndex === "number" &&
                  typeof range.endIndex === "number"
                ) {
                  setChartRange({
                    startIndex: range.startIndex,
                    endIndex: range.endIndex,
                  });
                }
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Experimental forecasts. ML predictions have not yet been validated as
        reliable. Not financial advice.
      </p>
    </section>
  );
}
