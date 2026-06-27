import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import * as React from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Zia Merchant" }] }),
  component: LoginRouteComponent,
});

function LoginRouteComponent() {
  return <Auth defaultMode="signin" />;
}

export function Auth({ defaultMode = "signin" }: { defaultMode?: "signin" | "signup" }) {
  const [mode, setMode] = React.useState<"signin" | "signup">(defaultMode);
  
  // Sign up fields
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [company, setCompany] = React.useState("");
  
  // Shared fields
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth success and redirect
    window.location.assign("/home");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface md:grid-cols-5">
      {/* Left visual panel (covers 2 cols in md screens) */}
      <div className="relative hidden overflow-hidden border-r border-line bg-ink md:col-span-2 md:block">
        <img
          src="/login-visual.png"
          alt="Zia Portal Analytics Visual"
          className="absolute inset-0 h-full w-full object-cover opacity-40 select-none pointer-events-none"
        />
        <div className="absolute inset-0 [background:radial-gradient(80%_60%_at_20%_20%,color-mix(in_oklab,var(--cobalt)_30%,transparent),transparent_70%)]" />
        <div className="absolute inset-0 bg-ink/15" />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary-foreground text-ink">
              <span className="font-display text-base">Z</span>
            </div>
            <span className="font-display text-lg">Zia</span>
          </Link>
          
          {mode === "signin" ? (
            <div>
              <p className="font-display text-2xl leading-tight tracking-tight">
                "We replaced four banks, two ledgers, and a 32-tab spreadsheet with one Zia
                workspace."
              </p>
              <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
                Marta Chen · CFO, Northwind Aero
              </div>
            </div>
          ) : (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
                What's included
              </div>
              <ul className="mt-6 space-y-3.5 text-xs text-primary-foreground/90">
                {[
                  "Sandbox treasury account funded with $10M",
                  "Realistic transaction volume for testing",
                  "Production-grade SDKs in 6 languages",
                  "Sub-second webhook delivery, with replay",
                  "SOC 2 Type II posture from day one",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 text-cobalt shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Form Section (covers 3 cols in md screens) */}
      <div className="flex items-center justify-center px-6 py-12 md:col-span-3">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">
            ← Back
          </Link>
          
          <h1 className="mt-8 font-display text-3xl tracking-tight text-ink">
            {mode === "signin" ? "Sign in" : "Open a Zia workspace"}
          </h1>
          <p className="mt-1 text-sm text-ink-3">
            {mode === "signin"
              ? "Welcome back to your workspace."
              : "Sandbox keys are provisioned in under 30 seconds."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Legal name"
                    required
                    placeholder="Elena Mendes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Field
                    label="Role"
                    required
                    placeholder="Head of Finance"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <Field
                  label="Company"
                  required
                  placeholder="Acme Corp."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </>
            )}

            <Field
              label="Work email"
              type="email"
              required
              placeholder="elena@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-ink-2">Password</label>
                {mode === "signin" && (
                  <Link to="/forgot-password" className="text-xs text-cobalt hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <input
                type="password"
                required
                placeholder={mode === "signin" ? "••••••••••" : "At least 12 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
              />
            </div>

            {mode === "signin" ? (
              <label className="flex items-center gap-2 text-xs text-ink-2 select-none cursor-pointer">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-line accent-ink cursor-pointer" />
                Keep me signed in for 30 days
              </label>
            ) : (
              <p className="text-xs text-ink-3 leading-normal">
                By continuing you agree to the{" "}
                <a className="text-cobalt hover:underline" href="#">
                  Merchant Terms
                </a>{" "}
                and{" "}
                <a className="text-cobalt hover:underline" href="#">
                  Privacy Notice
                </a>
                .
              </p>
            )}

            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer mt-2"
            >
              {mode === "signin" ? "Continue" : "Create workspace"}{" "}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-xs text-ink-3">
            {mode === "signin" ? (
              <>
                New to Zia?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-cobalt hover:underline font-medium cursor-pointer"
                >
                  Create a merchant account
                </button>
              </>
            ) : (
              <>
                Already onboarded?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-cobalt hover:underline font-medium cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-2">{label}</label>
      <input
        {...rest}
        className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
      />
    </div>
  );
}
