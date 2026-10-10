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
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Check,
  X,
  MapPin,
  CalendarDays,
  Bell,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";
import { NotificationCampaignManager } from "@/components/notifications/NotificationCampaignManager";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  component: AdminPage,
});

type SuperAdminTab =
  | "governance"
  | "financial-intelligence"
  | "prescriptions"
  | "appointments"
  | "owners"
  | "page-engagement"
  | "audit-logs"
  | "notifications";

interface AppointmentItem {
  id: string;
  type: string;
  status: string;
  appointmentDate: string;
  timeSlot: string;
  notes?: string;
  cancellationReason?: string;
  createdAt?: string;
  store?: {
    id: string;
    name: string;
    city?: string;
    address?: string;
    phone?: string;
  };
  user: {
    customerProfile?: { fullName: string };
    phone?: string;
    email?: string;
  };
}

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

interface PrescriptionItem {
  id: string;
  userId: string;
  type: "MANUAL" | "FILE";
  sphereOD?: string;
  cylinderOD?: string;
  axisOD?: string;
  sphereOS?: string;
  cylinderOS?: string;
  axisOS?: string;
  addition?: string;
  pd?: string;
  notes?: string;
  createdAt: string;
  downloadUrl?: string;
  user?: {
    id: string;
    email?: string;
    phone?: string;
    customerProfile?: { fullName: string };
  };
  fileUpload?: {
    id: string;
    objectKey: string;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
  };
  appointment?: {
    id: string;
    appointmentDate: string;
    timeSlot: string;
    type: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: string;
  };
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

function parseApptDetails(appt: AppointmentItem) {
  let name = appt.user?.customerProfile?.fullName || "";
  let phone = appt.user?.phone || "";
  let email = appt.user?.email || "";
  let age = "";
  let noteText = "";

  if (appt.notes) {
    const parts = appt.notes.split(" | ");
    const remainingNotes: string[] = [];
    for (const part of parts) {
      if (part.startsWith("Patient: ")) {
        if (!name || name === "Customer") name = part.replace("Patient: ", "").trim();
      } else if (part.startsWith("Contact: ")) {
        if (!phone) phone = part.replace("Contact: ", "").trim();
      } else if (part.startsWith("Email: ")) {
        if (!email) email = part.replace("Email: ", "").trim();
      } else if (part.startsWith("Age: ")) {
        age = part.replace("Age: ", "").trim();
      } else if (part.startsWith("Patient Age: ")) {
        age = part.replace("Patient Age: ", "").trim();
      } else if (part.startsWith("Patient Name: ")) {
        if (!name || name === "Customer") name = part.replace("Patient Name: ", "").trim();
      } else if (part.startsWith("Notes: ")) {
        remainingNotes.push(part.replace("Notes: ", "").trim());
      } else {
        remainingNotes.push(part.trim());
      }
    }
    noteText = remainingNotes.join(" | ");
  }

  if (!name || name === "Customer") name = appt.user?.customerProfile?.fullName || "Patient";
  return { name, phone, email, age, noteText };
}

function formatApptDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatApptType(type: string) {
  switch (type) {
    case "EYE_TEST":
      return "Comprehensive Eye Test";
    case "LENS_CONSULTATION":
      return "Myopia Care & Lenses";
    case "FRAME_CONSULTATION":
      return "Frame Styling & Fit";
    case "CONTACT_LENS_CONSULTATION":
      return "Contact Lens Trial";
    case "PRESCRIPTION_CONSULTATION":
      return "Prescription Verification";
    default:
      return type.replace(/_/g, " ");
  }
}

export function AdminPage() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("governance");
  const [loading, setLoading] = useState(false);

  // Super Admin Data states
  const [owners, setOwners] = useState<OwnerItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [finance, setFinance] = useState<AdminFinanceData | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [engagement, setEngagement] = useState<AnalyticsOverview | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

