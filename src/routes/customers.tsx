import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, Mail, MapPin, Phone, Plus, Search, User, Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useApiMode } from "@/hooks/use-api-mode";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

import { AppShell, Pill, SectionCard, StatCard } from "@/components/app-shell";
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

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Zia Merchant" }] }),
  component: Customers,
});

interface CustomerItem {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  volume: string;
  numericVolume: number;
  ltv: string;
  numericLtv: number;
  joined: string;
  status: "Active" | "Inactive";
  tone: "success" | "neutral";
  initials: string;
  paymentMethod: string;
  recentCharges: { id: string; date: string; desc: string; amount: string; status: string; tone: "success" | "warning" | "danger" | "neutral" }[];
}

const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: "cus_8K2X1B",
    name: "Marta Chen",
    company: "Northwind Aero",
    email: "marta@northwind.aero",
    phone: "+1 (415) 304-2091",
    location: "San Francisco, CA",
    volume: "$182,400.00",
    numericVolume: 182400,
    ltv: "$42,500.00",
    numericLtv: 42500,
    joined: "Jan 12, 2026",
    status: "Active",
    tone: "success",
    initials: "MC",
    paymentMethod: "ACH · Chase •••• 5512",
    recentCharges: [
      { id: "ch_8K2XZ7", date: "Today, 10:31", desc: "Subscription · Enterprise", amount: "+$8,400.00", status: "Succeeded", tone: "success" },
      { id: "ch_7F3Q2Y", date: "Jun 24, 09:00", desc: "Invoice #INV-2841", amount: "+$34,100.00", status: "Succeeded", tone: "success" },
    ],
  },
  {
    id: "cus_8J4Z1D",
    name: "Sarah Jenkins",
    company: "Jenkins Retail LLC",
    email: "sarah@jenkinsretail.com",
    phone: "+1 (650) 412-9908",
    location: "Los Angeles, CA",
    volume: "$24,500.00",
    numericVolume: 24500,
    ltv: "$12,400.00",
    numericLtv: 12400,
    joined: "Feb 22, 2026",
    status: "Active",
    tone: "success",
    initials: "SJ",
    paymentMethod: "Card · Visa •••• 4242",
    recentCharges: [
      { id: "ch_8K3JZ7", date: "Today, 10:42", desc: "Invoice #INV-3041", amount: "+$1,250.00", status: "Succeeded", tone: "success" },
      { id: "ch_8F2P1X", date: "Jun 18, 14:12", desc: "Invoice #INV-2710", amount: "+$11,150.00", status: "Succeeded", tone: "success" },
    ],
  },
  {
    id: "cus_8K2Q5L",
    name: "Cooper & Hale LLC",
    company: "Cooper & Hale",
    email: "billing@cooperhale.com",
    phone: "+1 (212) 555-0182",
    location: "New York, NY",
    volume: "$48,000.00",
    numericVolume: 48000,
    ltv: "$3,000.00",
    numericLtv: 3000,
    joined: "May 04, 2026",
    status: "Active",
    tone: "success",
    initials: "CH",
    paymentMethod: "Wire · BofA •••• 4921",
    recentCharges: [
      { id: "ch_8K2Q5L", date: "Today, 10:18", desc: "Retainer", amount: "+$3,000.00", status: "Pending", tone: "warning" },
      { id: "ch_7A1N9Z", date: "May 15, 11:22", desc: "Consulting Fee", amount: "+$45,000.00", status: "Succeeded", tone: "success" },
    ],
  },
  {
    id: "cus_8K1YA0",
    name: "Lina Park",
    company: "Studio Park Inc",
    email: "lina@studiopark.design",
    phone: "+1 (206) 881-2290",
    location: "Seattle, WA",
    volume: "$14,200.00",
    numericVolume: 14200,
    ltv: "$5,800.00",
    numericLtv: 5800,
    joined: "Mar 18, 2026",
    status: "Active",
    tone: "success",
    initials: "LP",
    paymentMethod: "Card · Mastercard •••• 9921",
    recentCharges: [
      { id: "ch_8K1YA0", date: "Today, 09:51", desc: "Refund · #INV-2998", amount: "−$420.00", status: "Refunded", tone: "neutral" },
      { id: "ch_7V9M1S", date: "Jun 12, 16:30", desc: "License Fee", amount: "+$6,220.00", status: "Succeeded", tone: "success" },
    ],
  },
  {
    id: "cus_8K0MQ3",
    name: "Quanta Logistics",
    company: "Quanta Corp",
    email: "ops@quanta-logistics.com",
    phone: "+44 20 7946 0958",
    location: "London, UK",
    volume: "$310,000.00",
    numericVolume: 310000,
    ltv: "$58,000.00",
    numericLtv: 58000,
    joined: "Apr 01, 2026",
    status: "Active",
    tone: "success",
    initials: "QL",
    paymentMethod: "Wire · HSBC •••• 1142",
    recentCharges: [
      { id: "ch_8K0MQ3", date: "Today, 09:22", desc: "Wire in", amount: "+$58,000.00", status: "Succeeded", tone: "success" },
      { id: "ch_7K2O1T", date: "May 28, 10:05", desc: "Monthly Retainer", amount: "+$252,000.00", status: "Succeeded", tone: "success" },
    ],
  },
  {
    id: "cus_8K0AVV",
    name: "Atlas Studio",
    company: "Atlas Agency",
    email: "accounting@atlas.agency",
    phone: "+1 (312) 555-0145",
    location: "Chicago, IL",
    volume: "$5,400.00",
    numericVolume: 5400,
    ltv: "$0.00",
    numericLtv: 0,
    joined: "Jun 20, 2026",
    status: "Inactive",
    tone: "neutral",
    initials: "AS",
    paymentMethod: "Card · Visa •••• 8831",
    recentCharges: [
      { id: "ch_8K0AVV", date: "Today, 08:47", desc: "Card · disputed", amount: "−$219.00", status: "Disputed", tone: "danger" },
      { id: "ch_8E1D9P", date: "Jun 20, 10:11", desc: "Setup Fee", amount: "+$5,619.00", status: "Succeeded", tone: "success" },
    ],
  },
];

