import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Download, FileText, Plus } from "lucide-react";
import * as React from "react";

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

  React.useEffect(() => {
    if (isMockMode) {
      setUserName("Acme Corp");
      setTreasuryBalance(2481302.18);
      setTodayVolume(42500.00);
      setSuccessfulPayments(1248);
      setPendingPayouts(128450.00);
      setChecklist([
        { d: "Verify business entity", t: "Done", ok: true },
        { d: "Invite finance team", t: "2 of 4", ok: true },
        { d: "Activate live API keys", t: "Pending", ok: false },
      ]);
      return;
    }

    setIsLoading(true);
    
    // Fetch profile and overview metrics concurrently in live mode
    apiFetch<any>("/profile")
      .then((profileData) => {
        setUserName(profileData?.user?.name || "Acme Corp");
      })
      .catch((err) => {
        console.warn("Failed to fetch user profile name:", err);
        setUserName("Acme Corp");
      });

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
      .finally(() => {
        setIsLoading(false);
      });
  }, [isMockMode]);

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
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer">
            <Download className="h-4 w-4" /> Export report
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer">
            <Plus className="h-4 w-4" /> New invoice
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's volume"
          value={`$${todayVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
          value={`$${pendingPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint="Scheduled Oct 25"
        />
        <StatCard label="Refund rate" value="0.8%" delta="▼ 0.1%" hint="vs last week" tone="up" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Net volume — last 7 days"
            description="Compared to the same period last week"
            action={
              <div className="flex gap-1 rounded-md border border-line bg-surface-2 p-0.5 text-xs">
                {["7D", "30D", "90D", "1Y"].map((p, i) => (
                  <button
                    key={p}
                    className={`rounded px-2.5 py-1 transition-all cursor-pointer ${
                      i === 0 ? "bg-ink text-primary-foreground font-medium" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            }
          >
            <div className="h-[260px] w-full">
              <ResponsiveContainer>
                <AreaChart data={SERIES} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.52 0.21 258)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="oklch(0.52 0.21 258)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" tickLine={false} axisLine={false} className="text-[11px]" tick={{ fill: "var(--ink-3)" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    cursor={{ stroke: "var(--line-strong)", strokeDasharray: 3 }}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => `$${v.toLocaleString()}`}
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
            {`$${treasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="mt-1 text-xs text-success">▲ $32,109 today</div>
          <ul className="mt-5 divide-y divide-line text-sm">
            {[
              ["Operating · USD", "$1,820,440.02"],
              ["Reserves · USD", "$540,200.00"],
              ["FX float · EUR", "€112,400.50"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between py-2.5">
                <span className="text-ink-2">{k}</span>
                <span className="tabular text-ink">{v}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cobalt hover:underline cursor-pointer">
            Move funds <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
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
                  {INITIAL_TXNS.slice(0, 5).map((t) => (
                    <tr key={t.id} className="hover:bg-surface-2/60">
                      <td className="px-5 py-3 text-ink-3 tabular">{t.time}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink">{t.who}</div>
                        <div className="text-xs text-ink-3">{t.desc}</div>
                      </td>
                      <td className={`px-5 py-3 text-right font-mono ${t.amt.startsWith("−") ? "text-destructive" : "text-ink"}`}>
                        {t.amt}
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
