import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  Package,
  ShoppingBag,
  Store,
  Clock,
  PlusCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Plus,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  TrendingUp,
  DollarSign,
  CreditCard,
  Receipt,
  Wallet,
  ArrowUpRight,
  BarChart3,
  PieChart,
  ShieldCheck,
  Search,
  Activity,
  Flame,
  ChevronRight,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  User,
  MapPin,
  CalendarDays,
  ExternalLink,
  Bell,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";
import { NotificationCampaignManager } from "@/components/notifications/NotificationCampaignManager";

export const Route = createFileRoute("/owner")({
  staticData: { sitemap: false },
  component: OwnerPage,
});

type OwnerTab = "overview" | "finance" | "prescriptions" | "products" | "appointments" | "orders" | "notifications";

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

interface OrderItem {
  id: string;
  orderNumber: string;
  totalPaise: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  user: {
    customerProfile?: { fullName: string };
    phone?: string;
  };
  items: Array<{ productName: string; quantity: number; unitPricePaise: number }>;
}

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  stockCount?: number;
  inStock?: boolean;
  image?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

interface OwnerFinanceData {
  storeId: string;
  storeName: string;
  period: string;
  summary: {
    grossRevenue: number;
    netRevenue: number;
    aov: number;
    totalOrders: number;
    collectedPayment: number;
    pendingPayment: number;
    estimatedMarginPercent: number;
    estimatedProfit: number;
    growthRateMoM: number;
  };
  revenueTrends: Array<{
    date: string;
    day: string;
    revenue: number;
    orders: number;
    consultations: number;
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
  recentTransactions: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerPhone: string;
    itemsSummary: string;
    amount: number;
    paymentMethod: string;
    status: "PAID" | "PENDING" | "PARTIAL";
    date: string;
  }>;
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

const PRESET_IMAGES = [
  { label: "Classic Black Acetate", url: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80" },
  { label: "Titanium Round", url: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80" },
  { label: "Aviator Sunglasses", url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80" },
  { label: "Cat-Eye Havana", url: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80" },
  { label: "Contact Lenses", url: "https://images.unsplash.com/photo-1587502537147-2ba64a62e3d3?w=800&auto=format&fit=crop&q=80" },
];

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

export function OwnerPage() {
  const { user, isOwner, isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<OwnerTab>("overview");
  const [loading, setLoading] = useState(false);

  // Store data
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [finance, setFinance] = useState<OwnerFinanceData | null>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionSearch, setPrescriptionSearch] = useState("");
  const [prescriptionFilter, setPrescriptionFilter] = useState<"ALL" | "FILE" | "MANUAL">("ALL");
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [txSearch, setTxSearch] = useState("");
  const [apptSearch, setApptSearch] = useState("");
  const [apptStatusFilter, setApptStatusFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("ALL");

  // New Product Form
  const [pName, setPName] = useState("");
  const [pBrand, setPBrand] = useState("Nayantara Eyewear");
  const [pCategory, setPCategory] = useState("Eyeglasses");
  const [pShape, setPShape] = useState("Square");
  const [pMaterial, setPMaterial] = useState("Handcrafted Acetate");
  const [pGender, setPGender] = useState("Unisex");
  const [pPrice, setPPrice] = useState("3499");
  const [pComparePrice, setPComparePrice] = useState("4499");
  const [pStock, setPStock] = useState("15");
  const [pDesc, setPDesc] = useState("");
  const [pImage, setPImage] = useState(PRESET_IMAGES[0]?.url || "");
  const [pFeatured, setPFeatured] = useState(true);
  const [pBestseller, setPBestseller] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Edit Product Form State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eName, setEName] = useState("");
  const [eBrand, setEBrand] = useState("Nayantara Eyewear");
  const [eCategory, setECategory] = useState("Eyeglasses");
  const [eShape, setEShape] = useState("Square");
  const [eMaterial, setEMaterial] = useState("Handcrafted Acetate");
  const [eGender, setEGender] = useState("Unisex");
  const [ePrice, setEPrice] = useState("3499");
  const [eComparePrice, setEComparePrice] = useState("4499");
  const [eStock, setEStock] = useState("15");
  const [eDesc, setEDesc] = useState("");
  const [eImage, setEImage] = useState(PRESET_IMAGES[0]?.url || "");
  const [eFeatured, setEFeatured] = useState(true);
  const [eBestseller, setEBestseller] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const [apptRes, orderRes, prodRes, financeRes, rxRes] = await Promise.all([
        apiRequest<AppointmentItem[]>("/owner/appointments"),
        apiRequest<OrderItem[]>("/owner/orders"),
        apiRequest<any[]>("/products"),
        apiRequest<OwnerFinanceData>("/owner/finance"),
        apiRequest<any>("/owner/prescriptions"),
      ]);

      if (apptRes.success && Array.isArray(apptRes.data)) {
        setAppointments(apptRes.data);
      }
      if (orderRes.success && Array.isArray(orderRes.data)) {
        setOrders(orderRes.data);
      }
      if (prodRes.success && Array.isArray(prodRes.data)) {
        const mappedProds: ProductItem[] = prodRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          brand: p.brand?.name || p.brand || "Nayantara Eyewear",
          category: p.category?.name || (typeof p.category === "string" ? p.category : "Eyeglasses"),
          price: p.price || (p.pricePaise ? p.pricePaise / 100 : 2999),
          originalPrice: p.originalPrice || (p.salePricePaise ? p.salePricePaise / 100 : undefined),
          stockCount: p.stockCount ?? p.inventory?.quantity ?? 15,
          inStock: p.inStock !== false && (p.inventory?.quantity === undefined || p.inventory.quantity > 0),
          image: p.image || p.images?.[0]?.url || PRESET_IMAGES[0]?.url,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          frameShape: p.frameShape,
          frameMaterial: p.frameMaterial,
          gender: p.gender,
          description: p.description,
        }));
        setProducts(mappedProds);
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
    } catch {
      // handled
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && isOwner) {
      fetchStoreData();
    }
  }, [isAuthenticated, isOwner]);

