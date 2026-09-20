import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  ShoppingBag,
  Users,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Lock,
  Search,
  DollarSign,
  Receipt,
  CreditCard,
  Wallet,
  ArrowUpRight,
  PieChart,
  Activity,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  component: AdminPage,
});

type SuperAdminTab =
  | "governance"
  | "financial-intelligence"
  | "owners"
  | "error-monitoring"
  | "page-engagement"
  | "audit-logs";

interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: string;
  user?: {
    email: string | null;
    phone: string | null;
    role: string;
  } | null;
}

interface OwnerItem {
  id: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  ownerProfile?: {
    fullName: string;
    storeId?: string;
  };
}

interface AdminFinanceData {
  period: string;
  summary: {
    totalPlatformGMV: number;
    totalPlatformNet: number;
    globalAOV: number;
    totalPlatformOrders: number;
    platformFeeRate: number;
    platformRevenue: number;
    growthRateMoM: number;
  };
  revenueTrends: Array<{
    month: string;
    gmv: number;
    orders: number;
    platformFees: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    units: number;
    sharePercent: number;
  }>;
  paymentMethods: Array<{
    method: string;
    label: string;
    amount: number;
    count: number;
    sharePercent: number;
  }>;
  recentHighValueTransactions: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerPhone: string;
    itemsSummary: string;
    amount: number;
    paymentMethod: string;
    date: string;
    status: "PAID" | "PENDING";
  }>;
}

interface SystemErrorIncident {
  id: string;
  type: string;
  statusCode: number;
  method?: string;
  endpoint: string;
  message: string;
  stackTrace?: string;
  source: "BACKEND_API" | "FRONTEND_CLIENT";
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  count: number;
  firstOccurredAt: string;
  lastOccurredAt: string;
  userAgent?: string;
  ipAddress?: string;
}

interface ErrorMonitoringSummary {
  totalErrors: number;
  criticalErrors: number;
  unresolvedErrors: number;
  clientErrors: number;
  systemHealth: "OPTIMAL" | "DEGRADED" | "NEEDS_ATTENTION";
  errorRatePercent: number;
  lastIncidentAt?: string;
  incidents: SystemErrorIncident[];
}

interface PageEngagementMetric {
  pagePath: string;
  pageTitle: string;
  totalActiveSeconds: number;
  totalActiveMinutes: number;
  totalViews: number;
  uniqueVisitors: number;
  averageDwellSeconds: number;
  sharePercent: number;
  rank: number;
}

interface AnalyticsOverview {
  totalActiveMinutes: number;
  totalPageViews: number;
  liveOnline: number;
  topPages: PageEngagementMetric[];
  summary: {
    totalSessions: number;
    totalEvents: number;
    activeUsers: number;
    liveOnline: number;
    mostVisitedPage: string;
    highestDwellPage: string;
  };
}

