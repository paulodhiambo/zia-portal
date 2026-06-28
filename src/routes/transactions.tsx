import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, Search } from "lucide-react";
import * as React from "react";
import { AppShell, Pill, SectionCard, StatCard } from "@/components/app-shell";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transactions — Zia Merchant" }] }),
  component: Transactions,
});

interface TransactionItem {
  date: string;
  id: string;
  counterparty: string;
  method: string;
  amount: string;
  status: "Succeeded" | "Pending" | "Refunded" | "Disputed";
  tone: "success" | "warning" | "neutral" | "danger";
}

const INITIAL_ROWS: TransactionItem[] = [
  { date: "Oct 24 · 10:42", id: "txn_8K3JZ7", counterparty: "Sarah Jenkins", method: "Card · Visa •• 4242", amount: "+$1,250.00", status: "Succeeded", tone: "success" },
  { date: "Oct 24 · 10:31", id: "txn_8K2X1B", counterparty: "Northwind Aero", method: "ACH · Chase", amount: "+$8,400.00", status: "Succeeded", tone: "success" },
  { date: "Oct 24 · 10:18", id: "txn_8K2Q5L", counterparty: "Cooper & Hale LLC", method: "Wire · BofA", amount: "+$3,000.00", status: "Pending", tone: "warning" },
  { date: "Oct 24 · 09:51", id: "txn_8K1YA0", counterparty: "Lina Park", method: "Refund · #INV-2998", amount: "−$420.00", status: "Refunded", tone: "neutral" },
  { date: "Oct 24 · 09:22", id: "txn_8K0MQ3", counterparty: "Quanta Logistics", method: "Wire · HSBC", amount: "+$58,000.00", status: "Succeeded", tone: "success" },
  { date: "Oct 24 · 08:47", id: "txn_8K0AVV", counterparty: "Atlas Studio", method: "Card · disputed", amount: "−$219.00", status: "Disputed", tone: "danger" },
  { date: "Oct 23 · 22:10", id: "txn_8JZW1F", counterparty: "Helio Foods", method: "Card · Mastercard", amount: "+$87.45", status: "Succeeded", tone: "success" },
  { date: "Oct 23 · 20:02", id: "txn_8JZP7C", counterparty: "Marek Sobol", method: "SEPA", amount: "+€2,100.00", status: "Succeeded", tone: "success" },
  { date: "Oct 23 · 18:45", id: "txn_8JZF9D", counterparty: "Tidal Health", method: "Card", amount: "+$612.10", status: "Succeeded", tone: "success" },
  { date: "Oct 23 · 16:08", id: "txn_8JZ41A", counterparty: "Field & Forge", method: "Card", amount: "−$48.00", status: "Refunded", tone: "neutral" },
];

function Transactions() {
  const { isMockMode } = useApiMode();
  const [rows, setRows] = React.useState<TransactionItem[]>(INITIAL_ROWS);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"All" | "Succeeded" | "Pending" | "Refunded" | "Disputed">("All");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isMockMode) {
      setRows(INITIAL_ROWS);
      return;
    }

    setIsLoading(true);
    apiFetch<{ transactions: any[] }>("/transactions")
      .then((data) => {
        const mapped = data.transactions.map((t) => ({
          date: t.date,
          id: t.id,
          counterparty: t.counterparty,
          method: t.method,
          amount: t.amount,
          status: t.status,
          tone: (t.status === "Succeeded" ? "success" : t.status === "Pending" ? "warning" : t.status === "Refunded" ? "neutral" : "danger") as any,
        }));
        setRows(mapped);
      })
      .catch(() => {
        setRows(INITIAL_ROWS);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isMockMode]);

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.counterparty.toLowerCase().includes(search.toLowerCase()) ||
      r.method.toLowerCase().includes(search.toLowerCase()) ||
      r.amount.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading && !isMockMode) {
    return (
      <AppShell eyebrow="Last 24 hours" title="Transactions">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-line bg-card p-5">
              <Skeleton className="h-4 w-24 bg-ink/10" />
              <Skeleton className="mt-3 h-8 w-32 bg-ink/10" />
            </div>
          ))}
        </div>
        <SectionCard padded={false}>
          <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-9 w-full max-w-md bg-ink/10" />
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-8 w-20 bg-ink/10" />
              ))}
            </div>
          </div>
          <div className="space-y-4 p-5">
            {[1, 2, 3, 4, 5].map((k) => (
              <div key={k} className="flex justify-between items-center py-2">
                <Skeleton className="h-4 w-28 bg-ink/10" />
                <Skeleton className="h-4 w-16 bg-ink/10" />
                <Skeleton className="h-4 w-32 bg-ink/10" />
                <Skeleton className="h-4 w-24 bg-ink/10" />
                <Skeleton className="h-4 w-12 bg-ink/10" />
                <Skeleton className="h-6 w-20 bg-ink/10" />
              </div>
            ))}
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Last 24 hours"
      title="Transactions"
      actions={
        <>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Gross volume" value="$74,810.55" delta="▲ 8.1%" hint="vs prior 24h" tone="up" />
        <StatCard label="Succeeded" value="912" />
        <StatCard label="Pending" value="14" />
        <StatCard label="Disputed" value="3" delta="▲ 1" hint="last hour" tone="down" />
      </div>

      <SectionCard padded={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-line bg-surface-2 px-3 text-sm text-ink-3 focus-within:border-ink/40">
            <Search className="h-4 w-4" />
            <input
              className="h-full w-full border-none bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-0"
              placeholder="Search by id, counterparty, or amount"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(["All", "Succeeded", "Pending", "Refunded", "Disputed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setStatusFilter(t)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === t
                    ? "border-ink bg-ink text-primary-foreground"
                    : "border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Counterparty</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-ink-3 font-medium">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-2/60">
                    <td className="px-5 py-3.5 text-ink-2 tabular">{r.date}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-3">{r.id}</td>
                    <td className="px-5 py-3.5 font-medium text-ink">{r.counterparty}</td>
                    <td className="px-5 py-3.5 text-ink-2">{r.method}</td>
                    <td className={`px-5 py-3.5 text-right font-mono ${String(r.amount).startsWith("−") ? "text-destructive" : "text-ink"}`}>
                      {r.amount}
                    </td>
                    <td className="px-5 py-3.5">
                      <Pill tone={r.tone}>{r.status}</Pill>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-ink-3">
          <span>Showing {filteredRows.length} of {rows.length}</span>
          <div className="flex gap-1">
            <button className="rounded-md border border-line bg-surface px-2.5 py-1 hover:bg-surface-2 cursor-pointer">←</button>
            <button className="rounded-md border border-line bg-surface px-2.5 py-1 hover:bg-surface-2 cursor-pointer">→</button>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
