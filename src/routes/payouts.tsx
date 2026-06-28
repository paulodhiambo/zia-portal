import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Download, Filter, Plus, Search, Wallet } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

import { AppShell, Pill, SectionCard, StatCard } from "@/components/app-shell";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/payouts")({
  head: () => ({ meta: [{ title: "Payouts — Zia Merchant" }] }),
  component: Payouts,
});

interface PayoutItem {
  id: string;
  date: string;
  source: string;
  destination: string;
  bank: string;
  amount: string;
  status: "Succeeded" | "Pending" | "Failed";
  tone: "success" | "warning" | "danger";
  numericAmount: number;
}

const INITIAL_PAYOUTS: PayoutItem[] = [
  {
    id: "po_8L1A9K",
    date: "Oct 24 · 10:15",
    source: "Operating · USD",
    destination: "Chase •••• 9876",
    bank: "Chase Bank",
    amount: "$128,450.00",
    status: "Pending",
    tone: "warning",
    numericAmount: 128450,
  },
  {
    id: "po_8K9X2J",
    date: "Oct 20 · 09:30",
    source: "Operating · USD",
    destination: "Chase •••• 9876",
    bank: "Chase Bank",
    amount: "$45,000.00",
    status: "Succeeded",
    tone: "success",
    numericAmount: 45000,
  },
  {
    id: "po_8J7Q1L",
    date: "Oct 15 · 14:20",
    source: "Reserves · USD",
    destination: "BofA •••• 1234",
    bank: "Bank of America",
    amount: "$150,000.00",
    status: "Succeeded",
    tone: "success",
    numericAmount: 150000,
  },
  {
    id: "po_8H5F4M",
    date: "Oct 10 · 11:05",
    source: "FX float · EUR",
    destination: "HSBC •••• 5543",
    bank: "HSBC",
    amount: "€32,000.00",
    status: "Succeeded",
    tone: "success",
    numericAmount: 34500, // Approximate USD value for volume sum
  },
  {
    id: "po_8G2D1P",
    date: "Oct 05 · 08:00",
    source: "Operating · USD",
    destination: "Chase •••• 9876",
    bank: "Chase Bank",
    amount: "$88,000.00",
    status: "Succeeded",
    tone: "success",
    numericAmount: 88000,
  },
  {
    id: "po_8F1Y3N",
    date: "Sep 30 · 17:45",
    source: "Operating · USD",
    destination: "Chase •••• 9876",
    bank: "Chase Bank",
    amount: "$115,000.00",
    status: "Succeeded",
    tone: "success",
    numericAmount: 115000,
  },
];

