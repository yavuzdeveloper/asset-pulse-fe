"use client";

import { useEffect, useState } from "react";

import GoldPriceChart from "./GoldPriceChart";
import GoldChartControls from "./GoldChartControls";
import GoldChartLegend from "./GoldChartLegend";

import {
  DEFAULT_VISIBILITY,
  type ChartVisibility,
  type ForecastResponse,
  type SeriesKey,
} from "./goldChart.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GoldChart() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [visibility, setVisibility] =
    useState<ChartVisibility>(DEFAULT_VISIBILITY);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${API_URL}/ml/forecast/7-days`);

        if (!response.ok) {
          throw new Error("Unable to load 7-day forecast data.");
        }

        const data: ForecastResponse = await response.json();

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
    setVisibility(current => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function showForecastFocus() {
    window.dispatchEvent(new Event("gold-chart-forecast-focus"));
  }

  function showAll() {
    window.dispatchEvent(new Event("gold-chart-show-all"));
  }

  function resetZoom() {
    window.dispatchEvent(new Event("gold-chart-reset-zoom"));
  }

  if (loading) return <p>Loading gold chart...</p>;
  if (error) return <p>{error}</p>;
  if (!forecast) return <p>No chart data available.</p>;

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

      <GoldChartControls
        onForecastFocus={showForecastFocus}
        onShowAll={showAll}
        onReset={resetZoom}
      />

      <GoldChartLegend visibility={visibility} onToggle={toggleLine} />

      <GoldPriceChart forecast={forecast} visibility={visibility} />

      <p className="mt-3 text-xs text-zinc-500">
        Experimental forecasts. ML predictions have not yet been validated as
        reliable. Not financial advice.
      </p>
    </section>
  );
}
