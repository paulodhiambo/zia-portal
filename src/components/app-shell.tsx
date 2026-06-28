import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CircleHelp,
  Command,
  CreditCard,
  Gauge,
  KeyRound,
  LifeBuoy,
  LogOut,
  Search,
  Settings2,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";

const NAV = [
  { label: "Overview", to: "/home", icon: Gauge },
  { label: "Transactions", to: "/transactions", icon: CreditCard },
  { label: "Payouts", to: "/payouts", icon: Wallet },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Team", to: "/team", icon: UserRound },
  { label: "Notifications", to: "/notifications", icon: Bell },
];

const FOOTER_NAV = [
  { label: "Developer", to: "/developer", icon: KeyRound },
  { label: "Profile", to: "/profile", icon: Settings2 },
];

export function AppShell({
  children,
  title,
  eyebrow,
  actions,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isMockMode, setApiMode } = useApiMode();
  
  const [userName, setUserName] = useState("Elena Mendes");

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    // 1. Initial read from local storage
    const storedUser = localStorage.getItem("zia_portal_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.name) {
          setUserName(user.name);
        }
      } catch {}
    }

    // 2. Fetch fresh name from API in live mode
    if (!isMockMode) {
      apiFetch<any>("/profile")
        .then((data) => {
          const user = data?.user;
          if (user && user.name) {
            setUserName(user.name);
            const stored = localStorage.getItem("zia_portal_user");
            let userObj = {};
            if (stored) {
              try { userObj = JSON.parse(stored); } catch {}
            }
            localStorage.setItem("zia_portal_user", JSON.stringify({
              ...userObj,
              name: user.name,
              email: user.email,
              role: user.role,
              title: user.title,
            }));
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch fresh profile in AppShell:", err);
        });
    }
  }, [isMockMode]);

  return (
    <div className="min-h-screen bg-surface-2 text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
          <Link to="/" className="flex items-center gap-2 px-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-ink text-primary-foreground">
              <span className="font-display text-base leading-none">Z</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] text-ink">Zia</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
                Merchant
              </div>
            </div>
          </Link>

          <div className="mt-6 px-2">
            <div className="rounded-lg border border-line bg-surface-2 px-3 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
                Workspace
              </div>
              <div className="mt-0.5 truncate text-sm font-medium text-ink">Acme Corp.</div>
              <div className="mt-3 border-t border-line/60 pt-2 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink-3">
                  API Source
                </span>
                <button
                  onClick={() => setApiMode(isMockMode ? "live" : "mock")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 border text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    isMockMode
                      ? "bg-success/15 text-success border-success/35"
                      : "bg-cobalt-soft text-cobalt border-cobalt/35"
                  }`}
                  title="Toggle between sandbox mock data and live API requests"
                >
                  <span className={`h-1 w-1 rounded-full ${isMockMode ? "bg-success" : "bg-cobalt"}`} />
                  {isMockMode ? "Mock" : "Live API"}
                </button>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col">
            <div className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              Operate
            </div>
            <ul className="flex flex-col gap-0.5">
              {NAV.map((item) => (
                <SidebarItem
                  key={item.label}
                  {...item}
                  active={pathname === item.to}
                />
              ))}
            </ul>

            <div className="mt-6 px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              System
            </div>
            <ul className="flex flex-col gap-0.5">
              {FOOTER_NAV.map((item) => (
                <SidebarItem
                  key={item.label}
                  {...item}
                  active={pathname === item.to}
                />
              ))}
            </ul>

            <div className="mt-auto rounded-lg border border-line bg-surface-2 p-3">
              <div className="flex items-center gap-2 text-ink">
                <LifeBuoy className="h-4 w-4 text-ink-3" />
                <span className="text-sm font-medium">Need a hand?</span>
              </div>
              <p className="mt-1 text-xs text-ink-3">
                Reach an integration engineer 24/7 from any channel.
              </p>
              <button className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cobalt hover:underline">
                Open support console →
              </button>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-6 backdrop-blur">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-9 w-full max-w-[420px] items-center gap-2 rounded-md border border-line bg-surface-2 px-3 text-sm text-ink-3 focus-within:border-ink/40 focus-within:bg-surface">
                <Search className="h-4 w-4" />
                <input
                  type="search"
                  placeholder="Search transactions, customers, invoices…"
                  className="h-full w-full border-none bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-0"
                />
                <kbd className="hidden items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-3 md:inline-flex">
                  <Command className="h-3 w-3" /> K
                </kbd>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="grid h-9 w-9 place-items-center rounded-md text-ink-2 hover:bg-surface-2 hover:text-ink">
                <Bell className="h-4 w-4" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-md text-ink-2 hover:bg-surface-2 hover:text-ink">
                <CircleHelp className="h-4 w-4" />
              </button>
              <Link
                to="/login"
                className="ml-1 grid h-9 w-9 place-items-center rounded-md text-ink-2 hover:bg-surface-2 hover:text-ink"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Link>
              <Link
                to="/profile"
                className="ml-2 flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm hover:border-line-strong"
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-ink font-mono text-[11px] text-primary-foreground">
                  {getInitials(userName)}
                </div>
                <span className="hidden text-sm font-medium text-ink md:block">{userName}</span>
              </Link>
            </div>
          </header>

          <div className="border-b border-line bg-surface px-6 py-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                {eyebrow && (
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
                    {eyebrow}
                  </div>
                )}
                <h1 className="mt-1 font-display text-[34px] leading-[1.1] tracking-tight text-ink">
                  {title}
                </h1>
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          </div>

          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  to,
  icon: Icon,
  active,
  disabled,
}: {
  label: string;
  to: string;
  icon: typeof Gauge;
  active?: boolean;
  disabled?: boolean;
}) {
  const cls =
    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
    (active
      ? "bg-ink text-primary-foreground"
      : disabled
        ? "text-ink-3/60 cursor-not-allowed"
        : "text-ink-2 hover:bg-surface-2 hover:text-ink");
  if (disabled) {
    return (
      <li>
        <span className={cls}>
          <Icon className="h-4 w-4" />
          <span className="flex-1">{label}</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-3">Soon</span>
        </span>
      </li>
    );
  }
  return (
    <li>
      <Link to={to} className={cls}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </li>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  tone?: "default" | "up" | "down";
}) {
  const deltaTone =
    tone === "up"
      ? "text-success"
      : tone === "down"
        ? "text-destructive"
        : "text-ink-3";
  return (
    <div className="rounded-xl border border-line bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">{label}</div>
      <div className="mt-3 font-display text-[32px] leading-none tracking-tight text-ink tabular">
        {value}
      </div>
      <div className={`mt-3 text-xs ${deltaTone}`}>
        {delta && <span className="font-medium">{delta}</span>}
        {delta && hint && <span className="text-ink-3"> · {hint}</span>}
        {!delta && hint && <span className="text-ink-3">{hint}</span>}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  padded = true,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-card">
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-ink-3">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const map = {
    neutral: "bg-surface-2 text-ink-2 border-line",
    success: "bg-[color-mix(in_oklab,var(--success)_12%,transparent)] text-success border-[color-mix(in_oklab,var(--success)_25%,transparent)]",
    warning: "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-warning-foreground border-[color-mix(in_oklab,var(--warning)_30%,transparent)]",
    danger: "bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] text-destructive border-[color-mix(in_oklab,var(--destructive)_25%,transparent)]",
    info: "bg-cobalt-soft text-cobalt border-[color-mix(in_oklab,var(--cobalt)_25%,transparent)]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${map[tone]}`}
    >
      {children}
    </span>
  );
}
