import { createFileRoute } from "@tanstack/react-router";
import { Copy, Plus, Webhook } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { AppShell, Pill, SectionCard } from "@/components/app-shell";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";
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

export const Route = createFileRoute("/developer")({
  head: () => ({ meta: [{ title: "Developer — Zia Merchant" }] }),
  component: Developer,
});

interface ApiKey {
  name: string;
  key: string;
  env: string;
  last: string;
}

interface WebhookEndpoint {
  url: string;
  events: number;
  status: string;
}

const INITIAL_KEYS: ApiKey[] = [
  { name: "Production · Server", key: "sk_live_••••_8Q21f3", env: "live", last: "12 min ago" },
  { name: "Production · Publishable", key: "pk_live_••••_X4nP", env: "live", last: "3 min ago" },
  { name: "Sandbox · Server", key: "sk_test_••••_M0e2a", env: "test", last: "1h ago" },
];

const INITIAL_HOOKS: WebhookEndpoint[] = [
  { url: "https://api.acme.com/zia/webhook", events: 24, status: "Healthy" },
  { url: "https://ops.acme.com/zia/disputes", events: 4, status: "Healthy" },
  { url: "https://staging.acme.com/zia", events: 0, status: "Paused" },
];

function Developer() {
  const { isMockMode } = useApiMode();
  const [keys, setKeys] = React.useState<ApiKey[]>(INITIAL_KEYS);
  const [hooks, setHooks] = React.useState<WebhookEndpoint[]>(INITIAL_HOOKS);
  const [isLoading, setIsLoading] = React.useState(false);

  // Key creation state
  const [keyDialogOpen, setKeyDialogOpen] = React.useState(false);
  const [keyName, setKeyName] = React.useState("");
  const [keyEnv, setKeyEnv] = React.useState("live");
  const [keyType, setKeyType] = React.useState("Server");

  // Webhook addition state
  const [hookDialogOpen, setHookDialogOpen] = React.useState(false);
  const [hookUrl, setHookUrl] = React.useState("");
  const [hookStatus, setHookStatus] = React.useState("Healthy");

  const fetchKeys = React.useCallback(() => {
    if (isMockMode) {
      setKeys(INITIAL_KEYS);
      return;
    }
    apiFetch<any>("/developer/keys")
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.keys || []);
        const mapped = list.map((k: any) => ({
          name: k.name || `${k.type || "Secret"} Key`,
          key: k.key,
          env: k.env || "live",
          last: k.lastUsed || "Never",
        }));
        setKeys(mapped);
      })
      .catch((err) => {
        console.warn("Failed to fetch live API keys:", err);
        setKeys(INITIAL_KEYS);
      });
  }, [isMockMode]);

  const fetchWebhooks = React.useCallback(() => {
    if (isMockMode) {
      setHooks(INITIAL_HOOKS);
      return;
    }
    apiFetch<any>("/developer/webhooks")
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.webhooks || []);
        const mapped = list.map((h: any) => ({
          url: h.url,
          events: h.events ?? 0,
          status: h.status === "active" ? "Healthy" : (h.status === "inactive" ? "Paused" : (h.status || "Healthy")),
        }));
        setHooks(mapped);
      })
      .catch((err) => {
        console.warn("Failed to fetch live webhooks:", err);
        setHooks(INITIAL_HOOKS);
      });
  }, [isMockMode]);

  React.useEffect(() => {
    fetchKeys();
    fetchWebhooks();
  }, [fetchKeys, fetchWebhooks]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;

    if (isMockMode) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const prefix = keyType === "Server" ? "sk" : "pk";
      const generatedKey = `${prefix}_${keyEnv}_••••_${randomSuffix}`;

      const newKey: ApiKey = {
        name: `${keyName} · ${keyType}`,
        key: generatedKey,
        env: keyEnv,
        last: "Just now",
      };

      setKeys((prev) => [newKey, ...prev]);
      setKeyDialogOpen(false);
      toast.success(`API Key "${newKey.name}" created successfully`);
      setKeyName("");
      setKeyEnv("live");
      setKeyType("Server");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch<any>("/developer/keys/create", "POST", {
        name: keyName,
        env: keyEnv,
        type: keyType === "Server" ? "Secret" : "Publishable",
      });
      toast.success(`API Key "${keyName}" created successfully`);
      fetchKeys();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create API key");
    } finally {
      setIsLoading(false);
      setKeyDialogOpen(false);
      setKeyName("");
      setKeyEnv("live");
      setKeyType("Server");
    }
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hookUrl) return;

    // Check URL validity
    try {
      new URL(hookUrl);
    } catch {
      toast.error("Please enter a valid URL (e.g. https://api.example.com)");
      return;
    }

    if (isMockMode) {
      if (hooks.some((h) => h.url.toLowerCase() === hookUrl.toLowerCase())) {
        toast.error("This webhook endpoint is already registered.");
        return;
      }

      const newHook: WebhookEndpoint = {
        url: hookUrl,
        events: 0,
        status: hookStatus,
      };

      setHooks((prev) => [newHook, ...prev]);
      setHookDialogOpen(false);
      toast.success(`Webhook endpoint registered for ${hookUrl}`);
      setHookUrl("");
      setHookStatus("Healthy");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch<any>("/developer/webhooks/create", "POST", {
        url: hookUrl,
        status: hookStatus === "Healthy" ? "active" : "inactive",
      });
      toast.success(`Webhook endpoint registered for ${hookUrl}`);
      fetchWebhooks();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to register webhook");
    } finally {
      setIsLoading(false);
      setHookDialogOpen(false);
      setHookUrl("");
      setHookStatus("Healthy");
    }
  };

  const handleCopyKey = (keyString: string) => {
    navigator.clipboard.writeText(keyString);
    toast.success("API Key copied to clipboard");
  };

  return (
    <AppShell
      eyebrow="API · Webhooks · Logs"
      title="Developer"
      actions={
        <>
          <Dialog open={hookDialogOpen} onOpenChange={setHookDialogOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2 cursor-pointer">
                <Webhook className="h-4 w-4" /> Add webhook
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-surface text-ink border border-line">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl tracking-tight text-ink">
                  Add webhook endpoint
                </DialogTitle>
                <DialogDescription className="text-xs text-ink-3">
                  Register a destination URL to receive real-time updates from your ledger.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddWebhook} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-ink-2">Endpoint URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.acme.com/zia/webhook"
                    value={hookUrl}
                    onChange={(e) => setHookUrl(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ink-2">Initial Status</label>
                  <select
                    value={hookStatus}
                    onChange={(e) => setHookStatus(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                  >
                    <option>Healthy</option>
                    <option>Paused</option>
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
                    Add endpoint
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90 cursor-pointer">
                <Plus className="h-4 w-4" /> Create key
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-surface text-ink border border-line">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl tracking-tight text-ink">
                  Create API Key
                </DialogTitle>
                <DialogDescription className="text-xs text-ink-3">
                  Provision a new key to authenticate requests with the Zia SDK.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-ink-2">Key label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Server Production"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink-2">Environment</label>
                    <select
                      value={keyEnv}
                      onChange={(e) => setKeyEnv(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                    >
                      <option value="live">live</option>
                      <option value="test">test</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-2">Type</label>
                    <select
                      value={keyType}
                      onChange={(e) => setKeyType(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
                    >
                      <option value="Server">Server</option>
                      <option value="Publishable">Publishable</option>
                    </select>
                  </div>
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
                    Create key
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="API keys" description="Rotate frequently. Never embed live keys client-side." padded={false}>
            <ul className="divide-y divide-line">
              {keys.map((k) => (
                <li key={k.key} className="flex items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{k.name}</span>
                      <Pill tone={k.env === "live" ? "danger" : "info"}>{k.env}</Pill>
                    </div>
                    <code className="mt-1 block truncate font-mono text-xs text-ink-3">{k.key}</code>
                  </div>
                  <div className="hidden text-xs text-ink-3 md:block">Used {k.last}</div>
                  <button
                    onClick={() => handleCopyKey(k.key)}
                    title="Copy to clipboard"
                    className="grid h-8 w-8 place-items-center rounded-md border border-line text-ink-2 hover:bg-surface-2 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Webhook endpoints" padded={false}>
            {hooks.length === 0 ? (
              <p className="text-sm text-ink-3 py-6 text-center">No webhook endpoints registered.</p>
            ) : (
              <ul className="divide-y divide-line">
                {hooks.map((h) => (
                  <li key={h.url} className="flex items-center gap-4 px-5 py-3.5">
                    <Webhook className="h-4 w-4 text-ink-3" />
                    <div className="min-w-0 flex-1">
                      <code className="block truncate text-sm text-ink">{h.url}</code>
                      <div className="text-xs text-ink-3">{h.events} events / hour</div>
                    </div>
                    <Pill tone={h.status === "Healthy" ? "success" : "neutral"}>{h.status}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Quickstart" description="Authorize, charge, and listen — in three calls.">
            <pre className="overflow-x-auto rounded-lg border border-line bg-ink p-5 font-mono text-xs leading-relaxed text-primary-foreground">
{`import { Zia } from "@zia/sdk";
 
const zia = new Zia(process.env.ZIA_SECRET);

const charge = await zia.charges.create({
  amount: 12_50,           // cents
  currency: "USD",
  customer: "cus_8K2X1B",
  idempotency_key: orderId,
});

console.log(charge.id, charge.status);
// → "ch_8K3JZ7", "succeeded"`}
            </pre>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Environment">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-2">API version</span>
                <code className="font-mono text-xs text-ink">2026-09-01</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-2">SDK</span>
                <code className="font-mono text-xs text-ink">@zia/sdk@4.12.0</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-2">Region</span>
                <code className="font-mono text-xs text-ink">us-east-1</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-2">Webhook secret</span>
                <code className="font-mono text-xs text-ink">whsec_••••</code>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recent events" padded={false}>
            <ul className="divide-y divide-line text-sm">
              {[
                ["charge.succeeded", "200", "10:42:14"],
                ["payout.created", "200", "10:31:02"],
                ["dispute.opened", "200", "08:47:33"],
                ["customer.updated", "200", "08:12:01"],
                ["charge.refunded", "200", "07:55:40"],
              ].map(([e, s, t]) => (
                <li key={t} className="flex items-center justify-between px-5 py-2.5">
                  <code className="font-mono text-xs text-ink">{e}</code>
                  <div className="flex items-center gap-2 text-xs text-ink-3">
                    <span className="rounded bg-success/15 px-1.5 py-0.5 font-mono text-[10px] text-success">{s}</span>
                    {t}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