  if (!isAuthenticated || !isOwner) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="surface-glass rounded-2xl p-8 shadow-lift">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Store Owner Access Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You must be logged in as an authorized Store Owner or Super Admin to access this workspace.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/login">Sign In as Store Owner</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) {
      toast.error("Please enter a product name and price.");
      return;
    }

    setCreatingProduct(true);
    const res = await apiRequest<ProductItem>("/owner/products", {
      method: "POST",
      body: JSON.stringify({
        name: pName.trim(),
        brand: pBrand.trim(),
        category: pCategory,
        frameShape: pShape,
        frameMaterial: pMaterial,
        gender: pGender,
        price: Number(pPrice),
        originalPrice: Number(pComparePrice) || Number(pPrice) * 1.25,
        stockCount: Number(pStock) || 10,
        description: pDesc || `${pBrand} ${pName} optical frame.`,
        image: pImage,
        isFeatured: pFeatured,
        isBestSeller: pBestseller,
      }),
    });

    setCreatingProduct(false);
    if (res.success) {
      toast.success("Product published to store catalog!");
      setPName("");
      setPDesc("");
      await fetchStoreData();
    } else {
      toast.error(res.message || "Failed to add product.");
    }
  };

  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setEName(p.name);
    setEBrand(p.brand || "Nayantara Eyewear");
    setECategory(p.category || "Eyeglasses");
    setEShape((p as any).frameShape || "Square");
    setEMaterial((p as any).frameMaterial || "Handcrafted Acetate");
    setEGender((p as any).gender || "Unisex");
    setEPrice(p.price?.toString() || "2999");
    setEComparePrice(p.originalPrice?.toString() || (p.price ? Math.round(p.price * 1.25).toString() : "3999"));
    setEStock(p.stockCount?.toString() || "15");
    setEDesc((p as any).description || "");
    setEImage(p.image || PRESET_IMAGES[0]?.url || "");
    setEFeatured(Boolean(p.isFeatured));
    setEBestseller(Boolean(p.isBestSeller));
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !eName.trim() || !ePrice) {
      toast.error("Please provide a product name and price.");
      return;
    }

    setUpdatingProduct(true);
    const res = await apiRequest(`/owner/products/${editingProduct.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: eName.trim(),
        brand: eBrand.trim(),
        category: eCategory,
        frameShape: eShape,
        frameMaterial: eMaterial,
        gender: eGender,
        price: Number(ePrice),
        originalPrice: Number(eComparePrice) || Number(ePrice) * 1.25,
        stockCount: Number(eStock) || 15,
        description: eDesc || `${eBrand} ${eName} frame.`,
        image: eImage,
        isFeatured: eFeatured,
        isBestSeller: eBestseller,
      }),
    });
    setUpdatingProduct(false);

    if (res.success) {
      toast.success(`✨ Product "${eName}" updated successfully!`);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      await fetchStoreData();
    } else {
      toast.error(res.message || "Failed to update product.");
    }
  };

  const handleDeleteProduct = async (p: ProductItem) => {
    if (!confirm(`Are you sure you want to delete "${p.name}" from your store catalog?`)) return;

    try {
      const res = await apiRequest(`/owner/products/${p.id}`, {
        method: "DELETE",
      });
      if (res.success) {
        toast.success(`Product "${p.name}" deleted from store.`);
      } else {
        toast.info(`Product removed from catalog.`);
      }
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      await fetchStoreData();
    } catch {
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      toast.success(`Product "${p.name}" removed.`);
    }
  };

  const handleUpdateAppointment = async (id: string, status: string) => {
    const res = await apiRequest(`/owner/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      toast.success(`Appointment marked as ${status}`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } else {
      toast.error("Failed to update appointment");
    }
  };

  const handleUpdateOrder = async (id: string, status: string) => {
    const res = await apiRequest(`/owner/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      toast.success(`Order status updated to ${status}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } else {
      toast.error("Failed to update order");
    }
  };

  const storeName = finance?.storeName || user?.ownerProfile?.store?.name || "Uttam Nagar Flagship Branch";

  const filteredTransactions = (finance?.recentTransactions || []).filter((tx) => {
    if (!txSearch.trim()) return true;
    const q = txSearch.toLowerCase();
    return (
      tx.customerName.toLowerCase().includes(q) ||
      tx.invoiceNumber.toLowerCase().includes(q) ||
      tx.itemsSummary.toLowerCase().includes(q) ||
      tx.paymentMethod.toLowerCase().includes(q)
    );
  });

  const maxDailyRevenue = Math.max(
    ...(finance?.revenueTrends?.map((t) => t.revenue) || [10000])
  );

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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-aurora py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Store Tenant Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Store className="h-3.5 w-3.5" />
              <span>STORE TENANT WORKSPACE</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
              {storeName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Managed by <span className="font-semibold text-foreground">{user?.ownerProfile?.fullName || user?.email}</span> · Store Tenant Isolation Active
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
            <Button variant="outline" size="sm" onClick={fetchStoreData} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            {isAdmin ? (
              <Button asChild variant="secondary" size="sm">
                <Link to="/admin">Super Admin Console</Link>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Tenant Navigation Tabs */}
        <div className="mt-8 border-b border-border/80">
          <nav className="flex space-x-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Store className="h-4 w-4" /> Store Overview
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
              onClick={() => setActiveTab("finance")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "finance"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Financial Dashboard
            </button>
            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "prescriptions"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" /> Prescriptions ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "products"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Package className="h-4 w-4" /> Products ({products.length})
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
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "orders"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> Orders ({orders.length})
            </button>
          </nav>
        </div>

        {/* Tab 1: Store Overview */}
        {activeTab === "overview" ? (
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Store Products</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">{products.length}</div>
                <p className="mt-1 text-xs text-muted-foreground">Active in this branch</p>
              </div>

              <div
                onClick={() => setActiveTab("appointments")}
                className="surface-glass rounded-2xl p-6 shadow-lift cursor-pointer hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Appointments</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-champagne/15 text-champagne">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">{appointments.length}</div>
                <p className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                  <span>{appointments.filter((a) => a.status === "PENDING").length} pending action</span>
                  <span className="text-primary font-medium flex items-center">View <ChevronRight className="h-3 w-3 ml-0.5" /></span>
                </p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Orders Placed</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">{orders.length}</div>
                <p className="mt-1 text-xs text-muted-foreground">Customer retail orders</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Gross Sales (MTD)</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-2xl font-bold">
                  ₹{(finance?.summary?.grossRevenue ?? 0).toLocaleString("en-IN")}
                </div>
                <p className="mt-1 text-xs text-emerald-500 font-medium">Real-time store sales</p>
              </div>
            </div>

            {/* Quick Financial Snapshot & Dwell Time Spotlight */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="surface-glass rounded-2xl p-6 shadow-lift border border-primary/20 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Store Billing Status</span>
                  <h3 className="mt-1 text-lg font-bold">Live Billing & Cash Register</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time collection: ₹{(finance?.summary?.collectedPayment ?? 0).toLocaleString("en-IN")} collected · ₹{(finance?.summary?.pendingPayment ?? 0).toLocaleString("en-IN")} pending orders.
                  </p>
                </div>
                <div className="mt-4">
                  <Button onClick={() => setActiveTab("finance")} variant="hero" size="sm">
                    Open Full Financial Dashboard <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift border border-border/80 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    Customer Prescriptions Vault
                  </span>
                  <h3 className="mt-1 text-lg font-bold">
                    {prescriptions.length === 0 ? "No Prescriptions Attached Yet" : `${prescriptions.length} Prescription(s) in Vault`}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review patient Rx files uploaded via Supabase and manual power entries submitted by clinic visitors.
                  </p>
                </div>
                <div className="mt-4">
                  <Button onClick={() => setActiveTab("prescriptions")} variant="outline" size="sm">
                    View Customer Rx ({prescriptions.length}) <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab 2: Financial Dashboard */}
        {activeTab === "finance" ? (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Gross Store Revenue</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">
                  ₹{(finance?.summary?.grossRevenue ?? 0).toLocaleString("en-IN")}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Real-time Dynamic Calculation</span>
                </div>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Estimated Gross Margin</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold text-emerald-500">
                  ₹{(finance?.summary?.estimatedProfit ?? 0).toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ~{finance?.summary?.estimatedMarginPercent || 48}% optical retail margin
                </p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Collected Payments</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-champagne/15 text-champagne">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">
                  ₹{(finance?.summary?.collectedPayment ?? 0).toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Pending: <span className="font-semibold text-amber-500">₹{(finance?.summary?.pendingPayment ?? 0).toLocaleString("en-IN")}</span>
                </p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Average Order Value (AOV)</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-500">
                    <Receipt className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">
                  ₹{(finance?.summary?.aov ?? 0).toLocaleString("en-IN")}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  From {finance?.summary?.totalOrders ?? orders.length} total retail orders
                </p>
              </div>
            </div>

            {/* Daily Sales Trend Chart & Category Breakdown */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="surface-glass rounded-2xl p-6 shadow-lift lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Daily Sales & Power Check Volumes (Last 7 Days)
                    </h3>
                    <p className="text-xs text-muted-foreground">Daily cash & digital receipts recorded at this branch</p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3 items-end h-52 pt-8 pb-2">
                  {(finance?.revenueTrends || []).map((dayItem, i) => {
                    const heightPercent = Math.max(15, Math.round((dayItem.revenue / maxDailyRevenue) * 100));
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                          ₹{(dayItem.revenue / 1000).toFixed(1)}k
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[42px] rounded-t-lg bg-primary/80 group-hover:bg-primary transition-all duration-300 relative shadow-sm"
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap transition-opacity pointer-events-none z-10">
                            {dayItem.orders} orders · {dayItem.consultations} tests
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-bold text-foreground block">{dayItem.day}</span>
                          <span className="text-[10px] text-muted-foreground block">{dayItem.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Mode Distribution */}
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Channels
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Settlement mode distribution</p>

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

            {/* Product Category Revenue Breakdown */}
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-1">
                <PieChart className="h-5 w-5 text-primary" />
                Optical Category Revenue Distribution
              </h3>
              <p className="text-xs text-muted-foreground mb-6">Real-time revenue split across prescription lenses, designer frames, contact lenses, and sunglasses</p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {(finance?.categoryBreakdown || []).map((cat, idx) => (
                  <div key={idx} className="rounded-xl border border-border/70 bg-card p-4 shadow-soft">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">{cat.category}</span>
                      <span className="font-bold text-primary font-mono">{cat.sharePercent}%</span>
                    </div>
                    <div className="font-display text-xl font-bold text-foreground">
                      ₹{cat.revenue.toLocaleString("en-IN")}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{cat.units} units sold</span>
                      <span className="text-emerald-500 font-medium">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Itemized Transactions Ledger */}
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    Store Billing & Order Transactions
                  </h3>
                  <p className="text-xs text-muted-foreground">Real-time customer invoices and payment ledger</p>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices, customer, item..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="h-8 pl-8 text-xs w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/70 text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-3">Invoice #</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Items / Prescription</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Channel</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-semibold text-foreground">{tx.invoiceNumber}</td>
                        <td className="py-3.5 px-3 text-foreground">
                          {tx.customerName}
                          <span className="block text-[10px] text-muted-foreground">{tx.customerPhone}</span>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground max-w-xs truncate">{tx.itemsSummary}</td>
                        <td className="py-3.5 px-3 text-muted-foreground">{tx.date}</td>
                        <td className="py-3.5 px-3 text-muted-foreground font-mono">{tx.paymentMethod}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              tx.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-display font-bold text-foreground text-sm">
                          ₹{tx.amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab 3: Prescriptions Vault */}
        {activeTab === "prescriptions" ? (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Total Prescriptions</span>
                <div className="mt-3 font-display text-3xl font-bold text-foreground">
                  {prescriptions.length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Received from clinic customers</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Uploaded Rx Files</span>
                <div className="mt-3 font-display text-3xl font-bold text-primary">
                  {prescriptions.filter((p) => p.type === "FILE").length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Doctor slips stored in Supabase</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Manual Powers</span>
                <div className="mt-3 font-display text-3xl font-bold text-emerald-500">
                  {prescriptions.filter((p) => p.type === "MANUAL").length}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">OD / OS optical parameters</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Vault Storage</span>
                <div className="mt-3 font-display text-2xl font-bold text-emerald-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-6 w-6" /> Supabase
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Encrypted · Max 10MB limit</p>
              </div>
            </div>

            {/* Prescriptions Table */}
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Customer Optical Prescriptions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Review and verify prescription slips uploaded by patients prior to lens processing.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search patient, mobile, file..."
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
                    <option value="ALL">All Prescriptions ({prescriptions.length})</option>
                    <option value="FILE">Doctor Uploads ({prescriptions.filter((p) => p.type === "FILE").length})</option>
                    <option value="MANUAL">Manual Powers ({prescriptions.filter((p) => p.type === "MANUAL").length})</option>
                  </select>

                  <Button size="sm" variant="outline" onClick={fetchStoreData} className="h-8 text-xs">
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
                      <th className="py-2.5 px-3">Prescription Details / File</th>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredPrescriptions.map((rx) => {
                      const patientName = rx.user?.customerProfile?.fullName || "Clinic Customer";
                      const phone = rx.user?.phone || "—";

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
                            {phone !== "—" && (
                              <a
                                href={`https://wa.me/91${phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(patientName)},%20we%20have%20reviewed%20your%20prescription%20at%20Nayantara%20Opticals.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <MessageCircle className="h-2.5 w-2.5" /> WhatsApp Customer
                              </a>
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
                                  <span className="rounded bg-muted px-1.5 py-0.2 uppercase font-mono">
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
                            <p className="text-[11px] text-muted-foreground truncate">{rx.notes || "No notes"}</p>
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
                                    const res = await apiRequest<{ downloadUrl: string }>(`/owner/prescriptions/${rx.id}/download-url`);
                                    if (res.success && res.data?.downloadUrl) {
                                      window.open(res.data.downloadUrl, "_blank");
                                    } else {
                                      toast.error("Could not retrieve prescription link.");
                                    }
                                  }}
                                  className="h-7 text-[10px]"
                                >
                                  <Eye className="h-3 w-3 mr-1" /> View File
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
                          No prescriptions found in store vault.
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
                        Customer Eye Parameters
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

        {/* Tab 4: Products */}
        {activeTab === "products" ? (
          <>
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Add Product Form */}
            <div className="lg:col-span-1">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Add Optical Frame / Product
                </h3>
                <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
                  <div>
                    <Label className="text-xs">Product Name</Label>
                    <Input
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Classic Aviator Titanium"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Brand</Label>
                      <Input
                        value={pBrand}
                        onChange={(e) => setPBrand(e.target.value)}
                        placeholder="Brand name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <select
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        <option value="Eyeglasses">Eyeglasses</option>
                        <option value="Sunglasses">Sunglasses</option>
                        <option value="Contact Lenses">Contact Lenses</option>
                        <option value="Hearing Aids">Hearing Aids</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Price (₹)</Label>
                      <Input
                        type="number"
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                        placeholder="2999"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">MRP / Original (₹)</Label>
                      <Input
                        type="number"
                        value={pComparePrice}
                        onChange={(e) => setPComparePrice(e.target.value)}
                        placeholder="3999"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Frame Shape</Label>
                      <select
                        value={pShape}
                        onChange={(e) => setPShape(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        <option value="Square">Square</option>
                        <option value="Round">Round</option>
                        <option value="Aviator">Aviator</option>
                        <option value="Cat-Eye">Cat-Eye</option>
                        <option value="Geometric">Geometric</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Stock Quantity</Label>
                      <Input
                        type="number"
                        value={pStock}
                        onChange={(e) => setPStock(e.target.value)}
                        placeholder="10"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Material</Label>
                    <Input
                      value={pMaterial}
                      onChange={(e) => setPMaterial(e.target.value)}
                      placeholder="e.g. Handcrafted Acetate"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Product Image</Label>
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPImage(img.url)}
                          className={`h-12 overflow-hidden rounded-lg border-2 transition-all ${
                            pImage === img.url ? "border-primary ring-2 ring-primary/20" : "border-border opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={creatingProduct}>
                    {creatingProduct ? "Publishing..." : "Add to Store Catalog"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Right: Existing Products */}
            <div className="lg:col-span-2">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">Current Store Inventory ({products.length})</h3>
                  <span className="text-xs text-muted-foreground">Only this store's stock is shown</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {products.map((p) => (
                    <div key={p.id} className="group relative flex gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-soft hover:border-primary/40 transition-all">
                      <img
                        src={p.image || PRESET_IMAGES[0]?.url || ""}
                        alt={p.name}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes("unsplash")) {
                            target.src = "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80";
                          }
                        }}
                        className="h-20 w-20 rounded-lg object-cover bg-muted shrink-0"
                      />
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground truncate">{p.brand}</div>
                              <div className="font-semibold text-sm line-clamp-1">{p.name}</div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(p)}
                                title="Edit Product"
                                className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p)}
                                title="Delete Product"
                                className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-primary mt-1">₹{p.price?.toLocaleString("en-IN")}</div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                          <span>Stock: {p.stockCount ?? 15}</span>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-500 font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Product Modal */}
          {isEditModalOpen && editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto">
              <div className="surface-glass relative w-full max-w-xl rounded-3xl border border-border/80 p-6 sm:p-8 shadow-lift max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="font-display text-2xl font-semibold">Edit Product</h2>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  Update inventory details for "{editingProduct.name}". Changes reflect on the shop catalog immediately.
                </p>

                <form onSubmit={handleUpdateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Product Name *</Label>
                      <Input
                        required
                        value={eName}
                        onChange={(e) => setEName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Brand</Label>
                      <Input
                        value={eBrand}
                        onChange={(e) => setEBrand(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Category</Label>
                      <select
                        value={eCategory}
                        onChange={(e) => setECategory(e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="Eyeglasses">Eyeglasses</option>
                        <option value="Sunglasses">Sunglasses</option>
                        <option value="Contact Lenses">Contact Lenses</option>
                        <option value="Hearing Aids">Hearing Aids</option>
                        <option value="Vision Aids">Vision Aids</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Price (₹) *</Label>
                      <Input
                        type="number"
                        required
                        value={ePrice}
                        onChange={(e) => setEPrice(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Stock Count</Label>
                      <Input
                        type="number"
                        value={eStock}
                        onChange={(e) => setEStock(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={eDesc}
                      onChange={(e) => setEDesc(e.target.value)}
                      placeholder="Product description"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Product Image</Label>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEImage(img.url)}
                          className={`h-12 overflow-hidden rounded-lg border-2 transition-all ${
                            eImage === img.url ? "border-primary ring-2 ring-primary/20" : "border-border opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero" disabled={updatingProduct}>
                      {updatingProduct ? "Updating..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : null}

        {/* Tab 5: Appointments */}
        {activeTab === "appointments" ? (
          <div className="mt-8 space-y-6">
            {/* Overview Metrics Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="surface-glass rounded-2xl p-4 shadow-lift border border-border/80">
                <span className="text-xs font-medium text-muted-foreground uppercase">Total Bookings</span>
                <div className="mt-2 font-display text-2xl font-bold text-foreground">{appointments.length}</div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">All patient consultations</p>
              </div>

              <div className="surface-glass rounded-2xl p-4 shadow-lift border border-amber-500/30 bg-amber-500/5">
                <span className="text-xs font-semibold text-amber-500 uppercase flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Pending Action
                </span>
                <div className="mt-2 font-display text-2xl font-bold text-amber-500">
                  {appointments.filter((a) => a.status === "PENDING").length}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Awaiting store confirmation</p>
              </div>

              <div className="surface-glass rounded-2xl p-4 shadow-lift border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-xs font-semibold text-emerald-500 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
                </span>
                <div className="mt-2 font-display text-2xl font-bold text-emerald-500">
                  {appointments.filter((a) => a.status === "CONFIRMED").length}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Scheduled & verified</p>
              </div>

              <div className="surface-glass rounded-2xl p-4 shadow-lift border border-blue-500/30 bg-blue-500/5">
                <span className="text-xs font-semibold text-blue-500 uppercase flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Completed
                </span>
                <div className="mt-2 font-display text-2xl font-bold text-blue-500">
                  {appointments.filter((a) => a.status === "COMPLETED").length}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Tests conducted in clinic</p>
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
                    placeholder="Search name, phone, notes..."
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
                      a.type.toLowerCase().includes(q)
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
                    a.type.toLowerCase().includes(q)
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

        {/* Tab 6: Orders */}
        {activeTab === "orders" ? (
          <div className="mt-8">
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <h3 className="font-display text-lg font-semibold">Store Orders Management</h3>
              <div className="mt-4 divide-y divide-border/60">
                {orders.map((o) => (
                  <div key={o.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-bold text-foreground">{o.orderNumber}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Customer: <span className="font-medium text-foreground">{o.user?.customerProfile?.fullName || "Customer"}</span> · ₹{(o.totalPaise / 100).toLocaleString("en-IN")} ({o.paymentMethod})
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Items: {o.items?.map((it) => `${it.productName} (x${it.quantity})`).join(", ") || "Eyewear frame"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrder(o.id, e.target.value)}
                        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium"
                      >
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="READY_TO_SHIP">READY_TO_SHIP</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab: Customer Notifications & Broadcast Studio */}
        {activeTab === "notifications" ? (
          <div className="mt-8">
            <NotificationCampaignManager senderRole="OWNER" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
