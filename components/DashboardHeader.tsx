import { formatUpdatedAt } from "@/lib/format";

type Props = {
  isStale: boolean;
  updatedAt?: string | null;
};

export default function DashboardHeader({ isStale, updatedAt }: Props) {
  return (
    <header
      id="dashboard"
      className="mb-8 flex flex-wrap items-center justify-between gap-4"
    >
      <div>
        <p className="text-sm text-zinc-500">Overview / Dashboard</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Market Overview
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Monitor precious metals and AI-powered market intelligence.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isStale ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <span className="text-sm text-zinc-300">
            {isStale ? "Data may be delayed" : "Market data"}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Updated: {formatUpdatedAt(updatedAt)}
        </p>
      </div>
    </header>
  );
}