export function AdminPage() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("governance");
  const [loading, setLoading] = useState(false);

  // Super Admin Data states
  const [owners, setOwners] = useState<OwnerItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [finance, setFinance] = useState<AdminFinanceData | null>(null);
  const [errorData, setErrorData] = useState<ErrorMonitoringSummary | null>(null);
  const [engagement, setEngagement] = useState<AnalyticsOverview | null>(null);

  // Filters & Search
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");
  const [errorSearch, setErrorSearch] = useState("");
  const [errorFilter, setErrorFilter] = useState<"ALL" | "CRITICAL" | "UNRESOLVED" | "CLIENT">("ALL");
  const [selectedIncident, setSelectedIncident] = useState<SystemErrorIncident | null>(null);

  // New Owner Form
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [creatingOwner, setCreatingOwner] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ownerRes, auditRes, financeRes, errorRes, engagementRes] = await Promise.all([
        apiRequest<OwnerItem[]>("/admin/owners"),
        apiRequest<AuditLogEntry[]>("/admin/audit-logs?limit=50"),
        apiRequest<AdminFinanceData>("/admin/finance"),
        apiRequest<ErrorMonitoringSummary>("/admin/error-monitoring"),
        apiRequest<AnalyticsOverview>("/admin/analytics/global"),
      ]);

      if (ownerRes.success && Array.isArray(ownerRes.data)) {
        setOwners(ownerRes.data);
      }
      if (auditRes.success && Array.isArray(auditRes.data)) {
        setAuditLogs(auditRes.data);
      }
      if (financeRes.success && financeRes.data) {
        setFinance(financeRes.data);
      }
      if (errorRes.success && errorRes.data) {
        setErrorData(errorRes.data);
      }
      if (engagementRes.success && engagementRes.data) {
        setEngagement(engagementRes.data);
      }
    } catch {
      // handled
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAdminData();
    }
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="surface-glass rounded-2xl p-8 shadow-lift">
          <ShieldCheck className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Super Admin Privileges Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only designated platform Super Administrators with 2FA authorization can access the platform governance console.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/login">Sign In with 2FA</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail || !ownerPassword || !ownerName) {
      toast.error("Please fill in owner name, email, and password.");
      return;
    }
    setCreatingOwner(true);
    const res = await apiRequest<OwnerItem>("/admin/owners", {
      method: "POST",
      body: JSON.stringify({
        fullName: ownerName.trim(),
        email: ownerEmail.trim().toLowerCase(),
        phone: ownerPhone.trim() || undefined,
        password: ownerPassword,
        storeId: "store-uttam-nagar-01",
      }),
    });
    setCreatingOwner(false);

    if (res.success && res.data) {
      toast.success("Store Owner onboarded successfully!");
      setOwners((prev) => [res.data!, ...prev]);
      setOwnerName("");
      setOwnerEmail("");
      setOwnerPhone("");
      setOwnerPassword("");
    } else {
      toast.error(res.message || "Failed to create owner account.");
    }
  };

  const handleToggleOwnerStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const res = await apiRequest(`/admin/owners/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      toast.success(`Owner status changed to ${newStatus}`);
      setOwners((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } else {
      toast.error("Failed to update owner status");
    }
  };

  const handleUpdateErrorStatus = async (id: string, status: "OPEN" | "INVESTIGATING" | "RESOLVED") => {
    const res = await apiRequest<{ data: SystemErrorIncident }>(`/admin/error-monitoring/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      toast.success(`Incident status updated to ${status}`);
      if (errorData) {
        setErrorData({
          ...errorData,
          incidents: errorData.incidents.map((i) => (i.id === id ? { ...i, status } : i)),
          unresolvedErrors: status === "RESOLVED" ? Math.max(0, errorData.unresolvedErrors - 1) : errorData.unresolvedErrors,
        });
      }
    } else {
      toast.error("Failed to update error status.");
    }
  };

  const handleClearResolvedErrors = async () => {
    const res = await apiRequest("/admin/error-monitoring/resolved", {
      method: "DELETE",
    });
    if (res.success) {
      toast.success("Cleared all resolved error incidents.");
      fetchAdminData();
    } else {
      toast.error("Failed to clear resolved errors.");
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (auditActionFilter !== "ALL" && !log.action.startsWith(auditActionFilter)) {
      return false;
    }
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      (log.user?.email && log.user.email.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  const filteredErrors = (errorData?.incidents || []).filter((inc) => {
    if (errorFilter === "CRITICAL" && inc.statusCode < 500) return false;
    if (errorFilter === "UNRESOLVED" && inc.status === "RESOLVED") return false;
    if (errorFilter === "CLIENT" && inc.source !== "FRONTEND_CLIENT") return false;

    if (!errorSearch.trim()) return true;
    const q = errorSearch.toLowerCase();
    return (
      inc.message.toLowerCase().includes(q) ||
      inc.endpoint.toLowerCase().includes(q) ||
      inc.type.toLowerCase().includes(q) ||
      inc.statusCode.toString().includes(q)
    );
  });

  const maxDwellSec = Math.max(
    ...(engagement?.topPages?.map((p) => p.totalActiveSeconds) || [100])
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-aurora py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Super Admin Top Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>PLATFORM GOVERNANCE CONSOLE</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
              Super Admin Control Plane
            </h1>
            <p className="text-sm text-muted-foreground">
              Role: <span className="font-semibold text-foreground">SUPER_ADMIN</span> · Platform Oversight · 2FA Enforced
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchAdminData} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/owner">Switch to Store View</Link>
            </Button>
          </div>
        </div>

        {/* Super Admin Navigation */}
        <div className="mt-8 border-b border-border/80">
          <nav className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("governance")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "governance"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Global Overview
            </button>
            <button
              onClick={() => setActiveTab("financial-intelligence")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "financial-intelligence"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Financial Intelligence
            </button>
            <button
              onClick={() => setActiveTab("page-engagement")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "page-engagement"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Clock className="h-4 w-4" /> Visitor Dwell Time & Engagement
            </button>
            <button
              onClick={() => setActiveTab("error-monitoring")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "error-monitoring"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Activity className="h-4 w-4" /> Error & Health Monitoring ({errorData?.unresolvedErrors || 0})
            </button>
            <button
              onClick={() => setActiveTab("owners")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "owners"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Users className="h-4 w-4" /> Store Owners ({owners.length})
            </button>
            <button
              onClick={() => setActiveTab("audit-logs")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "audit-logs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Lock className="h-4 w-4" /> Audit Trail (Read-Only)
            </button>
          </nav>
        </div>

        {/* Tab 1: Global Governance Overview */}
        {activeTab === "governance" ? (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Platform GMV</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">
                  ₹{(finance?.summary?.totalPlatformGMV || 0).toLocaleString("en-IN")}
                </div>
                <p className="mt-1 text-xs text-emerald-500 font-medium">Real-time order aggregation</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Total Orders</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-champagne/15 text-champagne">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">{finance?.summary?.totalPlatformOrders || 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">Orders placed by customers</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">System Health</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-2xl font-bold text-emerald-500">
                  {errorData?.systemHealth || "OPTIMAL"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {errorData?.unresolvedErrors || 0} active issue(s)
                </p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Live Visitors</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-500">
                    <Eye className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold text-sky-500">
                  {engagement?.liveOnline || 1} Online
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Active visible tab telemetry</p>
              </div>
            </div>

            {/* Quick Links & Dwell Time Spotlight */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Most Time Spent Pages Spotlight */}
              <div className="surface-glass rounded-2xl p-6 shadow-lift border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500" />
                    Top Customer Attention (Dwell Time)
                  </span>
                  <Button onClick={() => setActiveTab("page-engagement")} variant="ghost" size="sm" className="text-xs">
                    View Full Analysis <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
                <h3 className="text-base font-bold">Highest Dwell Time: {engagement?.summary?.highestDwellPage || "/shop"}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Visitors spend the longest continuous active minutes exploring eyewear catalogs and lens options.
                </p>
                <div className="space-y-3">
                  {(engagement?.topPages || []).slice(0, 3).map((p) => (
                    <div key={p.pagePath} className="rounded-lg bg-card/60 p-2.5 border border-border/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{p.pageTitle}</span>
                        <span className="font-mono font-bold text-primary">{p.totalActiveMinutes} min total</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-mono">{p.pagePath}</span>
                        <span>Avg: {Math.round(p.averageDwellSeconds / 60)}m {p.averageDwellSeconds % 60}s · {p.totalViews} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Monitoring Health Card */}
              <div className="surface-glass rounded-2xl p-6 shadow-lift border border-border/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-primary" />
                    Error & Health Diagnostics
                  </span>
                  <Button onClick={() => setActiveTab("error-monitoring")} variant="ghost" size="sm" className="text-xs">
                    View Error Stream <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
                <h3 className="text-base font-bold">
                  {errorData?.unresolvedErrors === 0 ? "All Systems Operational" : `${errorData?.unresolvedErrors} Incident(s) Recorded`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Real-time recording of backend API exceptions, client runtime errors, and network anomalies.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-border/70 bg-card p-3">
                    <span className="text-[11px] text-muted-foreground block">Critical 5xx Errors</span>
                    <span className="font-display text-xl font-bold text-destructive">{errorData?.criticalErrors || 0}</span>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-3">
                    <span className="text-[11px] text-muted-foreground block">Client Runtime Errors</span>
                    <span className="font-display text-xl font-bold text-amber-500">{errorData?.clientErrors || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab 2: Financial Intelligence */}
        {activeTab === "financial-intelligence" ? (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Platform Gross (GMV)</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">
                  ₹{(finance?.summary?.totalPlatformGMV || 0).toLocaleString("en-IN")}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Real-time Order Aggregation</span>
                </div>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Platform Net Revenue</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold text-emerald-500">
                  ₹{(finance?.summary?.totalPlatformNet || 0).toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Excluding cancellations</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Platform SaaS Fees</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-champagne/15 text-champagne">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">
                  ₹{(finance?.summary?.platformRevenue || 0).toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">At 2.5% platform rate</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Average Order Value (AOV)</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-500">
                    <Receipt className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">
                  ₹{(finance?.summary?.globalAOV || 0).toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  From {finance?.summary?.totalPlatformOrders || 0} total orders
                </p>
              </div>
            </div>

            {/* Category Breakdown & Payment Channels */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                  <PieChart className="h-5 w-5 text-primary" />
                  Live Category Revenue Breakdown
                </h3>
                <div className="space-y-4">
                  {(finance?.categoryBreakdown || []).map((cat, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">{cat.category}</span>
                        <span className="font-bold text-primary">₹{cat.revenue.toLocaleString("en-IN")} ({cat.sharePercent}%)</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.max(5, cat.sharePercent)}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {cat.units} units sold
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Live Payment Channels
                </h3>
                <div className="space-y-4">
                  {(finance?.paymentMethods || []).map((pm, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">{pm.label}</span>
                        <span className="font-bold text-primary">{pm.sharePercent}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.max(5, pm.sharePercent)}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                        <span>₹{pm.amount.toLocaleString("en-IN")}</span>
                        <span>{pm.count} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab 3: Visitor Dwell Time & Page Engagement */}
        {activeTab === "page-engagement" ? (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Total Active Dwell Time</span>
                <div className="mt-3 font-display text-3xl font-bold text-primary">
                  {engagement?.totalActiveMinutes || 0} mins
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Active visible attention recorded</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Total Page Views</span>
                <div className="mt-3 font-display text-3xl font-bold">
                  {engagement?.totalPageViews || 0}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Across all website sections</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Live Concurrent Visitors</span>
                <div className="mt-3 font-display text-3xl font-bold text-emerald-500">
                  {engagement?.liveOnline || 1} Online
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Real-time visible tab heartbeats</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Top Engagement Page</span>
                <div className="mt-3 font-display text-xl font-bold truncate text-primary">
                  {engagement?.topPages[0]?.pagePath || "/shop"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {engagement?.topPages[0]?.totalActiveMinutes || 0} mins continuous dwell
                </p>
              </div>
            </div>

            {/* Dwell Time Leaderboard */}
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Where Visitors Spend the Most Time (Page Dwell Leaderboard)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ranked by active continuous visible attention — excludes background/idle tabs
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                  <Activity className="h-3.5 w-3.5" /> Live Heartbeat Active
                </span>
              </div>

              <div className="space-y-4">
                {(engagement?.topPages || []).map((page) => {
                  const barWidth = Math.max(8, Math.round((page.totalActiveSeconds / maxDwellSec) * 100));
                  const avgMin = Math.floor(page.averageDwellSeconds / 60);
                  const avgSec = page.averageDwellSeconds % 60;

                  return (
                    <div
                      key={page.pagePath}
                      className="rounded-xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:border-primary/40"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary font-mono">
                            #{page.rank}
                          </span>
                          <div>
                            <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                              {page.pageTitle}
                              <span className="font-mono text-xs font-normal text-muted-foreground">
                                {page.pagePath}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {page.totalViews} page views · {page.uniqueVisitors} unique visitors
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:min-w-[140px]">
                          <div className="font-display text-base font-bold text-primary">
                            {page.totalActiveMinutes} mins
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Avg per visit: <span className="font-semibold text-foreground">{avgMin}m {avgSec}s</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Attention Share</span>
                          <span className="font-semibold text-primary">{page.sharePercent}% of total site time</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab 4: Error & System Health Monitoring */}
        {activeTab === "error-monitoring" ? (
          <div className="mt-8 space-y-8">
            {/* Top Diagnostics KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">System Status</span>
                <div className="mt-3 font-display text-2xl font-bold text-emerald-500">
                  {errorData?.systemHealth || "OPTIMAL"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Error rate: {errorData?.errorRatePercent || 0}%</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Total Incidents</span>
                <div className="mt-3 font-display text-3xl font-bold">
                  {errorData?.totalErrors || 0}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Aggregated error occurrences</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Unresolved Errors</span>
                <div className="mt-3 font-display text-3xl font-bold text-amber-500">
                  {errorData?.unresolvedErrors || 0}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Requiring investigation</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Critical 5xx Errors</span>
                <div className="mt-3 font-display text-3xl font-bold text-destructive">
                  {errorData?.criticalErrors || 0}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Server-side crashes</p>
              </div>
            </div>

            {/* Error Incidents Table */}
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-destructive" />
                    Live System & Client Error Incidents Log
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time error stream with deduplication, stack inspection, and resolution workflow.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search error, endpoint..."
                      value={errorSearch}
                      onChange={(e) => setErrorSearch(e.target.value)}
                      className="h-8 pl-8 text-xs w-48"
                    />
                  </div>

                  <select
                    value={errorFilter}
                    onChange={(e) => setErrorFilter(e.target.value as any)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="ALL">All Errors</option>
                    <option value="CRITICAL">Critical (5xx)</option>
                    <option value="UNRESOLVED">Unresolved</option>
                    <option value="CLIENT">Client Exceptions</option>
                  </select>

                  <Button size="sm" variant="outline" onClick={handleClearResolvedErrors} className="h-8 text-xs">
                    <Trash2 className="h-3 w-3 mr-1 text-muted-foreground" /> Clear Resolved
                  </Button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/70 text-muted-foreground uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Type / Code</th>
                      <th className="py-2.5 px-3">Endpoint / Source</th>
                      <th className="py-2.5 px-3">Error Message</th>
                      <th className="py-2.5 px-3">Count</th>
                      <th className="py-2.5 px-3">Last Occurred</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredErrors.map((inc) => (
                      <tr key={inc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              inc.status === "RESOLVED"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : inc.status === "INVESTIGATING"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {inc.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-foreground block">
                            HTTP {inc.statusCode}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{inc.type}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-xs font-medium text-foreground">{inc.endpoint}</div>
                          <span className="text-[10px] text-muted-foreground">{inc.source}</span>
                        </td>
                        <td className="py-3 px-3 max-w-sm">
                          <div className="font-medium text-foreground line-clamp-2">{inc.message}</div>
                          {inc.stackTrace ? (
                            <button
                              onClick={() => setSelectedIncident(inc)}
                              className="text-[10px] text-primary underline mt-0.5 block hover:text-primary/80"
                            >
                              View Stack Trace
                            </button>
                          ) : null}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-foreground">
                          {inc.count}x
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(inc.lastOccurredAt).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inc.status !== "RESOLVED" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateErrorStatus(inc.id, "RESOLVED")}
                                className="h-7 text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Resolve
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateErrorStatus(inc.id, "OPEN")}
                                className="h-7 text-[10px] text-muted-foreground"
                              >
                                Reopen
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredErrors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No error incidents matching your filter. System healthy!
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stack Trace Modal */}
            {selectedIncident ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="surface-glass rounded-2xl p-6 shadow-lift max-w-2xl w-full max-h-[85vh] flex flex-col border border-border">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div>
                      <h4 className="font-display font-bold text-base text-destructive">
                        Error Diagnostic Details
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedIncident.method} {selectedIncident.endpoint} · HTTP {selectedIncident.statusCode}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIncident(null)}>
                      Close
                    </Button>
                  </div>
                  <div className="mt-4 flex-1 overflow-y-auto space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Message</span>
                      <p className="mt-1 text-sm font-mono bg-muted p-2.5 rounded-lg text-foreground">
                        {selectedIncident.message}
                      </p>
                    </div>
                    {selectedIncident.stackTrace ? (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Stack Trace</span>
                        <pre className="mt-1 text-[11px] font-mono bg-muted/80 p-3 rounded-lg overflow-x-auto text-muted-foreground whitespace-pre-wrap">
                          {selectedIncident.stackTrace}
                        </pre>
                      </div>
                    ) : null}
                    {selectedIncident.userAgent ? (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase">User Agent</span>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedIncident.userAgent}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Tab 5: Store Owners Management */}
        {activeTab === "owners" ? (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Onboard Store Owner
                </h3>
                <form onSubmit={handleCreateOwner} className="mt-4 space-y-4">
                  <div>
                    <Label className="text-xs">Owner Full Name</Label>
                    <Input
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Official Email</Label>
                    <Input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="owner@nayantaraopticals.com"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Phone Number</Label>
                    <Input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="+91 9876543211"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Initial Password</Label>
                    <Input
                      type="password"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" disabled={creatingOwner} variant="hero" className="w-full mt-2">
                    {creatingOwner ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Onboard Store Owner
                  </Button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Active Store Owners ({owners.length})</h3>
                  <span className="text-xs text-muted-foreground">Authorized Store Managers</span>
                </div>

                <div className="divide-y divide-border/60">
                  {owners.map((o) => (
                    <div key={o.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-semibold text-foreground text-sm">
                          {o.ownerProfile?.fullName || o.email}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {o.email} · {o.phone || "No phone"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            o.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {o.status}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleOwnerStatus(o.id, o.status)}
                        >
                          {o.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab 6: Read-Only Audit Logs */}
        {activeTab === "audit-logs" ? (
          <div className="mt-8 space-y-4">
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Security & Compliance Audit Trail (Read-Only)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Immutable record of authentication, 2FA events, owner account modifications, and system updates.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search action, IP, email..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="h-8 pl-8 text-xs w-56"
                    />
                  </div>

                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="AUTH">Authentication / 2FA</option>
                    <option value="OWNER">Owner Changes</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/70 text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Actor / User</th>
                      <th className="py-2.5 px-3">Resource</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-primary">
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-foreground font-medium">
                          {log.user?.email || log.userId || "System / Anonymous"}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                          {log.resource}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                          {log.ipAddress || "127.0.0.1"}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate font-mono text-[10px]">
                          {log.details || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
