"use client";

import {
  SERIES,
  type ChartVisibility,
  type SeriesKey,
} from "./goldChart.types";

type Props = {
  visibility: ChartVisibility;
  onToggle: (key: SeriesKey) => void;
};

export default function GoldChartLegend({ visibility, onToggle }: Props) {
  return (
    <div className="mb-4 flex flex-wrap gap-x-5 gap-y-3">
      {SERIES.map(series => {
        const visible = visibility[series.key];

        return (
          <button
            key={series.key}
            type="button"
            onClick={() => onToggle(series.key)}
            aria-pressed={visible}
            className={`flex items-center gap-2 text-sm transition-opacity ${
              visible ? "text-zinc-200 opacity-100" : "text-zinc-500 opacity-50"
            }`}
          >
            <span
              className="h-0.5 w-5 rounded"
              style={{ backgroundColor: series.color }}
            />

            <span className={visible ? "" : "line-through"}>
              {series.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
