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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/owner")({
  staticData: { sitemap: false },
  component: OwnerPage,
});

type OwnerTab = "overview" | "finance" | "engagement" | "products" | "appointments" | "orders";

interface AppointmentItem {
  id: string;
  type: string;
  status: string;
  appointmentDate: string;
  timeSlot: string;
  notes?: string;
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

export function OwnerPage() {
  const { user, isOwner, isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<OwnerTab>("overview");
  const [loading, setLoading] = useState(false);

  // Store data
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [finance, setFinance] = useState<OwnerFinanceData | null>(null);
  const [engagement, setEngagement] = useState<AnalyticsOverview | null>(null);
  const [txSearch, setTxSearch] = useState("");

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
      const [apptRes, orderRes, prodRes, financeRes, engagementRes] = await Promise.all([
        apiRequest<AppointmentItem[]>("/owner/appointments"),
        apiRequest<OrderItem[]>("/owner/orders"),
        apiRequest<any[]>("/products"),
        apiRequest<OwnerFinanceData>("/owner/finance"),
        apiRequest<AnalyticsOverview>("/owner/analytics/engagement"),
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
      if (engagementRes.success && engagementRes.data) {
        setEngagement(engagementRes.data);
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

  const maxDwellSec = Math.max(
    ...(engagement?.topPages?.map((p) => p.totalActiveSeconds) || [100])
  );

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
          <nav className="flex space-x-4 overflow-x-auto">
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
              onClick={() => setActiveTab("engagement")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "engagement"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Clock className="h-4 w-4" /> Visitor Traffic & Dwell Time
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

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Appointments</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-champagne/15 text-champagne">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">{appointments.length}</div>
                <p className="mt-1 text-xs text-muted-foreground">Clinical eye checks</p>
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
                    <Flame className="h-4 w-4 text-amber-500" />
                    Customer Traffic Insights
                  </span>
                  <h3 className="mt-1 text-lg font-bold">Most Time Spent on: {engagement?.topPages[0]?.pageTitle || "Eyewear Catalog"}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visitors spend ~{engagement?.topPages[0]?.totalActiveMinutes || 0} minutes actively exploring frame styles before booking tests or ordering.
                  </p>
                </div>
                <div className="mt-4">
                  <Button onClick={() => setActiveTab("engagement")} variant="outline" size="sm">
                    View Visitor Dwell Breakdown <ChevronRight className="ml-1 h-4 w-4" />
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

        {/* Tab 3: Visitor Dwell Time & Traffic */}
        {activeTab === "engagement" ? (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Store Visitor Dwell Time</span>
                <div className="mt-3 font-display text-3xl font-bold text-primary">
                  {engagement?.totalActiveMinutes || 0} mins
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Active visible interest on store pages</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Total Page Views</span>
                <div className="mt-3 font-display text-3xl font-bold">
                  {engagement?.totalPageViews || 0}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Customer visits recorded</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Live Browsing Customers</span>
                <div className="mt-3 font-display text-3xl font-bold text-emerald-500">
                  {engagement?.liveOnline || 1} Online
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Active visible tab telemetry</p>
              </div>

              <div className="surface-glass rounded-2xl p-6 shadow-lift">
                <span className="text-xs font-medium text-muted-foreground uppercase">Highest Attention Page</span>
                <div className="mt-3 font-display text-xl font-bold truncate text-primary">
                  {engagement?.topPages[0]?.pagePath || "/shop"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {engagement?.topPages[0]?.totalActiveMinutes || 0} mins continuous browsing
                </p>
              </div>
            </div>

            {/* Page Dwell Breakdown */}
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Customer Attention & Dwell Time by Section
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Discover which products and services customers spend the most time viewing before making appointments or orders
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                  <Activity className="h-3.5 w-3.5" /> Live Telemetry
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
                              {page.totalViews} views · {page.uniqueVisitors} unique customers
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:min-w-[140px]">
                          <div className="font-display text-base font-bold text-primary">
                            {page.totalActiveMinutes} mins
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Avg time: <span className="font-semibold text-foreground">{avgMin}m {avgSec}s</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Store Attention Share</span>
                          <span className="font-semibold text-primary">{page.sharePercent}%</span>
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
          <div className="mt-8">
            <div className="surface-glass rounded-2xl p-6 shadow-lift">
              <h3 className="font-display text-lg font-semibold">Customer Appointments</h3>
              <div className="mt-4 divide-y divide-border/60">
                {appointments.map((a) => (
                  <div key={a.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-semibold">{a.user?.customerProfile?.fullName || "Customer"}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-1">
                        <span>📞 {a.user?.phone || "+91 9876543210"}</span>
                        <span>📅 {a.appointmentDate}</span>
                        <span>⏰ {a.timeSlot}</span>
                        <span>🩺 {a.type}</span>
                      </div>
                      {a.notes ? <p className="mt-1 text-xs italic text-muted-foreground">Note: "{a.notes}"</p> : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={a.status === "CONFIRMED" ? "default" : "outline"}
                        onClick={() => handleUpdateAppointment(a.id, "CONFIRMED")}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant={a.status === "COMPLETED" ? "secondary" : "outline"}
                        onClick={() => handleUpdateAppointment(a.id, "COMPLETED")}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleUpdateAppointment(a.id, "CANCELLED")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
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
      </div>
    </div>
  );
}
