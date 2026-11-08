"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import PriceCard from "@/components/PriceCard";
import PriceChart from "@/components/PriceChart";
import ForecastCard from "@/components/ForecastCard";
import PriceHistoryTable from "@/components/PriceHistoryTable";
import { formatPrice } from "@/lib/format";
import type {
  Metal,
  MetalsResponse,
  GoldPrice,
  GoldHistoryResponse,
  SpotResponse,
} from "@/types/market";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [metals, setMetals] = useState<Metal[]>([]);
  const [goldHistory, setGoldHistory] = useState<GoldPrice[]>([]);
  const [spot, setSpot] = useState<SpotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError("NEXT_PUBLIC_API_URL is not configured");
      setLoading(false);
      return;
    }

    const fetchMarketData = async () => {
      try {
        const [metalsResponse, historyResponse] = await Promise.all([
          fetch(`${API_URL}/metals`),
          fetch(`${API_URL}/metals/gold/history`),
        ]);

        if (!metalsResponse.ok || !historyResponse.ok) {
          throw new Error("Could not load market data");
        }

        const metalsData: MetalsResponse = await metalsResponse.json();
        const historyData: GoldHistoryResponse = await historyResponse.json();

        setMetals(metalsData.metals);
        setGoldHistory(historyData.prices);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  useEffect(() => {
    if (!API_URL) return;

    let cancelled = false;

    const fetchSpot = async () => {
      try {
        const response = await fetch(`${API_URL}/metals/spot`);
        if (!response.ok) throw new Error("Live price request failed");

        const data: SpotResponse = await response.json();
        if (!cancelled) setSpot(data);
      } catch (err) {
        console.error("Spot price error:", err);
      }
    };

    fetchSpot();
    const interval = setInterval(fetchSpot, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const gold =
    spot?.gold.price ?? metals.find(metal => metal.symbol === "XAU")?.price;

  const silver =
    spot?.silver.price ?? metals.find(metal => metal.symbol === "XAG")?.price;

  const isStale =
    spot?.stale === true || (spot?.data_state?.age_seconds ?? 0) > 180;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-10">
          <DashboardHeader isStale={isStale} updatedAt={spot?.updated_at} />

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <PriceCard
              label="Gold / XAU"
              badge={{ text: "GOLD", tone: "gold" }}
              value={loading ? "Loading..." : gold ? formatPrice(gold) : "—"}
              hint="USD / Troy Ounce"
            />
            <PriceCard
              label="Silver / XAG"
              badge={{ text: "SILVER", tone: "silver" }}
              value={
                loading ? "Loading..." : silver ? formatPrice(silver) : "—"
              }
              hint="USD / Troy Ounce"
            />
            <PriceCard
              label="Historical Gold Data"
              value={goldHistory.length.toLocaleString("en-US")}
              hint="Daily price records available"
            />
          </section>

          <section className="mb-8 grid gap-6 xl:grid-cols-3">
            <PriceChart prices={goldHistory} loading={loading} />
            <ForecastCard />
          </section>

          <PriceHistoryTable prices={goldHistory} loading={loading} />

          <footer className="mt-8 flex flex-wrap justify-between gap-2 border-t border-zinc-800 pt-5 text-xs text-zinc-600">
            <span>AssetPulse · Asset Intelligence Platform</span>
            <span>Market data provided by connected API</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
