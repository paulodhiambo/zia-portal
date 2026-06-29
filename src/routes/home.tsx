import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Download, FileText, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { AppShell, Pill, SectionCard, StatCard } from "@/components/app-shell";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Overview — Zia Merchant" }] }),
  component: Home,
});

const SERIES = [
  { d: "Mon", v: 28400, p: 24100 },
  { d: "Tue", v: 31200, p: 27300 },
  { d: "Wed", v: 35800, p: 28900 },
  { d: "Thu", v: 32100, p: 30100 },
  { d: "Fri", v: 41250, p: 31800 },
  { d: "Sat", v: 38900, p: 30500 },
  { d: "Sun", v: 42500, p: 29200 },
];

const INITIAL_TXNS = [
  { id: "txn_8K3J", time: "10:42", who: "Sarah Jenkins", desc: "Invoice #INV-3041", amt: "+$1,250.00", status: "Succeeded", tone: "success" as const },
  { id: "txn_8K2X", time: "10:31", who: "Northwind Aero", desc: "Subscription · Enterprise", amt: "+$8,400.00", status: "Succeeded", tone: "success" as const },
  { id: "txn_8K2Q", time: "10:18", who: "Cooper & Hale LLC", desc: "Retainer", amt: "+$3,000.00", status: "Pending", tone: "warning" as const },
  { id: "txn_8K1Y", time: "09:51", who: "Lina Park", desc: "Refund · #INV-2998", amt: "−$420.00", status: "Refunded", tone: "neutral" as const },
  { id: "txn_8K0M", time: "09:22", who: "Quanta Logistics", desc: "Wire in", amt: "+$58,000.00", status: "Succeeded", tone: "success" as const },
];

