"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ForecastResponse = {
  symbol: string;
  currency: string;
  unit: string;
  model: string;
  status: string;
  horizon: string;
  last_date: string;
  last_close: number;
  forecasts: {
    high: {
      predicted_price: number;
      predicted_return_percent: number;
      baseline_price: number;
      difference_vs_baseline: number;
    };
    low: {
      predicted_price: number;
      predicted_return_percent: number;
      baseline_price: number;
      difference_vs_baseline: number;
    };
    close: {
      predicted_price: number;
      predicted_return_percent: number;
      baseline_price: number;
      difference_vs_baseline: number;
    };
  };
  warning: string;
};

export default function ForecastCard() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError("API URL is not configured.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchForecast() {
      try {
        const response = await fetch(`${API_URL}/ml/forecast`);

        if (!response.ok) {
          throw new Error("Could not load forecast.");
        }

        const data: ForecastResponse = await response.json();

        if (!cancelled) {
          setForecast(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchForecast();

    return () => {
      cancelled = true;
    };
  }, []);

  const forecastItems = forecast
    ? [
        {
          name: "Predicted High",
          value: forecast.forecasts.high.predicted_price,
          change: forecast.forecasts.high.predicted_return_percent,
          color: "text-emerald-400",
        },
        {
          name: "Predicted Low",
          value: forecast.forecasts.low.predicted_price,
          change: forecast.forecasts.low.predicted_return_percent,
          color: "text-red-400",
        },
        {
          name: "Predicted Close",
          value: forecast.forecasts.close.predicted_price,
          change: forecast.forecasts.close.predicted_return_percent,
          color: "text-violet-400",
        },
      ]
    : [];

  return (
    <div
      id="forecast"
      className="rounded-2xl border border-zinc-800 bg-[#111114] p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Forecast</h3>
        <span className="rounded-lg bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
          XGBoost
        </span>
      </div>

      {loading ? (
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400">Loading forecasts...</p>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <h4 className="font-semibold text-red-300">Forecast unavailable</h4>
          <p className="mt-2 text-sm text-red-200">{error}</p>
        </div>
      ) : forecast ? (
        <>
          <div className="mt-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Next trading day · Gold</p>
              <p className="mt-1 text-xs text-zinc-500">
                Data date: {forecast.last_date}
              </p>
            </div>
            <span className="rounded-lg bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              Experimental
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs text-zinc-500">Last closing price</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatPrice(forecast.last_close)}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {forecastItems.map(item => (
              <div
                key={item.name}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <p className="text-xs text-zinc-500">{item.name}</p>

                <p className="mt-2 text-xl font-bold text-white">
                  {formatPrice(item.value)}
                </p>

                <p className={`mt-2 text-sm font-medium ${item.color}`}>
                  {item.change >= 0 ? "+" : ""}
                  {item.change.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-zinc-800/70 px-3 py-2 text-xs text-zinc-400">
            Model: {forecast.model} · Horizon: Next trading day
          </div>
        </>
      ) : null}

      <p className="mt-5 text-xs leading-5 text-zinc-500">
        {forecast?.warning ??
          "Experimental model predictions. Not financial advice."}
      </p>
    </div>
  );
}
