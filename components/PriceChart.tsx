"use client";

import { useMemo } from "react";
import { formatDate, formatPrice } from "@/lib/format";
import type { GoldPrice } from "@/types/market";

type Props = {
  prices: GoldPrice[];
  loading: boolean;
};

export default function PriceChart({ prices, loading }: Props) {
  const chartData = useMemo(() => prices.slice(-90), [prices]);

  const chartPoints = useMemo(() => {
    if (!chartData.length) return "";

    const values = chartData.map(item => item.close);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * 1000;
        const y = 250 - ((value - min) / range) * 220;
        return `${x},${y}`;
      })
      .join(" ");
  }, [chartData]);

  const latestHistory = prices[prices.length - 1];

  return (
    <div
      id="analysis"
      className="rounded-2xl border border-zinc-800 bg-[#111114] p-6 xl:col-span-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Gold Price Performance</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Historical daily closing prices · Last 90 records
          </p>
        </div>
        <span className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400">
          XAU / USD
        </span>
      </div>

      <div className="mt-6">
        {chartData.length > 1 ? (
          <svg
            viewBox="0 0 1000 280"
            className="h-64 w-full overflow-visible"
            preserveAspectRatio="none"
          >
            {[50, 110, 170, 230].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="1000"
                y2={y}
                stroke="#27272a"
                strokeDasharray="5 7"
              />
            ))}
            <polyline
              points={chartPoints}
              fill="none"
              stroke="#34d399"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
            {loading
              ? "Loading historical data..."
              : "Historical chart data unavailable"}
          </div>
        )}
      </div>

      {latestHistory && (
        <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
          <span>Latest historical close</span>
          <span className="font-semibold text-white">
            {formatPrice(latestHistory.close)}
          </span>
          <span>{formatDate(latestHistory.date)}</span>
        </div>
      )}
    </div>
  );
}
