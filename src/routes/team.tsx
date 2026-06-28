import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team — Zia Merchant" }] }),
  component: Team,
});

interface Member {
  name: string;
  email: string;
  role: string;
  last: string;
  initials: string;
}

interface PendingInvite {
  email: string;
  role: string;
  invited: string;
}

const INITIAL_MEMBERS: Member[] = [
  { name: "Elena Mendes", email: "elena@acme.com", role: "Owner", last: "Active now", initials: "EM" },
  { name: "Theo Kowalski", email: "theo@acme.com", role: "Admin", last: "2h ago", initials: "TK" },
  { name: "Priya Raman", email: "priya@acme.com", role: "Finance", last: "Yesterday", initials: "PR" },
  { name: "James Okafor", email: "james@acme.com", role: "Developer", last: "3d ago", initials: "JO" },
  { name: "Hana Sato", email: "hana@acme.com", role: "Read-only", last: "1w ago", initials: "HS" },
];

const INITIAL_PENDING: PendingInvite[] = [
  { email: "marc@acme.com", role: "Finance", invited: "Oct 22" },
  { email: "dev-ops@acme.com", role: "Developer", invited: "Oct 21" },
];

function Team() {
  const { isMockMode } = useApiMode();
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS);
  const [pending, setPending] = React.useState<PendingInvite[]>(INITIAL_PENDING);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("Finance");

  const fetchTeamData = React.useCallback(() => {
    if (isMockMode) {
      setMembers(INITIAL_MEMBERS);
      setPending(INITIAL_PENDING);
      return Promise.resolve();
    }
    return Promise.all([
      apiFetch<{ members: any[] }>("/team/members")
        .then((data) => {
          const list = data?.members || [];
          setMembers(list.map((m) => ({
            name: m.name,
            email: m.email,
            role: m.role,
            last: m.last,
            initials: m.initials || m.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "ME",
          })));
        })
        .catch((err) => {
          console.warn("Failed to fetch team members:", err);
          setMembers(INITIAL_MEMBERS);
        }),
      apiFetch<{ invitations: any[] }>("/team/invitations")
        .then((data) => {
          const list = data?.invitations || [];
          setPending(list.map((inv) => ({
            email: inv.email,
            role: inv.role,
            invited: inv.invited,
          })));
        })
        .catch((err) => {
          console.warn("Failed to fetch team invitations:", err);
          setPending(INITIAL_PENDING);
        })
    ]).then(() => {});
  }, [isMockMode]);

  React.useEffect(() => {
    if (isMockMode) {
      fetchTeamData();
      return;
    }
    setIsLoading(true);
    fetchTeamData().finally(() => {
      setIsLoading(false);
    });
  }, [isMockMode, fetchTeamData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (isMockMode) {
      if (pending.some((p) => p.email.toLowerCase() === email.toLowerCase()) || 
          members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
        toast.error(`${email} is already invited or a member of the workspace.`);
        return;
      }

      const newInvite: PendingInvite = {
        email,
        role,
        invited: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date()),
      };

      setPending((prev) => [newInvite, ...prev]);
      setOpen(false);
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setRole("Finance");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch<any>("/team/invite", "POST", { email, role });
      toast.success(`Invitation sent to ${email}`);
      fetchTeamData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setIsLoading(false);
      setOpen(false);
      setEmail("");
      setRole("Finance");
    }
  };

  const handleResend = async (emailAddress: string) => {
    if (isMockMode) {
      toast.success(`Invitation resent to ${emailAddress} (Mock Mode)`);
      return;
    }

    try {
      await apiFetch<any>(`/team/invitations/${emailAddress}/resend`, "POST", {});
      toast.success(`Invitation resent to ${emailAddress}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to resend invitation");
    }
  };

  const handleRevoke = async (emailAddress: string) => {
    if (isMockMode) {
      setPending((prev) => prev.filter((p) => p.email !== emailAddress));
      toast.success(`Invitation revoked for ${emailAddress} (Mock Mode)`);
      return;
    }

    try {
      await apiFetch<any>(`/team/invitations/${emailAddress}/revoke`, "DELETE", {});
      toast.success(`Invitation revoked for ${emailAddress}`);
      fetchTeamData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to revoke invitation");
    }
  };

  if (isLoading && !isMockMode) {
    return (
      <AppShell eyebrow="Loading..." title="Team & access">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Active members shimmer */}
          <SectionCard title="Active members">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full bg-ink/10" />
                    <div>
                      <Skeleton className="h-4 w-28 bg-ink/10" />
                      <Skeleton className="mt-1 h-3.5 w-40 bg-ink/10" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 bg-ink/10" />
                    <Skeleton className="mt-1 h-3.5 w-12 bg-ink/10" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Pending invitations shimmer */}
          <SectionCard title="Pending invitations">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <Skeleton className="h-4 w-40 bg-ink/10" />
                    <Skeleton className="mt-1 h-3.5 w-16 bg-ink/10" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 bg-ink/10" />
                    <Skeleton className="h-8 w-16 bg-ink/10" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow={`${members.length} active · ${pending.length} pending`}
      title="Team & access"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90">
              <Plus className="h-4 w-4" /> Invite member
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-surface text-ink border border-line">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl tracking-tight text-ink">
                Invite team member
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-3">
                Send an invitation link to collaborate on this workspace.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-2">Work email address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. theo@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-2">Access tier / Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                >
                  <option>Owner</option>
                  <option>Admin</option>
                  <option>Finance</option>
                  <option>Developer</option>
                  <option>Read-only</option>
                </select>
              </div>

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
                  Send invite
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Members" padded={false}>
            <ul className="divide-y divide-line">
              {members.map((m) => (
                <li key={m.email} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-ink font-mono text-xs text-primary-foreground">
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{m.name}</div>
                    <div className="truncate text-xs text-ink-3">{m.email}</div>
                  </div>
                  <Pill tone={m.role === "Owner" ? "info" : "neutral"}>{m.role}</Pill>
                  <div className="hidden w-28 text-right text-xs text-ink-3 md:block">{m.last}</div>
                  <button className="text-xs text-ink-3 hover:text-ink">···</button>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Pending invitations">
            {pending.length === 0 ? (
              <p className="text-sm text-ink-3 py-4 text-center">No pending invitations.</p>
            ) : (
              <ul className="space-y-2">
                {pending.map((p) => (
                  <li key={p.email} className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2.5 text-sm">
                    <div>
                      <div className="font-medium text-ink">{p.email}</div>
                      <div className="text-xs text-ink-3">Invited {p.invited}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill tone="warning">{p.role}</Pill>
                      <button 
                        onClick={() => handleResend(p.email)}
                        className="text-xs text-cobalt hover:underline cursor-pointer"
                      >
                        Resend
                      </button>
                      <button 
                        onClick={() => handleRevoke(p.email)}
                        className="text-xs text-ink-3 hover:text-destructive cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Roles" description="Built-in access tiers">
          <ul className="space-y-3 text-sm">
            {[
              ["Owner", "Full access including billing & legal."],
              ["Admin", "All product surfaces. Cannot delete workspace."],
              ["Finance", "Treasury, payouts, invoices, reports."],
              ["Developer", "API keys, webhooks, logs, sandbox."],
              ["Read-only", "View dashboards and reports."],
            ].map(([k, v]) => (
              <li key={k} className="rounded-md border border-line bg-surface-2 px-3 py-2.5">
                <div className="font-medium text-ink">{k}</div>
                <div className="text-xs text-ink-3">{v}</div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}