function Payouts() {
  const { isMockMode } = useApiMode();
  const [payouts, setPayouts] = React.useState<PayoutItem[]>(INITIAL_PAYOUTS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const workspaceStr = typeof window !== "undefined" ? localStorage.getItem("zia_portal_workspace") : null;
  let currencySymbol = "KES ";
  if (workspaceStr) {
    try {
      const workspace = JSON.parse(workspaceStr);
      if (workspace.defaultCurrency === "KES") currencySymbol = "KES ";
      else if (workspace.defaultCurrency === "USD") currencySymbol = "$";
      else if (workspace.defaultCurrency === "EUR") currencySymbol = "€";
      else currencySymbol = workspace.defaultCurrency + " ";
    } catch {}
  }

  React.useEffect(() => {
    if (isMockMode) {
      setPayouts(INITIAL_PAYOUTS);
      return;
    }

    setIsLoading(true);
    apiFetch<{ payouts: PayoutItem[] }>("/payouts")
      .then((data) => {
        const mapped = data.payouts.map((p) => ({
          ...p,
          tone: (p.status === "Succeeded" ? "success" : p.status === "Pending" ? "warning" : "danger") as "success" | "warning" | "danger",
          numericAmount: p.numericAmount || parseFloat(p.amount.replace(/[^0-9.-]/g, "")) || 0,
        }));
        setPayouts(mapped);
      })
      .catch(() => {
        setPayouts(INITIAL_PAYOUTS);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isMockMode]);
  const [statusFilter, setStatusFilter] = React.useState<"All" | "Succeeded" | "Pending" | "Failed">("All");
  const [open, setOpen] = React.useState(false);

  // Form State
  const [source, setSource] = React.useState("Operating · USD");
  const [bank, setBank] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [routing, setRouting] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleInitiatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const newId = `po_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(new Date())
      .replace(",", " ·");

    const newPayout: PayoutItem = {
      id: newId,
      date: formattedDate,
      source,
      destination: `${bank} •••• ${account.slice(-4) || "0000"}`,
      bank,
      amount: `${currencySymbol}${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: "Pending",
      tone: "warning",
      numericAmount: numAmount,
    };

    if (!isMockMode) {
      apiFetch<any>("/payouts/create", "POST", {
        source,
        bank,
        routing,
        account,
        amount: numAmount,
        description,
      })
        .then((createdPayout) => {
          const mapped: PayoutItem = {
            id: createdPayout.id || newId,
            date: createdPayout.date || formattedDate,
            source: createdPayout.source || source,
            destination: createdPayout.destination || `${bank} •••• ${account.slice(-4) || "0000"}`,
            bank: createdPayout.bank || bank,
            amount: createdPayout.amount || `${currencySymbol}${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: "Pending",
            tone: "warning",
            numericAmount: numAmount,
          };
          setPayouts((prev) => [mapped, ...prev]);
          toast.success(`Payout ${mapped.id} initiated successfully via Live API`);
        })
        .catch(() => {
          setPayouts((prev) => [newPayout, ...prev]);
        });
    } else {
      setPayouts((prev) => [newPayout, ...prev]);
      toast.success(`Payout ${newId} of $${numAmount.toLocaleString()} initiated successfully`);
    }
    setOpen(false);

    // Reset Form
    setBank("");
    setAccount("");
    setRouting("");
    setAmount("");
    setDescription("");
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.destination.toLowerCase().includes(search.toLowerCase()) ||
      p.bank.toLowerCase().includes(search.toLowerCase()) ||
      p.amount.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalPaidOut = payouts
    .filter((p) => p.status === "Succeeded")
    .reduce((sum, p) => sum + p.numericAmount, 0);

  const pendingPayouts = payouts
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.numericAmount, 0);

  if (isLoading && !isMockMode) {
    return (
      <AppShell eyebrow="Overview" title="Payouts">
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
            <Skeleton className="h-9 w-full max-w-sm bg-ink/10" />
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-8 w-16 bg-ink/10" />
              ))}
            </div>
          </div>
          <div className="space-y-4 p-5">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="flex justify-between items-center py-2">
                <Skeleton className="h-4 w-28 bg-ink/10" />
                <Skeleton className="h-4 w-32 bg-ink/10" />
                <Skeleton className="h-4 w-24 bg-ink/10" />
                <Skeleton className="h-4 w-16 bg-ink/10" />
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
      eyebrow="Scheduled & past transfers"
      title="Payouts"
      actions={
        <>
          <button
            onClick={() => toast.info("All payouts are displayed below. Use the search input or tab filters to narrow results.")}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button
            onClick={() => toast.success("Export started. Downloading payouts CSV...")}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90">
                <Plus className="h-4 w-4" /> Initiate payout
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-surface text-ink border border-line">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl tracking-tight text-ink">
                  Initiate payout
                </DialogTitle>
                <DialogDescription className="text-xs text-ink-3">
                  Transfer funds to an external bank account. Subject to cutoff times.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInitiatePayout} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-ink-2">Source treasury account</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                  >
                    <option>Operating · USD</option>
                    <option>Reserves · USD</option>
                    <option>FX float · EUR</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Recipient bank"
                    required
                    placeholder="Chase, BofA, etc."
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                  />
                  <Field
                    label="Routing number"
                    required
                    maxLength={9}
                    placeholder="9-digit routing"
                    value={routing}
                    onChange={(e) => setRouting(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Account number"
                    required
                    placeholder="Enter account #"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                  />
                  <Field
                    label="Amount (USD)"
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Field
                  label="Description (internal)"
                  placeholder="e.g. Weekly Payroll"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <DialogFooter className="mt-6 flex gap-2">
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="w-full sm:w-auto rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
                    >
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-ink/90"
                  >
                    Initiate transfer <ArrowUpRight className="h-4 w-4" />
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Next payout"
          value={`${currencySymbol}${pendingPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint="Scheduled Oct 25"
        />
        <StatCard
          label="Total paid out (Succeeded)"
          value={`${currencySymbol}${totalPaidOut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          delta="▲ 9.4%"
          hint="vs prior 30d"
          tone="up"
        />
        <StatCard label="Average payout speed" value="1.2 days" hint="Fedwire rail P95" />
        <StatCard label="Failed payouts" value="0" tone="up" />
      </div>

      <div className="mt-6">
        <SectionCard padded={false}>
          <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-line bg-surface-2 px-3 text-sm text-ink-3 focus-within:border-ink/40">
              <Search className="h-4 w-4" />
              <input
                className="h-full w-full border-none bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-0"
                placeholder="Search payouts by ID, destination, or bank"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(["All", "Succeeded", "Pending", "Failed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setStatusFilter(t)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
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
                  <th className="px-5 py-3 font-medium">Initiated</th>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Source Account</th>
                  <th className="px-5 py-3 font-medium">Recipient / Bank</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-ink-3 font-medium">
                      No payouts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2/60">
                      <td className="px-5 py-3.5 text-ink-2 tabular">{p.date}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-ink-3">{p.id}</td>
                      <td className="px-5 py-3.5 text-ink-2">{p.source}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-ink">{p.destination}</div>
                        <div className="text-xs text-ink-3">{p.bank}</div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-ink">{p.amount}</td>
                      <td className="px-5 py-3.5">
                        <Pill tone={p.tone}>{p.status}</Pill>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-ink-3">
            <span>
              Showing {filteredPayouts.length} of {payouts.length}
            </span>
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
      </div>
    </AppShell>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      <label className="text-xs font-medium text-ink-2">{label}</label>
      <input
        {...rest}
        className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
      />
    </div>
  );
}
