"use client";

type TooltipValue = {
  series: string;
  price: number | null;
  color: string;
};

type GoldChartTooltipProps = {
  visible: boolean;
  date: string;
  values: TooltipValue[];
  x: number;
  y: number;
};

export default function GoldChartTooltip({
  visible,
  date,
  values,
  x,
  y,
}: GoldChartTooltipProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute z-20 min-w-56 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 shadow-xl"
      style={{
        left: x + 12,
        top: y + 12,
      }}
    >
      <p className="mb-2 border-b border-zinc-800 pb-2 text-xs text-zinc-400">
        {date}
      </p>

      <div className="space-y-2">
        {(values ?? []).map(item => (
          <div
            key={item.series}
            className="flex items-center justify-between gap-5"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-zinc-300">{item.series}</span>
            </div>

            <span className="text-sm font-medium tabular-nums text-white">
              {item.price === null
                ? "—"
                : `$${item.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