function Customers() {
  const { isMockMode } = useApiMode();
  const [customers, setCustomers] = React.useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>(INITIAL_CUSTOMERS[0].id);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (isMockMode) {
      setCustomers(INITIAL_CUSTOMERS);
      return;
    }

    setIsLoading(true);
    apiFetch<{ customers: CustomerItem[] }>("/customers")
      .then((data) => {
        const mapped = data.customers.map((c) => ({
          ...c,
          tone: (c.status === "Active" ? "success" : "neutral") as "success" | "neutral",
          numericVolume: c.numericVolume || parseFloat(c.volume.replace(/[^0-9.-]/g, "")) || 0,
          numericLtv: c.numericLtv || parseFloat(c.ltv.replace(/[^0-9.-]/g, "")) || 0,
          initials: c.initials || c.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "CU",
          recentCharges: c.recentCharges || [],
        }));
        setCustomers(mapped);
      })
      .catch(() => {
        setCustomers(INITIAL_CUSTOMERS);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isMockMode]);

  React.useEffect(() => {
    if (isMockMode || !selectedCustomerId) return;

    apiFetch<{ charges: any[] }>(`/customers/${selectedCustomerId}/charges`)
      .then((data) => {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === selectedCustomerId) {
              return {
                ...c,
                recentCharges: data.charges.map((ch) => ({
                  ...ch,
                  tone: (ch.status === "Succeeded" ? "success" : ch.status === "Pending" ? "warning" : ch.status === "Refunded" ? "neutral" : "danger") as any,
                })),
              };
            }
            return c;
          })
        );
      })
      .catch(() => {
        // Safe to ignore, fallback logic maintains state
      });
  }, [selectedCustomerId, isMockMode]);

  const [statusFilter, setStatusFilter] = React.useState<"All" | "Active" | "Inactive">("All");
  const [open, setOpen] = React.useState(false);

  // Form State
  const [name, setName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [initialVolume, setInitialVolume] = React.useState("");

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const numVolume = parseFloat(initialVolume) || 0;

    const newId = `cus_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "CU";

    const newCustomer: CustomerItem = {
      id: newId,
      name,
      company,
      email,
      phone,
      location: location || "Remote",
      volume: `$${numVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      numericVolume: numVolume,
      ltv: `$${numVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      numericLtv: numVolume,
      joined: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
      status: "Active",
      tone: "success",
      initials,
      paymentMethod: "Card · Visa •••• 9999",
      recentCharges: numVolume > 0 ? [
        { id: `ch_${Math.random().toString(36).substring(2, 8).toUpperCase()}`, date: "Just now", desc: "Initial Deposit", amount: `+$${numVolume.toLocaleString()}`, status: "Succeeded", tone: "success" }
      ] : [],
    };

    if (!isMockMode) {
      apiFetch<any>("/customers/create", "POST", {
        name,
        company,
        email,
        phone,
        location,
        initialVolume: numVolume,
      })
        .then((createdCustomer) => {
          const mapped: CustomerItem = {
            id: createdCustomer.id || newId,
            name: createdCustomer.name || name,
            company: createdCustomer.company || company,
            email: createdCustomer.email || email,
            phone: createdCustomer.phone || phone,
            location: createdCustomer.location || location || "Remote",
            volume: createdCustomer.volume || `$${numVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            numericVolume: numVolume,
            ltv: createdCustomer.ltv || `$${numVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            numericLtv: numVolume,
            joined: createdCustomer.joined || new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
            status: "Active",
            tone: "success",
            initials: createdCustomer.initials || initials,
            paymentMethod: createdCustomer.paymentMethod || "Card · Visa •••• 9999",
            recentCharges: createdCustomer.recentCharges || (numVolume > 0 ? [
              { id: `ch_${Math.random().toString(36).substring(2, 8).toUpperCase()}`, date: "Just now", desc: "Initial Deposit", amount: `+$${numVolume.toLocaleString()}`, status: "Succeeded", tone: "success" }
            ] : []),
          };
          setCustomers((prev) => [mapped, ...prev]);
          setSelectedCustomerId(mapped.id);
          toast.success(`Customer ${mapped.name} created successfully via Live API`);
        })
        .catch(() => {
          setCustomers((prev) => [newCustomer, ...prev]);
          setSelectedCustomerId(newId);
        });
    } else {
      setCustomers((prev) => [newCustomer, ...prev]);
      setSelectedCustomerId(newId);
      toast.success(`Customer ${name} added successfully`);
    }
    setOpen(false);

    // Reset Form
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setLocation("");
    setInitialVolume("");
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || filteredCustomers[0] || customers[0];

  // Calculate totals
  const totalVolume = customers.reduce((sum, c) => sum + c.numericVolume, 0);
  const activeCount = customers.filter((c) => c.status === "Active").length;

  if (isLoading && !isMockMode) {
    return (
      <AppShell eyebrow="Overview" title="Customers">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-line bg-card p-5">
              <Skeleton className="h-4 w-24 bg-ink/10" />
              <Skeleton className="mt-3 h-8 w-32 bg-ink/10" />
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard padded={false}>
              <div className="p-4 border-b border-line">
                <Skeleton className="h-9 w-full bg-ink/10" />
              </div>
              <div className="space-y-4 p-5">
                {[1, 2, 3, 4, 5].map((k) => (
                  <div key={k} className="flex justify-between items-center py-2">
                    <Skeleton className="h-4 w-40 bg-ink/10" />
                    <Skeleton className="h-4 w-24 bg-ink/10" />
                    <Skeleton className="h-4 w-16 bg-ink/10" />
                    <Skeleton className="h-6 w-20 bg-ink/10" />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
          <div className="lg:col-span-1">
            <SectionCard>
              <Skeleton className="h-12 w-12 rounded-full bg-ink/10" />
              <Skeleton className="mt-4 h-6 w-48 bg-ink/10" />
              <Skeleton className="mt-2 h-4 w-32 bg-ink/10" />
              <div className="mt-6 space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 bg-ink/10" />
                    <Skeleton className="h-4 w-24 bg-ink/10" />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Directory & activity"
      title="Customers"
      actions={
        <>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-2">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-primary-foreground hover:bg-ink/90">
                <Plus className="h-4 w-4" /> Add customer
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-surface text-ink border border-line">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl tracking-tight text-ink">
                  Add customer
                </DialogTitle>
                <DialogDescription className="text-xs text-ink-3">
                  Register a customer workspace in your ledger directory.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Customer name"
                    required
                    placeholder="Elena Mendes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Field
                    label="Company / Entity"
                    required
                    placeholder="Acme Corp."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Work email"
                    required
                    type="email"
                    placeholder="elena@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Field
                    label="Phone number"
                    placeholder="+1 (555) 019-2810"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Location"
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Field
                    label="Initial Volume (USD)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialVolume}
                    onChange={(e) => setInitialVolume(e.target.value)}
                  />
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
                    Create customer
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total customers" value={customers.length.toString()} />
        <StatCard label="Active subscriptions" value={activeCount.toString()} />
        <StatCard
          label="Total processed volume"
          value={`$${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          delta="▲ 14.2%"
          hint="vs last month"
          tone="up"
        />
        <StatCard label="Average Customer LTV" value="$21,083.33" hint="LTV across core tiers" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Main List */}
        <div className="lg:col-span-8">
          <SectionCard padded={false}>
            <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-line bg-surface-2 px-3 text-sm text-ink-3 focus-within:border-ink/40">
                <Search className="h-4 w-4" />
                <input
                  className="h-full w-full border-none bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-0"
                  placeholder="Search customers by name, entity, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(["All", "Active", "Inactive"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setStatusFilter(t)}
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === t
                        ? "border-ink bg-ink text-primary-foreground"
                        : "border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 text-right font-medium">Volume</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-ink-3 font-medium">
                        No customers found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`cursor-pointer hover:bg-surface-2/60 transition-colors ${
                          selectedCustomerId === c.id ? "bg-surface-2/80" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-ink font-mono text-[10px] text-primary-foreground">
                            {c.initials}
                          </div>
                          <div>
                            <div className="font-medium text-ink leading-tight">{c.name}</div>
                            <div className="text-xs text-ink-3 mt-0.5">{c.company}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-ink-2 tabular">{c.joined}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-ink">{c.volume}</td>
                        <td className="px-5 py-3.5">
                          <Pill tone={c.tone}>{c.status}</Pill>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Details Pane */}
        {selectedCustomer && (
          <aside className="lg:col-span-4 space-y-4">
            <SectionCard title="Customer details">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-ink font-display text-lg text-primary-foreground">
                  {selectedCustomer.initials}
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink leading-none">{selectedCustomer.name}</h3>
                  <p className="text-xs text-ink-3 mt-1.5">{selectedCustomer.company}</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3.5 border-t border-line pt-5 text-sm">
                <li className="flex items-center gap-2.5 text-ink-2">
                  <User className="h-4 w-4 text-ink-3 shrink-0" />
                  <span className="font-mono text-xs">{selectedCustomer.id}</span>
                </li>
                <li className="flex items-center gap-2.5 text-ink-2 truncate">
                  <Mail className="h-4 w-4 text-ink-3 shrink-0" />
                  <span className="truncate">{selectedCustomer.email}</span>
                </li>
                <li className="flex items-center gap-2.5 text-ink-2">
                  <Phone className="h-4 w-4 text-ink-3 shrink-0" />
                  <span>{selectedCustomer.phone}</span>
                </li>
                <li className="flex items-center gap-2.5 text-ink-2">
                  <MapPin className="h-4 w-4 text-ink-3 shrink-0" />
                  <span>{selectedCustomer.location}</span>
                </li>
              </ul>

              <div className="mt-6 border-t border-line pt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-3 font-mono text-xs uppercase tracking-wider">Processed</span>
                  <span className="font-mono text-ink font-medium">{selectedCustomer.volume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-3 font-mono text-xs uppercase tracking-wider">LTV</span>
                  <span className="font-mono text-ink font-medium">{selectedCustomer.ltv}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-3 font-mono text-xs uppercase tracking-wider">Payment rail</span>
                  <span className="text-ink-2 font-medium text-xs text-right leading-tight max-w-[200px]">
                    {selectedCustomer.paymentMethod}
                  </span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Recent transactions" padded={false}>
              <ul className="divide-y divide-line">
                {selectedCustomer.recentCharges.length === 0 ? (
                  <li className="px-5 py-6 text-center text-xs text-ink-3">No recent transaction volume.</li>
                ) : (
                  selectedCustomer.recentCharges.map((ch) => (
                    <li key={ch.id} className="px-5 py-3.5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-medium text-ink">{ch.desc}</div>
                        <div className="text-ink-3 font-mono mt-0.5">{ch.date}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono font-medium ${ch.amount.startsWith("−") ? "text-destructive" : "text-ink"}`}>{ch.amount}</div>
                        <div className="mt-1">
                          <Pill tone={ch.tone}>{ch.status}</Pill>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </SectionCard>
          </aside>
        )}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      <label className="text-xs font-medium text-ink-2">{label}</label>
      <input
        {...rest}
        className="mt-1.5 h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-cobalt/30"
      />
    </div>
  );
}
