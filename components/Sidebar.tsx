export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-[#0c0c0f] p-6 lg:block">
      <div className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight">
          Asset<span className="text-emerald-400">Pulse</span>
        </h1>
        <p className="mt-2 text-xs text-zinc-500">
          Asset Intelligence Platform
        </p>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">
        Workspace
      </p>

      <nav className="space-y-2">
        <a
          href="#dashboard"
          className="flex items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400"
        >
          <span>◫</span> Dashboard
        </a>
        <a
          href="#forecast"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <span>⌁</span> AI Forecast
        </a>
        <a
          href="#analysis"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <span>◷</span> Market Analysis
        </a>
        <a
          href="#history"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <span>▤</span> Price History
        </a>
      </nav>

      <div className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-xs text-zinc-500">Platform status</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-zinc-300">API connected</span>
        </div>
      </div>
    </aside>
  );
}
