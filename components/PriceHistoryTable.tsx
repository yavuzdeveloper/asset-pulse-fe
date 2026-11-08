"use client";

import { useMemo, useState } from "react";
import { formatDate, formatPrice } from "@/lib/format";
import type { GoldPrice } from "@/types/market";

type Props = {
  prices: GoldPrice[];
  loading: boolean;
};

const PAGE_SIZE = 10;

export default function PriceHistoryTable({ prices, loading }: Props) {
  const [searchDate, setSearchDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHistory = useMemo(() => {
    const filtered = prices.filter(item =>
      searchDate ? item.date.includes(searchDate) : true,
    );

    return sortOrder === "newest" ? [...filtered].reverse() : filtered;
  }, [prices, searchDate, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section
      id="history"
      className="rounded-2xl border border-zinc-800 bg-[#111114] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Price History</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Historical gold market data
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={searchDate}
            onChange={event => {
              setSearchDate(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          />

          <select
            value={sortOrder}
            onChange={event => {
              setSortOrder(event.target.value as "newest" | "oldest");
              setCurrentPage(1);
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Close</th>
              <th className="px-4 py-3 text-right">High</th>
              <th className="px-4 py-3 text-right">Low</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistory.map(item => (
              <tr
                key={item.date}
                className="border-b border-zinc-800/70 transition hover:bg-zinc-900/70"
              >
                <td className="px-4 py-4 text-zinc-300">
                  {formatDate(item.date)}
                </td>
                <td className="px-4 py-4 text-right font-medium text-white">
                  {formatPrice(item.close)}
                </td>
                <td className="px-4 py-4 text-right text-emerald-400">
                  {formatPrice(item.high)}
                </td>
                <td className="px-4 py-4 text-right text-red-400">
                  {formatPrice(item.low)}
                </td>
              </tr>
            ))}

            {!loading && paginatedHistory.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  No historical records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
        <span>
          {filteredHistory.length} records · Page {currentPage} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-zinc-700 px-4 py-2 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage(page => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border border-zinc-700 px-4 py-2 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
