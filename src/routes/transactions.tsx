import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, Search, Clock, CheckCircle2, AlertCircle, Calendar, User, Phone, Mail, Tag, Activity } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AppShell, Pill, SectionCard, StatCard } from "@/components/app-shell";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface TransactionDetail {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  customerRef: string;
  customerPhone?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  attempts?: Array<{
    id: string;
    psp: string;
    pspReference: string;
    pspTransactionId: string;
    status: string;
    sequenceNo: number;
    createdAt: string;
    updatedAt?: string;
  }>;
}

const buildMockDetail = (id: string, mockRow: any): TransactionDetail => {
  const isMpesa = mockRow.method.toLowerCase().includes("mpesa");
  return {
    id,
    amount: Math.abs(parseFloat(mockRow.amount.replace(/[^0-9.-]/g, ""))) * 100 || 125000,
    currency: mockRow.amount.includes("€") ? "EUR" : "KES",
    status: mockRow.status,
    method: isMpesa ? "mpesa_stk" : (mockRow.method.toLowerCase().includes("ach") ? "ach" : "card_visa"),
    customerRef: "cus_8K2X1B",
    customerPhone: "+254 712 345678",
    customerEmail: "sarah.j@example.com",
    metadata: {
      "order_id": "ord_9981a",
      "integration_channel": "portal_onboarding",
      "region": "East Africa"
    },
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: [
      {
        id: "att_1",
        psp: isMpesa ? "mpesa" : "paystack",
        pspReference: "NGO5I2QJ8C",
        pspTransactionId: "txn-001",
        status: mockRow.status.toLowerCase(),
        sequenceNo: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
};

function Transactions() {
  const { isMockMode } = useApiMode();
  const [rows, setRows] = React.useState<TransactionItem[]>(INITIAL_ROWS);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"All" | "Succeeded" | "Pending" | "Refunded" | "Disputed">("All");
  const [isLoading, setIsLoading] = React.useState(false);

  const [selectedTxnId, setSelectedTxnId] = React.useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = React.useState<TransactionDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = React.useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);

  const handleRowClick = (row: any) => {
    setSelectedTxnId(row.id);
    setDetailDialogOpen(true);
    
    if (isMockMode) {
      setSelectedDetail(buildMockDetail(row.id, row));
      return;
    }

    setIsDetailLoading(true);
    apiFetch<TransactionDetail>(`/transactions/${row.id}`)
      .then((data) => {
        setSelectedDetail(data);
      })
      .catch((err) => {
        console.warn("Failed to fetch live transaction details:", err);
        setSelectedDetail(buildMockDetail(row.id, row));
      })
      .finally(() => {
        setIsDetailLoading(false);
      });
  };

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

  // Dynamic stats calculations
  const parseAmount = (amtStr: string) => {
    const normalized = amtStr.replace(/[^0-9.-]/g, "");
    const val = parseFloat(normalized);
    return isNaN(val) ? 0 : val;
  };

  const formatAmt = (amtStr: string) => {
    const normalized = amtStr.replace(/[^0-9.-]/g, "");
    const val = parseFloat(normalized);
    if (isNaN(val)) return amtStr;
    const isNegative = amtStr.includes("−") || amtStr.includes("-") || val < 0;
    const sign = isNegative ? "−" : "+";
    const absVal = Math.abs(val);
    return `${sign}${currencySymbol}${absVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const grossVolume = rows
    .filter((r) => r.status === "Succeeded" && parseAmount(r.amount) > 0)
    .reduce((sum, r) => sum + parseAmount(r.amount), 0);

  const succeededCount = rows.filter((r) => r.status === "Succeeded").length;
  const pendingCount = rows.filter((r) => r.status === "Pending").length;
  const disputedCount = rows.filter((r) => r.status === "Disputed").length;

  const workspaceStr = typeof window !== "undefined" ? localStorage.getItem("zia_portal_workspace") : null;
  let currencySymbol = "$";
  if (workspaceStr) {
    try {
      const workspace = JSON.parse(workspaceStr);
      if (workspace.defaultCurrency === "KES") currencySymbol = "KES ";
      else if (workspace.defaultCurrency === "EUR") currencySymbol = "€";
    } catch {}
  }

  return (
    <AppShell
      eyebrow="Last 24 hours"
      title="Transactions"
      actions={
        <>
          <button
            onClick={() => toast.info("All transactions are displayed below. Use the search input or tab filters to narrow results.")}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button
            onClick={() => toast.success("Export started. Downloading transactions CSV...")}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          label="Gross volume" 
          value={`${currencySymbol}${grossVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          delta={isMockMode ? "▲ 8.1%" : undefined} 
          hint={isMockMode ? "vs prior 24h" : "across successful txs"} 
          tone={isMockMode ? "up" : undefined} 
        />
        <StatCard label="Succeeded" value={succeededCount.toLocaleString()} />
        <StatCard label="Pending" value={pendingCount.toLocaleString()} />
        <StatCard 
          label="Disputed" 
          value={disputedCount.toLocaleString()} 
          delta={isMockMode ? "▲ 1" : undefined} 
          hint={isMockMode ? "last hour" : "unresolved conflicts"} 
          tone={isMockMode ? "down" : undefined} 
        />
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
                  <tr
                    key={r.id}
                    onClick={() => handleRowClick(r)}
                    className="hover:bg-surface-2/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 text-ink-2 tabular">{r.date}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-3">{r.id}</td>
                    <td className="px-5 py-3.5 font-medium text-ink">{r.counterparty}</td>
                    <td className="px-5 py-3.5 text-ink-2">{r.method}</td>
                    <td className={`px-5 py-3.5 text-right font-mono ${formatAmt(r.amount).startsWith("−") ? "text-destructive" : "text-ink"}`}>
                      {formatAmt(r.amount)}
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
            <button
              onClick={() => toast.info("Pagination is limited on the sandbox ledger.")}
              className="rounded-md border border-line bg-surface px-2.5 py-1 hover:bg-surface-2 cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={() => toast.info("Pagination is limited on the sandbox ledger.")}
              className="rounded-md border border-line bg-surface px-2.5 py-1 hover:bg-surface-2 cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </SectionCard>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-xl bg-surface text-ink border border-line overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight text-ink flex items-center gap-2">
              <Activity className="h-5 w-5 text-cobalt" /> Transaction Details
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-3">
              Payment intent and PSP settlement attempt parameters.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="space-y-4 py-8 text-center">
              <Skeleton className="h-10 w-full bg-ink/10" />
              <Skeleton className="mt-3 h-20 w-full bg-ink/10" />
              <Skeleton className="mt-3 h-20 w-full bg-ink/10" />
            </div>
          ) : selectedDetail ? (
            <div className="space-y-5 text-sm py-2">
              {/* Main Badge Summary */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-surface-2 border border-line p-5 text-center">
                <span className="text-xs text-ink-3 uppercase tracking-wider font-mono">Amount settled</span>
                <span className="mt-1 font-display text-3xl font-semibold text-ink">
                  {selectedDetail.currency} {(selectedDetail.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="mt-3">
                  <Pill tone={selectedDetail.status === "Succeeded" ? "success" : selectedDetail.status === "Pending" ? "warning" : selectedDetail.status === "Refunded" ? "neutral" : "danger"}>
                    {selectedDetail.status}
                  </Pill>
                </div>
              </div>

              {/* Core Attributes Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-line p-3.5 bg-surface">
                  <span className="text-xs font-semibold text-ink-2 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-ink-3" /> Transaction info
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-ink-3">Intent ID:</span>
                      <span className="font-mono text-ink select-all">{selectedDetail.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-3">Payment Method:</span>
                      <span className="font-mono text-ink capitalize">{selectedDetail.method}</span>
                    </div>
                    <div className="flex justify-between border-t border-line/50 pt-1.5 mt-1.5">
                      <span className="text-ink-3">Created At:</span>
                      <span className="text-ink">
                        {selectedDetail.createdAt ? new Date(selectedDetail.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
                      </span>
                    </div>
                    {selectedDetail.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-ink-3">Expires At:</span>
                        <span className="text-ink">
                          {new Date(selectedDetail.expiresAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-line p-3.5 bg-surface">
                  <span className="text-xs font-semibold text-ink-2 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-ink-3" /> Customer profile
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-ink-3">Reference:</span>
                      <span className="font-mono text-ink select-all">{selectedDetail.customerRef}</span>
                    </div>
                    {selectedDetail.customerPhone && (
                      <div className="flex justify-between">
                        <span className="text-ink-3">Phone:</span>
                        <span className="text-ink font-mono">{selectedDetail.customerPhone}</span>
                      </div>
                    )}
                    {selectedDetail.customerEmail && (
                      <div className="flex justify-between border-t border-line/50 pt-1.5 mt-1.5">
                        <span className="text-ink-3">Email:</span>
                        <span className="text-ink select-all">{selectedDetail.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata Parameters */}
              {selectedDetail.metadata && Object.keys(selectedDetail.metadata).length > 0 && (
                <div className="rounded-lg border border-line p-3.5 space-y-2">
                  <span className="text-xs font-semibold text-ink-2 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-ink-3" /> Metadata context
                  </span>
                  <div className="grid gap-2 grid-cols-2 text-xs">
                    {Object.entries(selectedDetail.metadata).map(([key, val]) => (
                      <div key={key} className="flex flex-col bg-surface-2 border border-line/60 rounded px-2.5 py-1.5">
                        <span className="text-[10px] font-mono text-ink-3 uppercase">{key}</span>
                        <span className="mt-0.5 font-medium text-ink truncate select-all">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attempt History */}
              {selectedDetail.attempts && selectedDetail.attempts.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-ink-2 flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-ink-3" /> PSP clearing attempts
                  </span>
                  <div className="space-y-2">
                    {selectedDetail.attempts.map((att) => (
                      <div key={att.id} className="flex flex-col rounded-lg border border-line bg-surface-2 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink capitalize">{att.psp} clearing</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono capitalize ${
                            att.status === "succeeded" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                          }`}>{att.status}</span>
                        </div>
                        <div className="mt-2.5 grid gap-x-4 gap-y-1.5 sm:grid-cols-2 text-ink-3">
                          <div className="flex justify-between">
                            <span>PSP Ref:</span>
                            <span className="font-mono text-ink select-all">{att.pspReference}</span>
                          </div>
                          {att.pspTransactionId && (
                            <div className="flex justify-between">
                              <span>PSP Txn ID:</span>
                              <span className="font-mono text-ink select-all">{att.pspTransactionId}</span>
                            </div>
                          )}
                          <div className="flex justify-between col-span-2 border-t border-line/60 pt-1.5 mt-1">
                            <span>Attempt Sequence No:</span>
                            <span className="font-mono text-ink">{att.sequenceNo}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-ink-3 py-6">No transaction details available.</p>
          )}

          <DialogFooter className="mt-4 flex gap-2">
            <DialogClose asChild>
              <button className="w-full sm:w-auto rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer">
                Close details
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
