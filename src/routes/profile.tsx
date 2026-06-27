import { createFileRoute } from "@tanstack/react-router";

import { AppShell, Pill, SectionCard } from "@/components/app-shell";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Zia Merchant" }] }),
  component: Profile,
});

function Profile() {
  return (
    <AppShell eyebrow="Account" title="Profile & preferences">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Identity" description="Visible to teammates across the workspace.">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-ink font-display text-xl text-primary-foreground">
                EM
              </div>
              <div>
                <div className="font-display text-lg text-ink">Elena Mendes</div>
                <div className="text-xs text-ink-3">Head of Finance · Owner</div>
                <button className="mt-2 text-xs font-medium text-cobalt hover:underline">
                  Change photo
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Full name" defaultValue="Elena Mendes" />
              <Field label="Title" defaultValue="Head of Finance" />
              <Field label="Email" defaultValue="elena@acme.com" />
              <Field label="Phone" defaultValue="+1 415 555 0114" />
            </div>
          </SectionCard>

          <SectionCard title="Security">
            <div className="space-y-3">
              <Row
                label="Password"
                value="Last changed 41 days ago"
                action={<button className="text-xs font-medium text-cobalt hover:underline">Change</button>}
              />
              <Row
                label="Two-factor auth"
                value="Authenticator app"
                action={<Pill tone="success">Enabled</Pill>}
              />
              <Row
                label="Hardware key"
                value="Not configured"
                action={<button className="text-xs font-medium text-cobalt hover:underline">Add YubiKey</button>}
              />
              <Row
                label="Active sessions"
                value="3 devices, 2 cities"
                action={<button className="text-xs font-medium text-destructive hover:underline">Sign out all</button>}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Preferences">
            <div className="space-y-3 text-sm">
              <Toggle label="Daily digest at 8:00 ET" on />
              <Toggle label="Alert me on disputes" on />
              <Toggle label="Weekly treasury report" />
              <Toggle label="Beta features" />
            </div>
          </SectionCard>

          <SectionCard title="Connected">
            <ul className="space-y-2 text-sm">
              {[
                ["Slack", "#finance-alerts"],
                ["QuickBooks", "Auto-sync nightly"],
                ["Notion", "Receipts archive"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2.5">
                  <div>
                    <div className="font-medium text-ink">{k}</div>
                    <div className="text-xs text-ink-3">{v}</div>
                  </div>
                  <button className="text-xs text-ink-3 hover:text-ink">Manage</button>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-2">{label}</label>
      <input
        {...rest}
        className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
      />
    </div>
  );
}

function Row({ label, value, action }: { label: string; value: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2.5">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-xs text-ink-3">{value}</div>
      </div>
      {action}
    </div>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-ink-2">{label}</span>
      <span className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${on ? "bg-ink" : "bg-line-strong"}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-1"}`} />
      </span>
    </label>
  );
}