function Home() {
  const { isMockMode } = useApiMode();

  const workspaceStr = typeof window !== "undefined" ? localStorage.getItem("zia_portal_workspace") : null;
  let currencySymbol = "KES ";
  let defaultCurrency = "KES";
  if (workspaceStr) {
    try {
      const workspace = JSON.parse(workspaceStr);
      if (workspace.defaultCurrency) {
        defaultCurrency = workspace.defaultCurrency;
        if (workspace.defaultCurrency === "KES") currencySymbol = "KES ";
        else if (workspace.defaultCurrency === "USD") currencySymbol = "$";
        else if (workspace.defaultCurrency === "EUR") currencySymbol = "€";
        else currencySymbol = workspace.defaultCurrency + " ";
      }
    } catch {}
  }

  // Metrics states
  const [userName, setUserName] = React.useState("Acme Corp");
  const [treasuryBalance, setTreasuryBalance] = React.useState(2481302.18);
  const [todayVolume, setTodayVolume] = React.useState(42500.00);
  const [successfulPayments, setSuccessfulPayments] = React.useState(1248);
  const [pendingPayouts, setPendingPayouts] = React.useState(128450.00);
  const [checklist, setChecklist] = React.useState([
    { d: "Verify business entity", t: "Done", ok: true },
    { d: "Invite finance team", t: "2 of 4", ok: true },
    { d: "Activate live API keys", t: "Pending", ok: false },
  ]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [recentTxns, setRecentTxns] = React.useState<any[]>(INITIAL_TXNS);
  const [chartPeriod, setChartPeriod] = React.useState<"7d" | "30d" | "12m">("7d");
  const [chartData, setChartData] = React.useState<any[]>(SERIES);

  const formatAmt = (amtStr: string) => {
    const normalized = amtStr.replace(/[^0-9.-]/g, "");
    const val = parseFloat(normalized);
    if (isNaN(val)) return amtStr;
    const isNegative = amtStr.startsWith("−") || amtStr.startsWith("-") || val < 0;
    const sign = isNegative ? "−" : "+";
    const absVal = Math.abs(val);
    return `${sign}${currencySymbol}${absVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fetchChartData = React.useCallback((period: "7d" | "30d" | "12m") => {
    if (isMockMode) {
      if (period === "7d") {
        setChartData(SERIES);
      } else if (period === "30d") {
        const data30 = Array.from({ length: 30 }).map((_, idx) => ({
          d: `Day ${idx + 1}`,
          v: 30000 + Math.random() * 20000,
          p: 28000 + Math.random() * 15000,
        }));
        setChartData(data30);
      } else {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const data12 = months.map((m) => ({
          d: m,
          v: 80000 + Math.random() * 50000,
          p: 75000 + Math.random() * 40000,
        }));
        setChartData(data12);
      }
      return;
    }

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 365;
    apiFetch<any>(`/dashboard/volume?days=${days}`)
      .then((data) => {
        const daily = data?.daily || [];
        const mapped = daily.map((item: any) => {
          let label = item.date;
          try {
            const dateObj = new Date(item.date);
            if (period === "7d") {
              label = dateObj.toLocaleDateString(undefined, { weekday: "short" });
            } else if (period === "30d") {
              label = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            } else {
              label = dateObj.toLocaleDateString(undefined, { month: "short" });
            }
          } catch {}

          return {
            d: label,
            v: item.volume || 0,
            p: (item.volume || 0) * 0.85,
          };
        });
        setChartData(mapped);
      })
      .catch((err) => {
        console.warn("Failed to fetch live dashboard volume chart:", err);
      });
  }, [isMockMode]);

  const fetchRecentTransactions = React.useCallback(() => {
    if (isMockMode) {
      setRecentTxns(INITIAL_TXNS);
      return Promise.resolve();
    }
    return apiFetch<{ transactions: any[] }>("/transactions")
      .then((data) => {
        const list = data?.transactions || [];
        const mapped = list.map((t: any) => ({
          id: t.id,
          time: t.date || "Just now",
          who: t.counterparty || "Payment Received",
          desc: t.method || "Direct Rails",
          amt: t.amount,
          status: t.status || "Succeeded",
          tone: (t.status === "Succeeded" ? "success" : t.status === "Pending" ? "warning" : t.status === "Refunded" ? "neutral" : "danger") as any,
        }));
        setRecentTxns(mapped);
      })
      .catch((err) => {
        console.warn("Failed to fetch recent transactions:", err);
        setRecentTxns(INITIAL_TXNS);
      });
  }, [isMockMode]);

  React.useEffect(() => {
    if (isMockMode) {
      setUserName("Acme Corp");
      setTreasuryBalance(2481302.18);
      setTodayVolume(42500.00);
      setSuccessfulPayments(1248);
      setPendingPayouts(128450.00);
      setRecentTxns(INITIAL_TXNS);
      setChecklist([
        { d: "Verify business entity", t: "Done", ok: true },
        { d: "Invite finance team", t: "2 of 4", ok: true },
        { d: "Activate live API keys", t: "Pending", ok: false },
      ]);
      fetchChartData(chartPeriod);
      return;
    }

    setIsLoading(true);
    
    Promise.all([
      apiFetch<any>("/profile")
        .then((profileData) => {
          setUserName(profileData?.user?.name || "Acme Corp");
        })
        .catch((err) => {
          console.warn("Failed to fetch user profile name:", err);
          setUserName("Acme Corp");
        }),
      fetchRecentTransactions(),
      new Promise<void>((resolve) => {
        try {
          fetchChartData(chartPeriod);
        } catch {}
        resolve();
      }),
      apiFetch<any>("/dashboard/overview")
        .then((data) => {
          setTreasuryBalance(data.treasuryBalance !== undefined ? data.treasuryBalance : 2481302.18);
          setTodayVolume(data.todayVolume !== undefined ? data.todayVolume : 42500.00);
          setSuccessfulPayments(data.successfulPayments !== undefined ? data.successfulPayments : 1248);
          setPendingPayouts(data.pendingPayouts !== undefined ? data.pendingPayouts : 128450.00);
          if (data.checklist) {
            setChecklist(data.checklist.map((item: any) => ({
              d: item.task,
              t: item.status,
              ok: item.completed,
            })));
          }
        })
        .catch(() => {
          // Safe fallback values
          setTreasuryBalance(2481302.18);
          setTodayVolume(42500.00);
          setSuccessfulPayments(1248);
          setPendingPayouts(128450.00);
        })
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [isMockMode, fetchRecentTransactions, fetchChartData, chartPeriod]);

  if (isLoading && !isMockMode) {
    return (
      <AppShell
        eyebrow="Loading..."
        title="Loading dashboard overview..."
      >
        {/* StatCards shimmer */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-line bg-card p-5">
              <Skeleton className="h-4 w-24 bg-ink/10" />
              <Skeleton className="mt-3 h-8 w-36 bg-ink/10" />
              <Skeleton className="mt-2 h-4 w-16 bg-ink/10" />
            </div>
          ))}
        </div>

        {/* Charts & Treasury shimmer */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-line bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-5 w-40 bg-ink/10" />
                  <Skeleton className="mt-1 h-3 w-56 bg-ink/10" />
                </div>
                <Skeleton className="h-6 w-16 bg-ink/10" />
              </div>
              <Skeleton className="mt-6 h-[260px] w-full bg-ink/10" />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-5">
            <Skeleton className="h-5 w-32 bg-ink/10" />
            <Skeleton className="mt-1.5 h-3.5 w-48 bg-ink/10" />
            <Skeleton className="mt-6 h-10 w-44 bg-ink/10" />
            <Skeleton className="mt-2 h-4 w-24 bg-ink/10" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center py-1">
                  <Skeleton className="h-4 w-28 bg-ink/10" />
                  <Skeleton className="h-4 w-24 bg-ink/10" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions & Checklist shimmer */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-line bg-card">
              <div className="p-5">
                <Skeleton className="h-5 w-36 bg-ink/10" />
              </div>
              <div className="space-y-4 p-5 pt-0">
                {[1, 2, 3, 4, 5].map((k) => (
                  <div key={k} className="flex justify-between items-center py-2">
                    <Skeleton className="h-4 w-12 bg-ink/10" />
                    <Skeleton className="h-4 w-40 bg-ink/10" />
                    <Skeleton className="h-4 w-16 bg-ink/10" />
                    <Skeleton className="h-6 w-20 bg-ink/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-5">
            <Skeleton className="h-5 w-24 bg-ink/10" />
            <Skeleton className="mt-1.5 h-3.5 w-40 bg-ink/10" />
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((l) => (
                <div key={l} className="flex justify-between items-center p-3 border border-line rounded-md">
                  <Skeleton className="h-4 w-40 bg-ink/10" />
                  <Skeleton className="h-4 w-12 bg-ink/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Tuesday · October 24, 2026"
      title={`Good morning, ${userName}.`}
      actions={
        <>
          <button
            onClick={() => toast.success("Export started. Downloading balance report...")}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export report
          </button>
          <button
            onClick={() => toast.info("New invoice creator is under development.")}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New invoice
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's volume"
          value={`${currencySymbol}${todayVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          delta="▲ 12.5%"
          hint="vs yesterday"
          tone="up"
        />
        <StatCard
          label="Successful payments"
          value={successfulPayments.toLocaleString()}
          delta="▲ 4.2%"
          hint="vs yesterday"
          tone="up"
        />
        <StatCard
          label="Pending payouts"
          value={`${currencySymbol}${pendingPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint="Scheduled Oct 25"
        />
        <StatCard label="Refund rate" value="0.8%" delta="▼ 0.1%" hint="vs last week" tone="up" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title={`Net volume — ${chartPeriod === "7d" ? "last 7 days" : chartPeriod === "30d" ? "last 30 days" : "last 12 months"}`}
            description="Compared to the prior period"
            action={
              <div className="flex gap-1 rounded-md border border-line bg-surface-2 p-0.5 text-xs">
                {(["7d", "30d", "12m"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setChartPeriod(p);
                      fetchChartData(p);
                    }}
                    className={`rounded px-2.5 py-1 transition-all cursor-pointer capitalize ${
                      chartPeriod === p
                        ? "bg-ink text-primary-foreground font-medium"
                        : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {p === "12m" ? "1Y" : p.toUpperCase()}
                  </button>
                ))}
              </div>
            }
          >
            <div className="h-[260px] w-full">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.52 0.21 258)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="oklch(0.52 0.21 258)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" tickLine={false} axisLine={false} className="text-[11px]" tick={{ fill: "var(--ink-3)" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 11 }} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    cursor={{ stroke: "var(--line-strong)", strokeDasharray: 3 }}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => `${currencySymbol}${v.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="p" stroke="var(--line-strong)" strokeDasharray="3 3" fill="none" />
                  <Area type="monotone" dataKey="v" stroke="oklch(0.52 0.21 258)" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Treasury balance"
          description="Across 3 operating accounts"
          action={<Pill tone="info">Live</Pill>}
        >
          <div className="font-display text-[40px] leading-none tracking-tight text-ink tabular">
            {`${currencySymbol}${treasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="mt-1 text-xs text-success">▲ {currencySymbol}32,109 today</div>
          <ul className="mt-5 divide-y divide-line text-sm">
            {[
              [`Operating · ${defaultCurrency}`, `${currencySymbol}${(treasuryBalance * 0.73).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
              [`Reserves · ${defaultCurrency}`, `${currencySymbol}${(treasuryBalance * 0.22).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
              [`FX float · EUR`, `€${(treasuryBalance * 0.05 / 150).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between py-2.5">
                <span className="text-ink-2">{k}</span>
                <span className="tabular text-ink">{v}</span>
              </li>
            ))}
          </ul>
          <Link to="/payouts" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cobalt hover:underline cursor-pointer">
            Move funds <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent transactions"
            action={
              <Link to="/transactions" className="text-xs font-medium text-cobalt hover:underline">
                View all →
              </Link>
            }
            padded={false}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Counterparty</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentTxns.slice(0, 5).map((t) => (
                    <tr key={t.id} className="hover:bg-surface-2/60">
                      <td className="px-5 py-3 text-ink-3 tabular">{t.time}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink">{t.who}</div>
                        <div className="text-xs text-ink-3">{t.desc}</div>
                      </td>
                      <td className={`px-5 py-3 text-right font-mono ${formatAmt(t.amt).startsWith("−") ? "text-destructive" : "text-ink"}`}>
                        {formatAmt(t.amt)}
                      </td>
                      <td className="px-5 py-3">
                        <Pill tone={t.tone}>{t.status}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Checklist" description="Get to live in 3 steps">
          <ol className="space-y-3 text-sm">
            {checklist.map((s) => (
              <li key={s.d} className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${s.ok ? "bg-success text-success-foreground" : "border border-line text-ink-3"}`}>
                    {s.ok ? "✓" : "·"}
                  </div>
                  <span className="text-ink">{s.d}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">{s.t}</span>
              </li>
            ))}
          </ol>
          <Link to="/developer" className="mt-4 inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-xs font-medium text-ink hover:bg-surface-2">
            <FileText className="h-3.5 w-3.5" /> Open integration guide
          </Link>
        </SectionCard>
      </div>
    </AppShell>
  );
}
