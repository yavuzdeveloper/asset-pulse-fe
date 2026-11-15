"use client";

type Props = {
  onForecastFocus: () => void;
  onShowAll: () => void;
  onReset: () => void;
};

export default function GoldChartControls({
  onForecastFocus,
  onShowAll,
  onReset,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onForecastFocus}
        className="rounded-md border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/20"
      >
        Forecast Focus
      </button>

      <button
        type="button"
        onClick={onShowAll}
        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
      >
        Show All
      </button>

      <button
        type="button"
        onClick={onReset}
        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
      >
        Reset Zoom
      </button>
    </div>
  );
}
