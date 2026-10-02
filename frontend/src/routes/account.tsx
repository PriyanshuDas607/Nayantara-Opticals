import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  User as UserIcon,
  Calendar,
  FileText,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Store,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Building2,
  Home,
  Check,
  Smartphone,
  Sparkles,
  AlertCircle,
  Save,
  Clock,
  Navigation,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth, SavedAddress } from "@/store/auth";
import { apiRequest } from "@/lib/api";
import { detectUserLocation } from "@/lib/location";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My Account & Settings — Nayantara Opticals" },
      { name: "description", content: "Manage your personal profile, delivery addresses, prescriptions, and orders." },
    ],
  }),
  component: AccountPage,
});

type ActiveTab = "profile" | "addresses" | "orders" | "prescriptions" | "appointments";

export function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  // Data states
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Form States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY">("PREFER_NOT_TO_SAY");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrAltPhone, setAddrAltPhone] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrLandmark, setAddrLandmark] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrType, setAddrType] = useState<"HOME" | "WORK" | "OTHER">("HOME");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Initial Sync from Auth Context
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    if (user) {
      setFullName(user.customerProfile?.fullName || user.ownerProfile?.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      if (user.customerProfile?.gender) {
        setGender(user.customerProfile.gender);
      }
      if (user.customerProfile?.dateOfBirth) {
        try {
          const iso = new Date(user.customerProfile.dateOfBirth).toISOString().split("T")[0];
          setDateOfBirth(iso || "");
        } catch {
          setDateOfBirth("");
        }
      }
      if (user.customerProfile?.whatsappOptIn !== undefined) {
        setWhatsappOptIn(user.customerProfile.whatsappOptIn);
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Load All User Sub-Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [addrRes, apptRes, rxRes, ordRes] = await Promise.all([
        apiRequest<SavedAddress[]>("/auth/addresses"),
        apiRequest<any[]>("/appointments/me"),
        apiRequest<any[]>("/prescriptions/me"),
        apiRequest<any[]>("/orders/me"),
      ]);

      if (addrRes.success && Array.isArray(addrRes.data)) {
        setAddresses(addrRes.data);
      } else if (user?.addresses && user.addresses.length > 0) {
        setAddresses(user.addresses);
      }

      if (apptRes.success && Array.isArray(apptRes.data)) {
        setAppointments(apptRes.data);
      }
      if (rxRes.success && Array.isArray(rxRes.data)) {
        setPrescriptions(rxRes.data);
      }
      if (ordRes.success && Array.isArray(ordRes.data)) {
        setOrders(ordRes.data);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          phone,
          alternatePhone,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          whatsappOptIn,
        }),
      });

      if (res.success) {
        toast.success("Personal information updated successfully!");
        setIsEditingProfile(false);
        await refreshProfile();
      } else {
        toast.error(res.message || "Failed to update profile details.");
      }
    } catch {
      toast.error("An error occurred while updating profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Reset Address Form
  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrName(user?.customerProfile?.fullName || fullName || "");
    setAddrPhone(user?.phone || phone || "");
    setAddrAltPhone("");
    setAddrPincode("");
    setAddrLine1("");
    setAddrLine2("");
    setAddrLandmark("");
    setAddrCity("New Delhi");
    setAddrState("Delhi");
    setAddrType("HOME");
    setAddrIsDefault(addresses.length === 0);
    setShowAddressForm(false);
  };

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Auto-Detect Current GPS Location and Populate or Save
  const handleAutoDetectLocation = async (autoSaveDirectly = false) => {
    setIsDetectingLocation(true);
    toast.info("Detecting your location via GPS...");
    try {
      const res = await detectUserLocation();
      if (!res.success || !res.data) {
        toast.error(res.message || "Could not detect location.");
        return;
      }
      const loc = res.data;
      setAddrLine1(loc.addressLine1 || "GPS Detected Address");
      setAddrLine2(loc.addressLine2 || "");
      setAddrCity(loc.city || "New Delhi");
      setAddrState(loc.state || "Delhi");
      setAddrPincode(loc.pincode || "110059");
      setAddrLandmark("Auto-detected GPS Location");
      setAddrName((prev) => prev || user?.customerProfile?.fullName || fullName || "My Address");
      setAddrPhone((prev) => prev || user?.phone || phone || "9876543210");
      setShowAddressForm(true);

      if (autoSaveDirectly) {
        const payload = {
          fullName: user?.customerProfile?.fullName || fullName || "My GPS Address",
          phone: user?.phone || phone || "9876543210",
          pincode: loc.pincode || "110059",
          addressLine1: loc.addressLine1,
          addressLine2: loc.addressLine2 || undefined,
          landmark: "Auto-detected GPS Location",
          city: loc.city || "New Delhi",
          state: loc.state || "Delhi",
          type: "HOME",
          isDefault: addresses.length === 0,
        };
        const saveRes = await apiRequest("/auth/addresses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (saveRes.success) {
          toast.success(`Location detected (${loc.city}, ${loc.pincode}) & saved to your profile!`);
          setShowAddressForm(false);
          loadData();
          return;
        }
      }

      toast.success(`Location detected: ${loc.city}, ${loc.pincode}! You can review or tweak details below.`);
    } catch {
      toast.error("Failed to fetch location. Please enter manually.");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Open Edit Address Form
  const handleEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrAltPhone(addr.alternatePhone || "");
    setAddrPincode(addr.pincode);
    setAddrLine1(addr.addressLine1);
    setAddrLine2(addr.addressLine2 || "");
    setAddrLandmark(addr.landmark || "");
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrType(addr.type || "HOME");
    setAddrIsDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  // Save Address (Create or Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrPincode || !addrLine1 || !addrCity || !addrState) {
      toast.error("Please fill in all mandatory address fields.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const payload = {
        fullName: addrName,
        phone: addrPhone,
        alternatePhone: addrAltPhone || undefined,
        pincode: addrPincode,
        addressLine1: addrLine1,
        addressLine2: addrLine2,
        landmark: addrLandmark,
        city: addrCity,
        state: addrState,
        type: addrType,
        isDefault: addrIsDefault,
      };

      if (editingAddressId) {
        // Update existing address
        const res = await apiRequest(`/auth/addresses/${editingAddressId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (res.success) {
          toast.success("Delivery address updated successfully!");
          resetAddressForm();
          loadData();
        } else {
          toast.error(res.message || "Failed to update address.");
        }
      } else {
        // Create new address
        const res = await apiRequest("/auth/addresses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.success) {
          if (res.token) {
            localStorage.setItem("nayantara_access_token", res.token);
          }
          toast.success("New delivery address added successfully!");
          resetAddressForm();
          loadData();
        } else {
          toast.error(res.message || "Failed to add address.");
        }
      }
    } catch {
      toast.error("An error occurred while saving address.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await apiRequest(`/auth/addresses/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        toast.success("Address removed.");
        loadData();
      } else {
        toast.error(res.message || "Failed to delete address.");
      }
    } catch {
      toast.error("Could not delete address.");
    }
  };

  // Set Address as Default
  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await apiRequest(`/auth/addresses/${id}/default`, {
        method: "PATCH",
      });
      if (res.success) {
        toast.success("Default delivery address updated.");
        loadData();
      }
    } catch {
      toast.error("Failed to update default address.");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-aurora py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Top Breadcrumb & Welcome Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span>My Account</span>
              <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-0.5">
                {user.role}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your personal details, delivery addresses, prescriptions, and orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "SUPER_ADMIN" ? (
              <Button asChild variant="hero" size="sm">
                <Link to="/admin">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Admin Console
                </Link>
              </Button>
            ) : user.role === "OWNER" ? (
              <Button asChild variant="hero" size="sm">
                <Link to="/owner">
                  <Store className="mr-2 h-4 w-4" /> Store Dashboard
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={logout} className="text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        {/* 2-Column Flipkart Style Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* User Profile Mini Header */}
            <div className="surface-glass rounded-2xl p-5 shadow-soft border border-border/80 flex items-center gap-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={fullName || "User Avatar"}
                  className="h-14 w-14 rounded-full object-cover border-2 border-primary/40 shadow-md flex-shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-primary/60 grid place-items-center text-white text-xl font-bold font-display shadow-md flex-shrink-0">
                  {(fullName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Hello,
                </p>
                <h2 className="text-lg font-bold text-foreground truncate font-display">
                  {fullName || "Valued Customer"}
                </h2>
                <p className="text-xs text-muted-foreground truncate">{user.email || user.phone}</p>
              </div>
            </div>

            {/* Menu List */}
            <div className="surface-glass rounded-2xl p-3 shadow-soft border border-border/80 divide-y divide-border/50">
              
              {/* Account Settings Section */}
              <div className="pb-3 pt-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Account Settings
                </p>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === "profile"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent/60"
                    }`}
                  >
                    <UserIcon className="h-4 w-4 flex-shrink-0" />
                    <span>Profile Information</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("addresses")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === "addresses"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>Manage Addresses</span>
                    </div>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {addresses.length}
                    </Badge>
                  </button>
                </nav>
              </div>

              {/* My Activity & Orders */}
              <div className="py-3">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  My Activity
                </p>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === "orders"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                      <span>My Orders</span>
                    </div>
                    <span className="text-xs opacity-75">{orders.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("prescriptions")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === "prescriptions"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span>My Prescriptions</span>
                    </div>
                    <span className="text-xs opacity-75">{prescriptions.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("appointments")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === "appointments"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Eye Test Appointments</span>
                    </div>
                    <span className="text-xs opacity-75">{appointments.length}</span>
                  </button>
                </nav>
              </div>

              {/* Help & Store Info */}
              <div className="pt-3">
                <div className="rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Nayantara Flagship Store
                  </p>
                  <p>Uttam Nagar, New Delhi · Daily 10 AM - 9 PM</p>
                  <p className="text-primary font-medium">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-8">
            
            {/* TAB 1: PERSONAL / PROFILE INFORMATION */}
            {activeTab === "profile" && (
              <div className="surface-glass rounded-2xl p-6 sm:p-8 shadow-soft border border-border/80 space-y-8">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-foreground">
                      Personal Information
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your identity and contact preferences for orders and store updates
                    </p>
                  </div>
                  {!isEditingProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit Details
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditingProfile}
                      placeholder="Enter your full name"
                      className="max-w-md bg-background/50"
                      required
                    />
                  </div>

                  {/* Gender (Flipkart style Radio options) */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-foreground">Your Gender</Label>
                    <div className="flex flex-wrap gap-4 pt-1">
                      {[
                        { label: "Male", value: "MALE" },
                        { label: "Female", value: "FEMALE" },
                        { label: "Other", value: "OTHER" },
                      ].map((item) => (
                        <label
                          key={item.value}
                          className={`flex items-center gap-2 cursor-pointer text-sm px-4 py-2 rounded-xl border transition-all ${
                            gender === item.value
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border/70 hover:border-border text-muted-foreground"
                          } ${!isEditingProfile ? "opacity-75 cursor-default" : ""}`}
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={item.value}
                            checked={gender === item.value}
                            onChange={() => isEditingProfile && setGender(item.value as any)}
                            disabled={!isEditingProfile}
                            className="text-primary focus:ring-primary h-4 w-4"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-xs font-semibold text-foreground">
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      disabled={!isEditingProfile}
                      className="max-w-md bg-background/50"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Used for personalized eyewear sizing and special birthday perks.
                    </p>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2 border-t border-border/40 pt-6">
                    <div className="flex items-center justify-between max-w-md">
                      <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                        Email Address
                      </Label>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    </div>
                    <div className="relative max-w-md">
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-muted/40 cursor-not-allowed pr-10"
                      />
                      <Mail className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Primary Mobile Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                      Primary Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative max-w-md">
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditingProfile}
                        placeholder="+91 9876543210"
                        className="bg-background/50 pr-10"
                      />
                      <Smartphone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Alternate / Secondary Phone Number (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="altPhone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span>Alternate Mobile Number</span>
                      <span className="text-[10px] font-normal text-muted-foreground">(Optional, for delivery backup)</span>
                    </Label>
                    <div className="relative max-w-md">
                      <Input
                        id="altPhone"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        disabled={!isEditingProfile}
                        placeholder="+91 9811223344"
                        className="bg-background/50 pr-10"
                      />
                      <Phone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* WhatsApp Opt-in */}
                  <div className="border-t border-border/40 pt-6">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={whatsappOptIn}
                        onChange={(e) => isEditingProfile && setWhatsappOptIn(e.target.checked)}
                        disabled={!isEditingProfile}
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Receive order updates & optical prescription on WhatsApp
                        </p>
                        <p className="text-xs text-muted-foreground">
                          We will send live courier tracking and eye exam reminders directly to your WhatsApp.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  {isEditingProfile && (
                    <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                      <Button type="submit" variant="hero" disabled={isSavingProfile}>
                        {isSavingProfile ? (
                          "Saving Changes..."
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1.5" /> Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>

                {/* FAQ / Help Section */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs space-y-2 text-muted-foreground">
                  <p className="font-semibold text-foreground">FAQS</p>
                  <p>
                    <strong className="text-foreground">What happens when I update my email address?</strong>
                    <br />
                    Your login credentials and future order invoices will be sent to the updated email address.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE ADDRESSES (FLIPKART STYLE) */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                
                {/* Header with "+ ADD A NEW ADDRESS" Button */}
                <div className="surface-glass rounded-2xl p-6 shadow-soft border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" /> Manage Delivery Addresses
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Save multiple delivery addresses for seamless checkout and prescription lens delivery.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => handleAutoDetectLocation(true)}
                      variant="outline"
                      size="sm"
                      className="border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-semibold shadow-sm"
                      disabled={isDetectingLocation}
                    >
                      {isDetectingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Detecting GPS...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-4 w-4 mr-1.5 text-primary" /> Auto-Detect GPS & Save
                        </>
                      )}
                    </Button>
                    {!showAddressForm && (
                      <Button
                        onClick={() => {
                          resetAddressForm();
                          setShowAddressForm(true);
                        }}
                        variant="hero"
                        size="sm"
                        className="shadow-md"
                      >
                        <Plus className="h-4 w-4 mr-1.5" /> Add New Address
                      </Button>
                    )}
                  </div>
                </div>

                {/* Collapsible Address Form (Add / Edit) */}
                {showAddressForm && (
                  <div className="surface-glass rounded-2xl p-6 sm:p-8 shadow-lift border-2 border-primary/30 space-y-6 animate-in fade-in-50 duration-200">
                    <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-4 gap-2">
                      <h3 className="text-base font-bold font-display text-primary flex items-center gap-2">
                        {editingAddressId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {editingAddressId ? "Edit Delivery Address" : "Add a New Delivery Address"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAutoDetectLocation(false)}
                          disabled={isDetectingLocation}
                          className="text-xs h-8 border-primary/30 text-primary font-medium"
                        >
                          {isDetectingLocation ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <Navigation className="h-3.5 w-3.5 mr-1 text-primary" />
                          )}
                          Auto-Fill Location
                        </Button>
                        <Button variant="ghost" size="sm" onClick={resetAddressForm} className="h-8">
                          Cancel
                        </Button>
                      </div>
                    </div>

                    <form onSubmit={handleSaveAddress} className="space-y-5">
                      {/* Row 1: Name & 10-digit Mobile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="addrName" className="text-xs font-semibold">
                            Full Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="addrName"
                            value={addrName}
                            onChange={(e) => setAddrName(e.target.value)}
                            placeholder="Recipient full name"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="addrPhone" className="text-xs font-semibold">
                            10-Digit Mobile Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="addrPhone"
                            value={addrPhone}
                            onChange={(e) => setAddrPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            required
                          />
                        </div>
                      </div>

                      {/* Row 2: Pincode & Locality / Area */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="addrPincode" className="text-xs font-semibold">
                            Pincode <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="addrPincode"
                            value={addrPincode}
                            onChange={(e) => setAddrPincode(e.target.value)}
                            placeholder="6-digit PIN code (e.g. 110059)"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="addrLine2" className="text-xs font-semibold">
                            Locality / Area / Sector
                          </Label>
                          <Input
                            id="addrLine2"
                            value={addrLine2}
                            onChange={(e) => setAddrLine2(e.target.value)}
                            placeholder="e.g. Om Vihar, Phase-1 / Dwarka Sector 14"
                          />
                        </div>
                      </div>

                      {/* Row 3: Address (Flat, House No, Building, Street) */}
                      <div className="space-y-1.5">
                        <Label htmlFor="addrLine1" className="text-xs font-semibold">
                          Address (Flat, House No., Building, Street) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="addrLine1"
                          value={addrLine1}
                          onChange={(e) => setAddrLine1(e.target.value)}
                          placeholder="e.g. WZ-27, Shop No. 1, Ground Floor"
                          required
                        />
                      </div>

                      {/* Row 4: City & State */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="addrCity" className="text-xs font-semibold">
                            City / District / Town <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="addrCity"
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            placeholder="e.g. New Delhi"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="addrState" className="text-xs font-semibold">
                            State <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="addrState"
                            value={addrState}
                            onChange={(e) => setAddrState(e.target.value)}
                            placeholder="e.g. Delhi"
                            required
                          />
                        </div>
                      </div>

                      {/* Row 5: Landmark & Alternate Phone (Optional) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="addrLandmark" className="text-xs font-semibold">
                            Landmark <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                          </Label>
                          <Input
                            id="addrLandmark"
                            value={addrLandmark}
                            onChange={(e) => setAddrLandmark(e.target.value)}
                            placeholder="e.g. Near Metro Pillar 703"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="addrAltPhone" className="text-xs font-semibold">
                            Alternate Phone <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                          </Label>
                          <Input
                            id="addrAltPhone"
                            value={addrAltPhone}
                            onChange={(e) => setAddrAltPhone(e.target.value)}
                            placeholder="e.g. 9811223344"
                          />
                        </div>
                      </div>

                      {/* Address Type Tag (Home / Work) */}
                      <div className="space-y-2 pt-2">
                        <Label className="text-xs font-semibold">Address Type</Label>
                        <div className="flex flex-wrap gap-4">
                          {[
                            { label: "Home (All day delivery)", value: "HOME", icon: Home },
                            { label: "Work (Delivery between 10 AM - 5 PM)", value: "WORK", icon: Building2 },
                            { label: "Other", value: "OTHER", icon: MapPin },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <label
                                key={item.value}
                                className={`flex items-center gap-2 cursor-pointer text-xs px-3.5 py-2 rounded-xl border transition-all ${
                                  addrType === item.value
                                    ? "border-primary bg-primary/10 text-primary font-semibold"
                                    : "border-border/70 hover:border-border text-muted-foreground"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="addrType"
                                  value={item.value}
                                  checked={addrType === item.value}
                                  onChange={() => setAddrType(item.value as any)}
                                  className="text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <Icon className="h-3.5 w-3.5" />
                                <span>{item.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Make Default Checkbox */}
                      <div className="pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={addrIsDefault}
                            onChange={(e) => setAddrIsDefault(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span>Set this as my default delivery address</span>
                        </label>
                      </div>

                      {/* Save & Cancel */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                        <Button type="submit" variant="hero" disabled={isSavingAddress}>
                          {isSavingAddress ? "Saving Address..." : editingAddressId ? "Update Address" : "Save Address"}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetAddressForm}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Saved Address Cards List */}
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`surface-glass rounded-2xl p-5 sm:p-6 shadow-soft border transition-all ${
                        addr.isDefault
                          ? "border-primary/50 bg-primary/[0.02]"
                          : "border-border/80 hover:border-border"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        <div className="space-y-2">
                          {/* Name, Badges, and Type */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-foreground text-sm font-display">
                              {addr.fullName}
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                              {addr.type || "HOME"}
                            </Badge>
                            {addr.isDefault && (
                              <Badge variant="default" className="bg-primary text-primary-foreground text-[10px]">
                                Default Address
                              </Badge>
                            )}
                          </div>

                          {/* Address lines */}
                          <p className="text-xs text-foreground/90 leading-relaxed max-w-xl">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                            {addr.landmark ? `, Landmark: ${addr.landmark}` : ""}
                            , <span className="font-semibold">{addr.city}, {addr.state} - {addr.pincode}</span>
                          </p>

                          {/* Phone numbers */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3 text-primary" /> {addr.phone}
                            </span>
                            {addr.alternatePhone && (
                              <span className="inline-flex items-center gap-1">
                                <Smartphone className="h-3 w-3 text-muted-foreground" /> Alt: {addr.alternatePhone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons (Flipkart style: Edit, Delete, Set Default) */}
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                          {!addr.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs text-primary hover:bg-primary/10 h-8"
                            >
                              Make Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAddress(addr)}
                            className="h-8 text-xs"
                          >
                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {addresses.length === 0 && !showAddressForm && (
                    <div className="surface-glass rounded-2xl p-12 text-center border border-dashed border-border/80 space-y-3">
                      <MapPin className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <h3 className="font-display font-semibold text-foreground">No addresses saved yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Add your home or office address for instant optical prescription frame deliveries.
                      </p>
                      <Button
                        onClick={() => {
                          resetAddressForm();
                          setShowAddressForm(true);
                        }}
                        variant="hero"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1.5" /> Add Your First Address
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MY ORDERS */}
            {activeTab === "orders" && (
              <div className="surface-glass rounded-2xl p-6 sm:p-8 shadow-soft border border-border/80 space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" /> My Orders & History
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Track status and delivery details of your optical frame orders
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/shop">Shop New Frames</Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                        <div>
                          <span className="font-mono text-xs font-bold text-foreground">
                            Order #{o.orderNumber}
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            Placed on {new Date(o.createdAt).toLocaleDateString()} · {o.paymentMethod}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-primary font-semibold">
                          {o.status}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <div className="text-muted-foreground">
                          {o.items?.length || 1} Item(s)
                        </div>
                        <div className="font-bold text-foreground text-sm font-display">
                          ₹{(o.totalPaise / 100).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <div className="py-12 text-center space-y-3">
                      <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs text-muted-foreground">You haven't placed any orders yet.</p>
                      <Button asChild variant="hero" size="sm">
                        <Link to="/shop">Explore Eyewear Catalog</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: MY PRESCRIPTIONS */}
            {activeTab === "prescriptions" && (
              <div className="surface-glass rounded-2xl p-6 sm:p-8 shadow-soft border border-border/80 space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> Saved Eye Prescriptions
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Doctor uploaded Rx files and manual optical power details
                    </p>
                  </div>
                  <Button asChild variant="hero" size="sm">
                    <Link to="/prescription">
                      <Plus className="h-4 w-4 mr-1.5" /> Upload New Rx
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {prescriptions.map((p) => (
                    <div key={p.id} className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-foreground">
                          {p.type === "FILE" ? "Doctor Uploaded Prescription" : "Manual Eye Power Entry"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {p.fileUpload ? (
                        <p className="font-mono text-xs text-primary truncate">
                          📄 {p.fileUpload.originalFileName}
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg">
                          <div><span className="text-muted-foreground">OD (Right):</span> <strong>{p.sphereOD || "0.00"}</strong></div>
                          <div><span className="text-muted-foreground">OS (Left):</span> <strong>{p.sphereOS || "0.00"}</strong></div>
                          <div><span className="text-muted-foreground">Cylinder:</span> <strong>{p.cylinderOD || "0.00"}</strong></div>
                          <div><span className="text-muted-foreground">PD:</span> <strong>{p.pd || "63mm"}</strong></div>
                        </div>
                      )}
                    </div>
                  ))}

                  {prescriptions.length === 0 && (
                    <div className="py-12 text-center space-y-3">
                      <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs text-muted-foreground">No eye prescriptions attached to this account.</p>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/prescription">Add Eye Power Details</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: APPOINTMENTS */}
            {activeTab === "appointments" && (
              <div className="surface-glass rounded-2xl p-6 sm:p-8 shadow-soft border border-border/80 space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" /> Store Eye Checkup Appointments
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your scheduled optometrist appointments at Nayantara Opticals
                    </p>
                  </div>
                  <Button asChild variant="hero" size="sm">
                    <Link to="/book">
                      <Plus className="h-4 w-4 mr-1.5" /> Book Appointment
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {appointments.map((a) => (
                    <div key={a.id} className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-foreground">
                          {a.type.replace("_", " ")}
                        </span>
                        <Badge variant="outline" className="text-primary font-semibold">
                          {a.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {new Date(a.appointmentDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at {a.timeSlot}
                      </p>
                    </div>
                  ))}

                  {appointments.length === 0 && (
                    <div className="py-12 text-center space-y-3">
                      <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs text-muted-foreground">No upcoming store checkup appointments.</p>
                      <Button asChild variant="hero" size="sm">
                        <Link to="/book">Schedule Free Eye Exam</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
