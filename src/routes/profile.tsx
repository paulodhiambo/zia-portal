import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { AppShell, Pill, SectionCard } from "@/components/app-shell";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Zia Merchant" }] }),
  component: Profile,
});

function Profile() {
  const { isMockMode } = useApiMode();
  
  const [profile, setProfile] = React.useState({
    name: "Elena Mendes",
    title: "Head of Finance",
    email: "elena@acme.com",
    phone: "+1 415 555 0114",
    role: "Owner"
  });

  const [preferences, setPreferences] = React.useState({
    dailyDigest: true,
    alertOnDisputes: true,
    weeklyTreasuryReport: false,
    betaFeatures: false
  });

  const [security, setSecurity] = React.useState({
    activeSessionsCount: 3,
    hardwareKeysCount: 0,
    twoFactorEnabled: true
  });
  
  const [isSaving, setIsSaving] = React.useState(false);

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  React.useEffect(() => {
    // 1. Initial read from local storage
    const storedUser = localStorage.getItem("zia_portal_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfile(prev => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          role: user.role || prev.role,
          title: user.role || prev.title,
        }));
      } catch {}
    }

    // 2. Fetch fresh profile from API in live mode
    if (!isMockMode) {
      apiFetch<any>("/profile")
        .then((data) => {
          const user = data?.user;
          if (user) {
            setProfile({
              name: user.name || "Elena Mendes",
              title: user.title || "Head of Finance",
              email: user.email || "elena@acme.com",
              phone: user.phone || "+1 415 555 0114",
              role: user.role || "Owner"
            });
          }
          if (data?.preferences) {
            setPreferences({
              dailyDigest: !!data.preferences.dailyDigest,
              alertOnDisputes: !!data.preferences.alertOnDisputes,
              weeklyTreasuryReport: !!data.preferences.weeklyTreasuryReport,
              betaFeatures: !!data.preferences.betaFeatures
            });
          }
          if (data?.security) {
            setSecurity({
              activeSessionsCount: data.security.activeSessionsCount ?? 3,
              hardwareKeysCount: data.security.hardwareKeysCount ?? 0,
              twoFactorEnabled: !!data.security.twoFactorEnabled
            });
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch profile in Profile page:", err);
        });
    }
  }, [isMockMode]);

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMockMode) {
      const storedUser = localStorage.getItem("zia_portal_user");
      let userObj = {};
      if (storedUser) {
        try { userObj = JSON.parse(storedUser); } catch {}
      }
      localStorage.setItem("zia_portal_user", JSON.stringify({
        ...userObj,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        title: profile.title,
      }));
      toast.success("Profile updated successfully (Mock Mode)!");
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch<any>("/profile/update", "POST", {
        name: profile.name,
        title: profile.title,
        phone: profile.phone,
      });

      const storedUser = localStorage.getItem("zia_portal_user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          localStorage.setItem("zia_portal_user", JSON.stringify({
            ...user,
            name: profile.name,
            phone: profile.phone,
            title: profile.title,
          }));
        } catch {}
      }

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePreference = async (key: keyof typeof preferences) => {
    const newVal = !preferences[key];
    const updatedPrefs = { ...preferences, [key]: newVal };
    setPreferences(updatedPrefs);

    if (isMockMode) {
      toast.success("Preferences updated (Mock Mode)!");
      return;
    }

    try {
      await apiFetch<any>("/notifications/preferences", "POST", updatedPrefs);
      toast.success("Preferences updated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update preferences");
      // Revert state on error
      setPreferences(preferences);
    }
  };

  return (
    <AppShell eyebrow="Account" title="Profile & preferences">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Identity" description="Visible to teammates across the workspace.">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-ink font-display text-xl text-primary-foreground">
                {getInitials(profile.name)}
              </div>
              <div>
                <div className="font-display text-lg text-ink">{profile.name}</div>
                <div className="text-xs text-ink-3">{profile.title} · {profile.role}</div>
                <button className="mt-2 text-xs font-medium text-cobalt hover:underline">
                  Change photo
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveIdentity} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Full name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <Field
                  label="Title"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
                <Field
                  label="Email"
                  value={profile.email}
                  disabled
                  readOnly
                  className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface-2 px-3 text-sm text-ink-3 cursor-not-allowed"
                />
                <Field
                  label="Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-ink px-4 text-xs font-medium text-primary-foreground hover:bg-ink/90 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
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
                value={security.twoFactorEnabled ? "Authenticator app" : "Disabled"}
                action={security.twoFactorEnabled ? <Pill tone="success">Enabled</Pill> : <Pill tone="warning">Disabled</Pill>}
              />
              <Row
                label="Hardware key"
                value={security.hardwareKeysCount > 0 ? `${security.hardwareKeysCount} configured` : "Not configured"}
                action={<button className="text-xs font-medium text-cobalt hover:underline">Add YubiKey</button>}
              />
              <Row
                label="Active sessions"
                value={`${security.activeSessionsCount} active session${security.activeSessionsCount !== 1 ? "s" : ""}`}
                action={<button className="text-xs font-medium text-destructive hover:underline">Sign out all</button>}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Preferences">
            <div className="space-y-3 text-sm">
              <Toggle
                label="Daily digest at 8:00 ET"
                on={preferences.dailyDigest}
                onChange={() => handleTogglePreference("dailyDigest")}
              />
              <Toggle
                label="Alert me on disputes"
                on={preferences.alertOnDisputes}
                onChange={() => handleTogglePreference("alertOnDisputes")}
              />
              <Toggle
                label="Weekly treasury report"
                on={preferences.weeklyTreasuryReport}
                onChange={() => handleTogglePreference("weeklyTreasuryReport")}
              />
              <Toggle
                label="Beta features"
                on={preferences.betaFeatures}
                onChange={() => handleTogglePreference("betaFeatures")}
              />
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

function Toggle({ label, on, onChange }: { label: string; on?: boolean; onChange?: () => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer select-none">
      <span className="text-ink-2">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cobalt/30 ${on ? "bg-ink" : "bg-line-strong"}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-1"}`} />
      </button>
    </label>
  );
}
