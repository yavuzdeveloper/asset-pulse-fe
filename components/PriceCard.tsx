type BadgeTone = "gold" | "silver" | "neutral";

type Props = {
  label: string;
  badge?: { text: string; tone: BadgeTone };
  value: string;
  hint: string;
};

const badgeStyles: Record<BadgeTone, string> = {
  gold: "bg-amber-500/10 text-amber-400",
  silver: "bg-zinc-700/50 text-zinc-300",
  neutral: "bg-zinc-800 text-zinc-300",
};

export default function PriceCard({ label, badge, value, hint }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{label}</p>
        {badge && (
          <span
            className={`rounded-lg px-3 py-1 text-xs ${badgeStyles[badge.tone]}`}
          >
            {badge.text}
          </span>
        )}
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
