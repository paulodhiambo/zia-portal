import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowDownRight, CheckCircle2, KeyRound, Wallet } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { AppShell, Pill, SectionCard } from "@/components/app-shell";
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

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Zia Merchant" }] }),
  component: Notifications,
});

interface NotificationItem {
  id: string;
  icon: typeof AlertTriangle;
  tone: "success" | "warning" | "danger" | "info" | "neutral";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  category: "Disputes" | "Payouts" | "Security" | "Product";
}

const INITIAL_ITEMS: NotificationItem[] = [
  {
    id: "notif_1",
    icon: AlertTriangle,
    tone: "danger",
    title: "Dispute opened on charge ch_8K0AVV",
    body: "Atlas Studio filed a chargeback for $219.00. Evidence due Oct 31.",
    time: "12 min ago",
    unread: true,
    category: "Disputes",
  },
  {
    id: "notif_2",
    icon: Wallet,
    tone: "info",
    title: "Payout of $128,450.00 scheduled",
    body: "Funds will land in Operating · USD tomorrow before 11:00 ET.",
    time: "1h ago",
    unread: true,
    category: "Payouts",
  },
  {
    id: "notif_3",
    icon: KeyRound,
    tone: "warning",
    title: "Production API key used from new IP",
    body: "sk_live_••••_8Q21f3 was used from 34.221.18.4 (us-west-2).",
    time: "3h ago",
    unread: false,
    category: "Security",
  },
  {
    id: "notif_4",
    icon: CheckCircle2,
    tone: "success",
    title: "KYB verification complete",
    body: "Acme Corp. is fully verified. Live charges are enabled.",
    time: "Yesterday",
    unread: false,
    category: "Product",
  },
  {
    id: "notif_5",
    icon: ArrowDownRight,
    tone: "neutral",
    title: "Refund issued · #INV-2998",
    body: "$420.00 returned to Lina Park · card •• 4242.",
    time: "Yesterday",
    unread: false,
    category: "Payouts",
  },
];

function Notifications() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(INITIAL_ITEMS);
  const [selectedCategory, setSelectedCategory] = React.useState<"All" | "Disputes" | "Payouts" | "Security" | "Product">("All");

  // Preferences State
  const [prefDialogOpen, setPrefDialogOpen] = React.useState(false);
  const [emailDigest, setEmailDigest] = React.useState(true);
  const [disputeAlert, setDisputeAlert] = React.useState(true);
  const [payoutAlert, setPayoutAlert] = React.useState(true);
  const [securityAlert, setSecurityAlert] = React.useState(true);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefDialogOpen(false);
    toast.success("Notification preferences updated successfully");
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter(
    (n) => selectedCategory === "All" || n.category === selectedCategory
  );

  const getCategoryCount = (cat: "All" | "Disputes" | "Payouts" | "Security" | "Product") => {
    if (cat === "All") return notifications.length;
    return notifications.filter((n) => n.category === cat).length;
  };

  return (
    <AppShell
      eyebrow={`${unreadCount} unread`}
      title="Notifications"
      actions={
        <>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={`inline-flex h-9 items-center rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Mark all as read
          </button>
          
          <Dialog open={prefDialogOpen} onOpenChange={setPrefDialogOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex h-9 items-center rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer">
                Preferences
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-surface text-ink border border-line">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl tracking-tight text-ink">
                  Notification preferences
                </DialogTitle>
                <DialogDescription className="text-xs text-ink-3">
                  Manage how and when you receive ledger activity and security updates.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSavePreferences} className="space-y-4 py-2">
                <Toggle
                  label="Daily email digest (08:00 ET)"
                  on={emailDigest}
                  onChange={() => setEmailDigest(!emailDigest)}
                />
                <Toggle
                  label="Dispute chargeback alerts"
                  on={disputeAlert}
                  onChange={() => setDisputeAlert(!disputeAlert)}
                />
                <Toggle
                  label="Payout confirmation alerts"
                  on={payoutAlert}
                  onChange={() => setPayoutAlert(!payoutAlert)}
                />
                <Toggle
                  label="Critical security logs"
                  on={securityAlert}
                  onChange={() => setSecurityAlert(!securityAlert)}
                />

                <DialogFooter className="mt-6 flex gap-2 pt-2 border-t border-line">
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
                    Save preferences
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <SectionCard title="Filter">
            <ul className="space-y-1 text-sm">
              {([
                ["All", "All"],
                ["Disputes", "Disputes"],
                ["Payouts", "Payouts"],
                ["Security", "Security"],
                ["Product", "Product"],
              ] as const).map(([label, cat]) => {
                const isActive = selectedCategory === cat;
                return (
                  <li key={label}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors cursor-pointer ${
                        isActive
                          ? "bg-surface-2 text-ink font-medium"
                          : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                      }`}
                    >
                      <span>{label}</span>
                      <span className="font-mono text-[10px] text-ink-3">
                        {getCategoryCount(cat)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </aside>

        <div className="lg:col-span-3">
          <SectionCard padded={false}>
            {filteredNotifications.length === 0 ? (
              <p className="text-sm text-ink-3 py-10 text-center font-medium">
                No notifications found.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {filteredNotifications.map((n) => (
                  <li
                    key={n.id}
                    onClick={() => {
                      if (n.unread) {
                        setNotifications((prev) =>
                          prev.map((item) =>
                            item.id === n.id ? { ...item, unread: false } : item
                          )
                        );
                      }
                    }}
                    className={`flex gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-surface-2/30 ${
                      n.unread ? "bg-surface-2/60 font-medium" : ""
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <n.icon className="h-4 w-4 text-ink-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-ink leading-snug">{n.title}</span>
                        <Pill tone={n.tone}>{n.tone === "neutral" ? "info" : n.tone}</Pill>
                        {n.unread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cobalt shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink-2 font-normal leading-relaxed">{n.body}</p>
                    </div>
                    <div className="shrink-0 text-xs text-ink-3 tabular">{n.time}</div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on?: boolean;
  onChange?: () => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1" onClick={onChange}>
      <span className="text-ink-2 text-sm">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
          on ? "bg-ink" : "bg-line-strong"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            on ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
}
