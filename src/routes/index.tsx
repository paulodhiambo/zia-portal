import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, Sparkle, Zap, Terminal, Code, CheckCircle } from "lucide-react";
import * as React from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zia — Institutional Modern Finance" },
      {
        name: "description",
        content:
          "Zia is the treasury, acceptance, and developer surface for finance teams that take craft seriously.",
      },
    ],
  }),
  component: Landing,
});

type PresetMix = "treasury" | "saas" | "balanced";

function Landing() {
  // Calculator state
  const [volume, setVolume] = React.useState<number>(5000000); // Monthly volume in USD
  const [mix, setMix] = React.useState<PresetMix>("balanced");
  
  // Calculate shares
  const getShares = (m: PresetMix) => {
    switch (m) {
      case "treasury":
        return { ach: 70, card: 5, wire: 25 };
      case "saas":
        return { ach: 15, card: 80, wire: 5 };
      case "balanced":
      default:
        return { ach: 50, card: 40, wire: 10 };
    }
  };

  const shares = getShares(mix);

  // Fee calculation formulas
  const calcZiaCost = (vol: number, sh: typeof shares) => {
    const achCost = (vol * (sh.ach / 100)) * 0.0005; // 0.05% ACH
    const cardCost = (vol * (sh.card / 100)) * 0.012; // 1.2% Cards
    const wireCost = ((vol * (sh.wire / 100)) / 10000) * 250.00; // KES 250.00 flat wire (assuming average 10k size)
    return achCost + cardCost + wireCost;
  };

  const calcLegacyCost = (vol: number, sh: typeof shares) => {
    const achCost = (vol * (sh.ach / 100)) * 0.008; // 0.8% standard legacy ACH
    const cardCost = (vol * (sh.card / 100)) * 0.029; // 2.9% standard card fee
    const wireCost = ((vol * (sh.wire / 100)) / 10000) * 1500.00; // KES 1500.00 standard legacy wire
    return achCost + cardCost + wireCost;
  };

  const ziaCost = calcZiaCost(volume, shares);
  const legacyCost = calcLegacyCost(volume, shares);
  const savings = Math.max(0, legacyCost - ziaCost);
  const savingsPercent = legacyCost > 0 ? Math.round((savings / legacyCost) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface text-ink selection:bg-cobalt/25">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-ink text-primary-foreground">
              <span className="font-display text-base">Z</span>
            </div>
            <span className="font-display text-[17px] tracking-tight">Zia</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-ink-2 md:flex">
            <a href="#product" className="hover:text-ink transition-colors">Product</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Landing Cost</a>
            <a href="#developers" className="hover:text-ink transition-colors">Developers</a>
            <a href="#trust" className="hover:text-ink transition-colors">Trust</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-md px-3 py-2 text-sm text-ink-2 hover:text-ink md:inline-flex cursor-pointer"
            >
              Sign in
            </Link>
            <Link
              to="/home"
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer transition-colors"
            >
              Open dashboard <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_80%_0%,color-mix(in_oklab,var(--cobalt)_18%,transparent),transparent_60%)]" />
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-24 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Series C · SOC 2 Type II
            </div>
            <h1 className="mt-5 font-display text-[64px] leading-[0.98] tracking-tight text-ink">
              Money moves
              <br />
              <span className="italic text-ink-2">deliberately.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-2">
              Zia is the treasury, acceptance, and developer surface used by serious
              finance teams. One ledger. One audit trail. Real institutional rails — no
              fintech theater.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer"
              >
                Start onboarding <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="#product"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
              >
                See the product
              </a>
            </div>

            {/* Rails logos */}
            <div className="mt-10 border-t border-line pt-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-3">
                Powering regional rails & networks:
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3.5 opacity-60 grayscale hover:grayscale-0 hover:opacity-90 transition-all duration-300">
                {/* M-PESA */}
                <div className="flex items-center gap-1 text-[#4FBA53] font-bold text-xs tracking-tight select-none pointer-events-none">
                  <span className="h-2 w-2 rounded-full bg-[#E51B24] shrink-0" />
                  <span>M-PESA</span>
                </div>
                
                {/* Airtel */}
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#E31837] tracking-tight select-none pointer-events-none">
                  <div className="grid h-4 w-4 place-items-center rounded-full bg-[#E31837] text-[9.5px] font-black text-white leading-none">
                    a
                  </div>
                  <span className="font-extrabold lowercase text-[#E31837] tracking-tighter">airtel</span>
                  <span className="text-[8.5px] bg-[#E31837]/15 text-[#E31837] font-semibold px-1 rounded uppercase tracking-wide">Money</span>
                </div>
                
                {/* Paystack */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none pointer-events-none">
                  <div className="flex gap-0.5 items-end">
                    <div className="w-1 h-2.5 bg-[#3cb1e5] rounded-sm" />
                    <div className="w-1 h-3.5 bg-[#00a3e0] rounded-sm" />
                    <div className="w-1 h-2 bg-[#0072bc] rounded-sm" />
                  </div>
                  <span className="text-ink font-bold tracking-tight">paystack</span>
                </div>
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-line pt-6 text-left">
              {[
                { k: "KES 24T", v: "Annualized volume" },
                { k: "99.999%", v: "Ledger uptime" },
                { k: "37", v: "Regulated entities" },
              ].map((m) => (
                <div key={m.k}>
                  <dt className="font-display text-2xl tracking-tight text-ink tabular">
                    {m.k}
                  </dt>
                  <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
                    {m.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Preview card */}
          <div className="md:col-span-5 flex items-center">
            <div className="w-full rounded-2xl border border-line bg-card p-1 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)]">
              <div className="rounded-xl bg-surface-2 px-5 py-4">
                <div className="flex items-center justify-between text-xs text-ink-3">
                  <span className="font-mono uppercase tracking-[0.2em]">Today · KES</span>
                  <span className="font-mono">10:42 ET</span>
                </div>
                <div className="mt-3 font-display text-[40px] leading-none tracking-tight text-ink tabular">
                  KES 42,500.00
                </div>
                <div className="mt-1 text-xs text-success">▲ 12.5% vs yesterday</div>
              </div>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-xl bg-line">
                {[
                  ["Successful", "1,248"],
                  ["Pending payouts", "KES 128,450"],
                  ["Refund rate", "0.8%"],
                  ["Disputes open", "3"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-card px-5 py-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                      {k}
                    </div>
                    <div className="mt-2 text-lg font-medium text-ink tabular">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Pillars */}
      <section id="product" className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Treasury, not a wrapper.",
                body: "Direct rails into M-Pesa, Airtel Money, and Paystack. No partner banks pretending to be infrastructure.",
              },
              {
                icon: Zap,
                title: "Latency you can quote.",
                body: "P99 authorization in 84ms. Settle, reconcile, and report in a single immutable ledger.",
              },
              {
                icon: Sparkle,
                title: "An API engineers respect.",
                body: "Typed clients, idempotency by default, webhook replays, and changelogs you can subscribe to.",
              },
            ].map((p) => (
              <div key={p.title} className="border-t border-line pt-6">
                <p.icon className="h-5 w-5 text-cobalt" />
                <h3 className="mt-4 font-display text-xl tracking-tight text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing Cost & Pricing Calculator Section */}
      <section id="pricing" className="border-b border-line scroll-mt-10">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl tracking-tight text-ink">
              Predictable landing costs.
            </h2>
            <p className="mt-3 text-sm text-ink-2 leading-relaxed">
              Institutional pricing built for high-volume treasury desks. Stop paying retail fintech premiums. Save up to 75% on standard clearing interchange.
            </p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-12 items-start">
            {/* Calculator Card */}
            <div className="lg:col-span-7 rounded-2xl border border-line bg-card p-6 shadow-sm">
              <h3 className="font-display text-xl tracking-tight text-ink">Calculate your monthly savings</h3>
              <p className="text-xs text-ink-3 mt-1">Adjust volume and transaction mix to inspect live landing cost estimates.</p>
              
              <div className="mt-8 space-y-6">
                {/* Volume Slider */}
                <div>
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-2 font-mono">Monthly Processing</label>
                    <span className="font-display text-2xl text-ink font-semibold tabular">
                      KES {(volume / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={20000000}
                    step={100000}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="mt-3 h-1.5 w-full appearance-none rounded-lg bg-line accent-ink cursor-pointer focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-ink-3 font-mono mt-1">
                    <span>KES 100K</span>
                    <span>KES 10M</span>
                    <span>KES 20M</span>
                  </div>
                </div>

                {/* Preset Mix Buttons */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-2 font-mono block">Transaction Rails Mix</label>
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    {[
                      { id: "balanced", label: "Balanced", desc: "50% ACH / 40% Card / 10% Wire" },
                      { id: "treasury", label: "Treasury Heavy", desc: "70% ACH / 5% Card / 25% Wire" },
                      { id: "saas", label: "SaaS Heavy", desc: "15% ACH / 80% Card / 5% Wire" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setMix(p.id as PresetMix)}
                        className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                          mix === p.id
                            ? "border-ink bg-ink text-primary-foreground"
                            : "border-line bg-surface hover:bg-surface-2 text-ink"
                        }`}
                      >
                        <div className="text-xs font-semibold">{p.label}</div>
                        <div className={`text-[9px] mt-1 font-mono leading-tight ${mix === p.id ? "text-primary-foreground/75" : "text-ink-3"}`}>
                          {p.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-line bg-surface-2 p-6 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cobalt font-semibold">Your Estimated Savings</span>
                  <div className="mt-2 font-display text-[44px] font-semibold leading-none tracking-tight text-ink tabular">
                    KES {Math.round(savings).toLocaleString()}<span className="text-xs font-normal text-ink-3"> / month</span>
                  </div>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                    Save {savingsPercent}% in transaction costs
                  </div>
                </div>

                <div className="mt-8 space-y-4 border-t border-line/65 pt-6 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-2">Zia Blended Fee</span>
                    <span className="font-mono text-ink font-medium tabular">
                      KES {Math.round(ziaCost).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-ink-3">
                    <span>Legacy Provider (2.9% + standard)</span>
                    <span className="font-mono tabular line-through">
                      KES {Math.round(legacyCost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown summary */}
              <div className="p-1 rounded-xl border border-line bg-card">
                <div className="grid grid-cols-3 gap-px bg-line overflow-hidden rounded-lg text-center text-xs">
                  <div className="bg-card py-3">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-ink-3">ACH Transfers</div>
                    <div className="mt-1 font-semibold text-ink">0.05%</div>
                    <div className="text-[9px] text-ink-3 mt-0.5 font-mono">Capped at KES 500</div>
                  </div>
                  <div className="bg-card py-3">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-ink-3">Fedwire Wires</div>
                    <div className="mt-1 font-semibold text-ink">KES 250.00</div>
                    <div className="text-[9px] text-ink-3 mt-0.5 font-mono">Flat incoming</div>
                  </div>
                  <div className="bg-card py-3">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-ink-3">Card Acceptance</div>
                    <div className="mt-1 font-semibold text-ink">1.2%</div>
                    <div className="text-[9px] text-ink-3 mt-0.5 font-mono">Commercial rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section id="developers" className="border-b border-line bg-surface-2 scroll-mt-10">
        <div className="mx-auto max-w-[1200px] px-6 py-20 grid gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cobalt">
              <Terminal className="h-3 w-3 shrink-0" /> Built for developers
            </div>
            <h2 className="mt-4 font-display text-4xl tracking-tight text-ink leading-tight">
              An API designed for systems, not interfaces.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              Zia implements clean, idempotent HTTP resources wrapped in predictable message envelopes. Retrieve transaction events, replay failed webhook endpoints, and inspect raw ledger updates with sub-millisecond latencies.
            </p>
            <ul className="mt-6 space-y-3.5 text-sm text-ink-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                <span>Standardized message envelopes for correlation audits</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                <span>HMAC-SHA256 signature verifications on webhooks</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                <span>Idempotency-Key headers required on write commands</span>
              </li>
            </ul>
          </div>

          {/* Interactive Code Container */}
          <div className="rounded-xl border border-line bg-ink text-primary-foreground p-5 font-mono text-xs shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[10px] uppercase tracking-wider text-white/50">
              <div className="flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" />
                <span>POST /api/v1/payouts/create</span>
              </div>
              <span>JSON Payload</span>
            </div>
            <pre className="mt-4 overflow-x-auto text-[11px] leading-relaxed text-white/90 select-all">
{`{
  "messageID": "XBYUURE",
  "primaryData": {
    "source": "Operating · USD",
    "bank": "Chase Bank",
    "routing": "123456789",
    "account": "9876543210",
    "amount": 128450.00,
    "description": "Weekly Payroll"
  },
  "additionalData": [
    { "key": "clientVersion", "value": "1.0.0" }
  ]
}`}
            </pre>
            <div className="mt-6 border-t border-white/10 pt-3 flex items-center justify-between text-[10px] text-white/40">
              <span>Standard Request Envelope</span>
              <span>200 OK Response wrapped</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section id="trust" className="border-b border-line scroll-mt-10">
        <div className="mx-auto max-w-[1200px] px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-4xl tracking-tight text-ink">
              Enterprise security, native posture.
            </h2>
            <p className="mt-3 text-sm text-ink-2 leading-relaxed">
              Zia is built directly onto bank clearing channels. We adhere to rigid banking compliances, SOC audited registries, and cryptographically verified system access.
            </p>
          </div>
          <div className="grid gap-6 mt-14 sm:grid-cols-3 text-left">
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-semibold text-sm text-ink uppercase tracking-wider font-mono">SOC 2 Type II Certified</h3>
              <p className="text-xs text-ink-2 mt-2 leading-relaxed">Continuous audit metrics streamed directly to Vanta. Automated policy testing on every commit.</p>
            </div>
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-semibold text-sm text-ink uppercase tracking-wider font-mono">Federal Clearing Rails</h3>
              <p className="text-xs text-ink-2 mt-2 leading-relaxed">Direct settlement relationships with Federal clearing houses, avoiding third-party banking risks.</p>
            </div>
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-semibold text-sm text-ink uppercase tracking-wider font-mono">End-to-End Encryption</h3>
              <p className="text-xs text-ink-2 mt-2 leading-relaxed">All fields encrypted at rest using AES-256 with envelopes keys, managed via AWS KMS.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-ink">
              See the dashboard in two minutes.
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              Sandbox accounts come with realistic volume. No call required.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer"
            >
              Create workspace
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1200px] px-6 py-10 text-xs text-ink-3">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <span className="font-mono uppercase tracking-[0.2em]">© 2026 Zia Financial Systems</span>
          <div className="flex gap-5">
            <a className="hover:text-ink transition-colors" href="#">Terms</a>
            <a className="hover:text-ink transition-colors" href="#">Privacy</a>
            <a className="hover:text-ink transition-colors" href="#">Disclosures</a>
            <a className="hover:text-ink transition-colors" href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