  // Filters & Search
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");
  const [prescriptionSearch, setPrescriptionSearch] = useState("");
  const [prescriptionFilter, setPrescriptionFilter] = useState<"ALL" | "FILE" | "MANUAL">("ALL");
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionItem | null>(null);
  const [apptSearch, setApptSearch] = useState("");
  const [apptStatusFilter, setApptStatusFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("ALL");

  // New Owner Form
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [creatingOwner, setCreatingOwner] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ownerRes, auditRes, financeRes, rxRes, engagementRes, apptRes] = await Promise.all([
        apiRequest<OwnerItem[]>("/admin/owners"),
        apiRequest<AuditLogEntry[]>("/admin/audit-logs?limit=50"),
        apiRequest<AdminFinanceData>("/admin/finance"),
        apiRequest<{ items: PrescriptionItem[] } | PrescriptionItem[]>("/admin/prescriptions"),
        apiRequest<AnalyticsOverview>("/admin/analytics/global"),
        apiRequest<AppointmentItem[]>("/admin/appointments"),
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
      if (rxRes.success) {
        const items = Array.isArray(rxRes.data)
          ? rxRes.data
          : (rxRes.data as any)?.items || [];
        setPrescriptions(items);
      }
      if (engagementRes.success && engagementRes.data) {
        setEngagement(engagementRes.data);
      }
      if (apptRes.success && Array.isArray(apptRes.data)) {
        setAppointments(apptRes.data);
      }
    } catch {
      // handled
    }
    setLoading(false);
  };

