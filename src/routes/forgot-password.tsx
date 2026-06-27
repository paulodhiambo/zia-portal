import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Zia" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitted(true);
    toast.success(`Reset link sent to ${email}`);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface md:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden overflow-hidden border-r border-line bg-ink md:block">
        <img
          src="/login-visual.png"
          alt="Zia Portal Analytics Visual"
          className="absolute inset-0 h-full w-full object-cover opacity-45 select-none pointer-events-none"
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
          <div>
            <p className="font-display text-3xl leading-tight tracking-tight">
              "We replaced four banks, two ledgers, and a 32-tab spreadsheet with one Zia
              workspace."
            </p>
            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">
              Marta Chen · CFO, Northwind Aero
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {!submitted ? (
            <>
              <Link to="/login" className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">
                ← Back to sign in
              </Link>
              <h1 className="mt-6 font-display text-3xl tracking-tight text-ink">Forgot password?</h1>
              <p className="mt-1 text-sm text-ink-3">
                Enter your work email and we'll send you a password reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <Field
                  label="Work email"
                  type="email"
                  required
                  placeholder="elena@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer"
                >
                  Send reset link <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-left animate-in fade-in zoom-in-95 duration-200">
              <div className="h-10 w-10 text-success bg-[color-mix(in_oklab,var(--success)_12%,transparent)] rounded-full grid place-items-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h1 className="mt-5 font-display text-3xl tracking-tight text-ink">Check your email</h1>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">
                We've sent a password reset link to <strong className="text-ink">{email}</strong>. Please check your inbox and spam folder.
              </p>
              
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    toast.success("Resent password reset link");
                  }}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer"
                >
                  Resend reset link
                </button>
                <Link
                  to="/login"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer"
                >
                  Return to sign in
                </Link>
              </div>
            </div>
          )}
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
