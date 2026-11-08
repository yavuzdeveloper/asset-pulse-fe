export default function ForecastCard() {
  return (
    <div
      id="forecast"
      className="rounded-2xl border border-zinc-800 bg-[#111114] p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Forecast</h3>
        <span className="rounded-lg bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
          ML
        </span>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-5">
        <div className="text-3xl">⌁</div>
        <h4 className="mt-4 font-semibold">Forecast module</h4>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Model predictions will appear here when the trained model is connected
          to the prediction API.
        </p>
        <div className="mt-5 rounded-lg bg-zinc-800/70 px-3 py-2 text-xs text-zinc-400">
          Prediction API not connected
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-zinc-600">
        No estimated price is displayed until a real model prediction is
        available.
      </p>
    </div>
  );
}