  const handleUpdateAppointment = async (id: string, status: string) => {
    const res = await apiRequest(`/admin/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      toast.success(`Appointment status updated to ${status}`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } else {
      toast.error("Failed to update appointment status.");
    }
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

  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (prescriptionFilter === "FILE" && rx.type !== "FILE") return false;
    if (prescriptionFilter === "MANUAL" && rx.type !== "MANUAL") return false;
    if (!prescriptionSearch.trim()) return true;

    const q = prescriptionSearch.toLowerCase();
    const patientName = rx.user?.customerProfile?.fullName?.toLowerCase() || "";
    const phone = rx.user?.phone?.toLowerCase() || "";
    const email = rx.user?.email?.toLowerCase() || "";
    const fileName = rx.fileUpload?.originalFileName?.toLowerCase() || "";
    const id = rx.id.toLowerCase();
    const notes = rx.notes?.toLowerCase() || "";

    return (
      patientName.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      fileName.includes(q) ||
      id.includes(q) ||
      notes.includes(q)
    );
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditActionFilter !== "ALL" && !log.action.includes(auditActionFilter)) return false;
    if (!auditSearch.trim()) return true;

    const q = auditSearch.toLowerCase();
    const action = log.action.toLowerCase();
    const email = log.user?.email?.toLowerCase() || "";
    const phone = log.user?.phone?.toLowerCase() || "";
    const userId = log.userId?.toLowerCase() || "";
    const resource = log.resource?.toLowerCase() || "";
    const ip = log.ipAddress?.toLowerCase() || "";
    const details = log.details?.toLowerCase() || "";

    return (
      action.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      userId.includes(q) ||
      resource.includes(q) ||
      ip.includes(q) ||
      details.includes(q)
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
            <Button
              variant={activeTab === "notifications" ? "hero" : "outline"}
              size="sm"
              onClick={() => setActiveTab("notifications")}
              className="border-primary/50 text-primary font-bold shadow-xs bg-primary/10 hover:bg-primary/20"
            >
              <Bell className="mr-1.5 h-3.5 w-3.5" /> Broadcast Notification
            </Button>
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
          <nav className="flex space-x-4 overflow-x-auto pb-1">
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
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === "notifications"
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-primary hover:border-border"
              }`}
            >
              <Bell className="h-4 w-4 text-primary animate-pulse" />
              <span>Customer Broadcast & Notifications</span>
              <span className="rounded-full bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5">
                Studio
              </span>
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
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "appointments"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Calendar className="h-4 w-4" /> Appointments ({appointments.length})
              {appointments.filter((a) => a.status === "PENDING").length > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                  {appointments.filter((a) => a.status === "PENDING").length} pending
                </span>
              )}
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
              onClick={() => setActiveTab("prescriptions")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "prescriptions"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" /> Prescriptions Vault ({prescriptions.length})
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
            {/* Quick Action Broadcast Banner */}
            <div className="surface-glass rounded-2xl p-5 border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm flex-shrink-0">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Customer Notification & Broadcast Studio</span>
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase">
                      Ready
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                    Compose & broadcast new eyewear collection drops, festive discount promotions, eye checkup reminders, and store updates across In-App, WhatsApp, SMS & Email.
                  </p>
                </div>
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={() => setActiveTab("notifications")}
                className="font-bold whitespace-nowrap self-start sm:self-auto shadow-sm"
              >
                <Bell className="mr-1.5 h-3.5 w-3.5" /> Open Broadcast Studio →
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
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

              <div
                onClick={() => setActiveTab("appointments")}
                className="surface-glass rounded-2xl p-6 shadow-lift cursor-pointer hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Appointments</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">{appointments.length}</div>
                <p className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                  <span>{appointments.filter((a) => a.status === "PENDING").length} pending action</span>
                  <span className="text-primary font-medium flex items-center">View <ChevronRight className="h-3 w-3 ml-0.5" /></span>
                </p>
              </div>

              <div
                onClick={() => setActiveTab("prescriptions")}
                className="surface-glass rounded-2xl p-6 shadow-lift cursor-pointer hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Prescriptions</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">{prescriptions.length}</div>
                <p className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                  <span>{prescriptions.filter((p) => p.type === "FILE").length} uploaded files</span>
                  <span className="text-primary font-medium flex items-center">View <ChevronRight className="h-3 w-3 ml-0.5" /></span>
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

              {/* Prescriptions Vault Card */}
              <div className="surface-glass rounded-2xl p-6 shadow-lift border border-border/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    Prescriptions Vault
                  </span>
                  <Button onClick={() => setActiveTab("prescriptions")} variant="ghost" size="sm" className="text-xs">
                    View All Rx ({prescriptions.length}) <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
                <h3 className="text-base font-bold">
                  {prescriptions.length === 0 ? "No Prescriptions Uploaded Yet" : `${prescriptions.length} Prescription(s) in Vault`}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Doctor uploaded clinical prescriptions stored in Supabase private vault with 10MB limits.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-border/70 bg-card p-3">
                    <span className="text-[11px] text-muted-foreground block">Uploaded Files</span>
                    <span className="font-display text-xl font-bold text-foreground">
                      {prescriptions.filter((p) => p.type === "FILE").length}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-3">
                    <span className="text-[11px] text-muted-foreground block">Manual Powers</span>
                    <span className="font-display text-xl font-bold text-primary">
                      {prescriptions.filter((p) => p.type === "MANUAL").length}
                    </span>
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

        {/* Tab: Clinical Prescriptions Vault */}
        {activeTab === "prescriptions" ? (
          <div className="mt-8 space-y-8">
            {/* Top Diagnostics KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Total Prescriptions</span>
                <div className="mt-3 font-display text-3xl font-bold text-foreground">
                  {prescriptions.length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Logged across all platform users</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Doctor Uploaded Files</span>
                <div className="mt-3 font-display text-3xl font-bold text-primary">
                  {prescriptions.filter((p) => p.type === "FILE").length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Stored securely in Supabase vault</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Manual Power Entries</span>
                <div className="mt-3 font-display text-3xl font-bold text-emerald-500">
                  {prescriptions.filter((p) => p.type === "MANUAL").length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">OD / OS optical parameters</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Storage Security</span>
                <div className="mt-3 font-display text-2xl font-bold text-emerald-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-6 w-6" /> Supabase
                </div>
                <p className="mt-1 text-xs text-muted-foreground">10MB limit · JPEG, PNG, PDF</p>
              </div>
            </div>

            {/* Prescriptions Master Table */}
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Clinical Prescriptions Vault & Files
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Doctor uploaded prescription records with encrypted storage in Supabase and direct preview access.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search patient, phone, file..."
                      value={prescriptionSearch}
                      onChange={(e) => setPrescriptionSearch(e.target.value)}
                      className="h-8 pl-8 text-xs w-48 sm:w-56"
                    />
                  </div>

                  <select
                    value={prescriptionFilter}
                    onChange={(e) => setPrescriptionFilter(e.target.value as any)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="ALL">All Types ({prescriptions.length})</option>
                    <option value="FILE">Uploaded Files ({prescriptions.filter((p) => p.type === "FILE").length})</option>
                    <option value="MANUAL">Manual Powers ({prescriptions.filter((p) => p.type === "MANUAL").length})</option>
                  </select>

                  <Button size="sm" variant="outline" onClick={fetchAdminData} className="h-8 text-xs">
                    <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" /> Refresh
                  </Button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/70 text-muted-foreground uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Rx ID / Date</th>
                      <th className="py-2.5 px-3">Patient Name</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Prescription File / Details</th>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredPrescriptions.map((rx) => {
                      const patientName = rx.user?.customerProfile?.fullName || "Registered Customer";
                      const phone = rx.user?.phone || "—";
                      const email = rx.user?.email || "—";

                      return (
                        <tr key={rx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-foreground block">
                              #{rx.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(rx.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-foreground block">{patientName}</span>
                            {rx.order?.orderNumber && (
                              <span className="text-[10px] text-primary block font-mono">Order: {rx.order.orderNumber}</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono text-xs text-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3 text-primary" /> {phone}
                            </div>
                            {email !== "—" && (
                              <span className="text-[10px] text-muted-foreground truncate block max-w-[140px]">{email}</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                rx.type === "FILE"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {rx.type === "FILE" ? "Doctor Upload (Supabase)" : "Manual Entry"}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            {rx.fileUpload ? (
                              <div className="space-y-1">
                                <span className="font-medium text-foreground truncate block font-mono text-xs">
                                  📄 {rx.fileUpload.originalFileName}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <span className="rounded bg-muted px-1.5 py-0.2 uppercase">
                                    {rx.fileUpload.mimeType.split("/")[1] || "FILE"}
                                  </span>
                                  <span>{(rx.fileUpload.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-1 text-[11px] bg-muted/40 p-2 rounded">
                                <div><span className="text-muted-foreground">OD:</span> {rx.sphereOD || "0.00"}</div>
                                <div><span className="text-muted-foreground">OS:</span> {rx.sphereOS || "0.00"}</div>
                                <div><span className="text-muted-foreground">Cyl:</span> {rx.cylinderOD || "0.00"}</div>
                                <div><span className="text-muted-foreground">PD:</span> {rx.pd || "63mm"}</div>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 max-w-[180px]">
                            <p className="text-[11px] text-muted-foreground truncate">{rx.notes || "No optometrist notes"}</p>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {rx.downloadUrl ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                    className="h-7 text-[10px] bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                                  >
                                    <a href={rx.downloadUrl} target="_blank" rel="noopener noreferrer">
                                      <Eye className="h-3 w-3 mr-1" /> View File
                                    </a>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className="h-7 text-[10px]"
                                  >
                                    <a href={rx.downloadUrl} download={rx.fileUpload?.originalFileName || "prescription"}>
                                      <Download className="h-3 w-3 mr-1" /> Download
                                    </a>
                                  </Button>
                                </>
                              ) : rx.type === "FILE" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    const res = await apiRequest<{ downloadUrl: string }>(`/prescriptions/${rx.id}/download-url`);
                                    if (res.success && res.data?.downloadUrl) {
                                      window.open(res.data.downloadUrl, "_blank");
                                    } else {
                                      toast.error("Could not retrieve prescription link.");
                                    }
                                  }}
                                  className="h-7 text-[10px]"
                                >
                                  <Eye className="h-3 w-3 mr-1" /> Fetch Link
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedPrescription(rx)}
                                  className="h-7 text-[10px]"
                                >
                                  <Eye className="h-3 w-3 mr-1" /> View Powers
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPrescriptions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-muted-foreground">
                          <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                          No prescriptions found matching your search.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Rx Detail Modal */}
            {selectedPrescription ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="surface-glass rounded-2xl p-6 shadow-lift max-w-lg w-full flex flex-col border border-border space-y-4">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div>
                      <h4 className="font-display font-bold text-base text-foreground">
                        Prescription Optical Powers
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        Ref: #{selectedPrescription.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedPrescription(null)}>
                      Close
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-card rounded-xl border border-border">
                      <span className="font-bold text-primary block">Right Eye (OD)</span>
                      <div className="mt-2 space-y-1">
                        <div>SPH: <strong>{selectedPrescription.sphereOD || "0.00"}</strong></div>
                        <div>CYL: <strong>{selectedPrescription.cylinderOD || "0.00"}</strong></div>
                        <div>AXIS: <strong>{selectedPrescription.axisOD || "0"}°</strong></div>
                      </div>
                    </div>
                    <div className="p-3 bg-card rounded-xl border border-border">
                      <span className="font-bold text-primary block">Left Eye (OS)</span>
                      <div className="mt-2 space-y-1">
                        <div>SPH: <strong>{selectedPrescription.sphereOS || "0.00"}</strong></div>
                        <div>CYL: <strong>{selectedPrescription.cylinderOS || "0.00"}</strong></div>
                        <div>AXIS: <strong>{selectedPrescription.axisOS || "0"}°</strong></div>
                      </div>
                    </div>
                  </div>
                  {selectedPrescription.notes && (
                    <div className="text-xs bg-muted/40 p-3 rounded-lg">
                      <span className="text-muted-foreground font-semibold block mb-1">Notes:</span>
                      {selectedPrescription.notes}
                    </div>
                  )}
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
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                          No audit log entries matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => (
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
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab: Platform Appointments Management */}
        {activeTab === "appointments" ? (
          <div className="mt-8 space-y-6">
            {/* Overview Metrics Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="surface-glass rounded-2xl p-4 shadow-lift border border-border/80">
                <span className="text-xs font-medium text-muted-foreground uppercase">Total Platform Bookings</span>
                <div className="mt-2 font-display text-2xl font-bold text-foreground">{appointments.length}</div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">All clinic consultations</p>
              </div>

              <div className="surface-glass rounded-2xl p-4 shadow-lift border border-amber-500/30 bg-amber-500/5">
                <span className="text-xs font-semibold text-amber-500 uppercase flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Pending Actions
                </span>
                <div className="mt-2 font-display text-2xl font-bold text-amber-500">
                  {appointments.filter((a) => a.status === "PENDING").length}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Requires store confirmation</p>
              </div>

              <div className="surface-glass rounded-2xl p-4 shadow-lift border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-xs font-semibold text-emerald-500 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
                </span>
                <div className="mt-2 font-display text-2xl font-bold text-emerald-500">
                  {appointments.filter((a) => a.status === "CONFIRMED").length}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Active appointments</p>
              </div>

              <div className="surface-glass rounded-2xl p-4 shadow-lift border border-blue-500/30 bg-blue-500/5">
                <span className="text-xs font-semibold text-blue-500 uppercase flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Completed
                </span>
                <div className="mt-2 font-display text-2xl font-bold text-blue-500">
                  {appointments.filter((a) => a.status === "COMPLETED").length}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Successfully fulfilled</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="surface-glass rounded-2xl p-5 shadow-lift">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((st) => {
                    const count = st === "ALL" ? appointments.length : appointments.filter((a) => a.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setApptStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          apptStatusFilter === st
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {st === "ALL" ? "All Appointments" : st.charAt(0) + st.slice(1).toLowerCase()} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={apptSearch}
                    onChange={(e) => setApptSearch(e.target.value)}
                    placeholder="Search patient, phone, notes..."
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Appointments List */}
              <div className="mt-6 space-y-4">
                {appointments
                  .filter((a) => {
                    if (apptStatusFilter !== "ALL" && a.status !== apptStatusFilter) return false;
                    if (!apptSearch) return true;
                    const { name, phone, email, noteText } = parseApptDetails(a);
                    const q = apptSearch.toLowerCase();
                    return (
                      name.toLowerCase().includes(q) ||
                      phone.toLowerCase().includes(q) ||
                      email.toLowerCase().includes(q) ||
                      noteText.toLowerCase().includes(q) ||
                      a.timeSlot.toLowerCase().includes(q) ||
                      a.type.toLowerCase().includes(q) ||
                      (a.store?.name && a.store.name.toLowerCase().includes(q))
                    );
                  })
                  .map((a) => {
                    const { name, phone, email, age, noteText } = parseApptDetails(a);
                    const cleanPhone = phone.replace(/\D/g, "");
                    const waMessage = encodeURIComponent(
                      `Hello ${name}, this is Nayantara Opticals regarding your ${formatApptType(a.type)} appointment on ${formatApptDate(a.appointmentDate)} at ${a.timeSlot}.`
                    );

                    return (
                      <div
                        key={a.id}
                        className="rounded-xl border border-border/80 bg-card/60 p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-soft"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          {/* Left: Patient and Appointment Info */}
                          <div className="space-y-2.5">
                            {/* Patient Name + Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-base font-bold text-foreground">
                                {name}
                              </span>

                              {age && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                                  Age: {age} yrs
                                </span>
                              )}

                              <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                {formatApptType(a.type)}
                              </span>

                              {/* Status Badge */}
                              {a.status === "PENDING" && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-500">
                                  <Clock className="h-3 w-3" /> PENDING
                                </span>
                              )}
                              {a.status === "CONFIRMED" && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
                                  <CheckCircle2 className="h-3 w-3" /> CONFIRMED
                                </span>
                              )}
                              {a.status === "COMPLETED" && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-500">
                                  <Check className="h-3 w-3" /> COMPLETED
                                </span>
                              )}
                              {a.status === "CANCELLED" && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
                                  <X className="h-3 w-3" /> CANCELLED
                                </span>
                              )}
                            </div>

                            {/* Schedule & Location */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium text-foreground">
                                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                                {formatApptDate(a.appointmentDate)}
                              </span>
                              <span className="flex items-center gap-1.5 font-medium text-foreground">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {a.timeSlot}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                {a.store?.name || "Nayantara Opticals (Uttam Nagar Flagship)"}
                              </span>
                            </div>

                            {/* Contact Details & Quick Actions */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                              {phone ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-foreground font-medium">📞 {phone}</span>
                                  <a
                                    href={`tel:${phone}`}
                                    className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                                  >
                                    Call
                                  </a>
                                  <a
                                    href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${waMessage}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-500 hover:bg-emerald-500/25 transition-colors"
                                  >
                                    <MessageCircle className="h-3 w-3" /> WhatsApp
                                  </a>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">No phone number recorded</span>
                              )}

                              {email && (
                                <a
                                  href={`mailto:${email}`}
                                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-mono"
                                >
                                  <Mail className="h-3 w-3" /> {email}
                                </a>
                              )}
                            </div>

                            {/* Symptoms or Clinical Notes */}
                            {noteText && (
                              <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs text-foreground/90">
                                <span className="font-semibold text-primary">Patient Notes / Concerns:</span>{" "}
                                <span className="italic">{noteText}</span>
                              </div>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                            {a.status !== "CONFIRMED" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleUpdateAppointment(a.id, "CONFIRMED")}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" /> Confirm
                              </Button>
                            )}

                            {a.status !== "COMPLETED" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleUpdateAppointment(a.id, "COMPLETED")}
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                              </Button>
                            )}

                            {a.status !== "CANCELLED" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleUpdateAppointment(a.id, "CANCELLED")}
                              >
                                <X className="mr-1 h-3.5 w-3.5" /> Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {appointments.filter((a) => {
                  if (apptStatusFilter !== "ALL" && a.status !== apptStatusFilter) return false;
                  if (!apptSearch) return true;
                  const { name, phone, email, noteText } = parseApptDetails(a);
                  const q = apptSearch.toLowerCase();
                  return (
                    name.toLowerCase().includes(q) ||
                    phone.toLowerCase().includes(q) ||
                    email.toLowerCase().includes(q) ||
                    noteText.toLowerCase().includes(q) ||
                    a.timeSlot.toLowerCase().includes(q) ||
                    a.type.toLowerCase().includes(q) ||
                    (a.store?.name && a.store.name.toLowerCase().includes(q))
                  );
                }).length === 0 && (
                  <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                    <Calendar className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                    No appointments found matching the selected filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab: Customer Notifications & Broadcast Studio */}
        {activeTab === "notifications" ? (
          <div className="mt-8">
            <NotificationCampaignManager senderRole="SUPER_ADMIN" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
