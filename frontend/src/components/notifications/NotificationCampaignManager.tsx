import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Glasses,
  Tag,
  Eye,
  Megaphone,
  Sparkles,
  CheckCircle2,
  Users,
  Smartphone,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Flame,
  Calendar,
  Layers,
  Search,
  X,
  MessageCircle,
  Mail,
  SmartphoneNfc,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  NOTIFICATION_TEMPLATES,
  NotificationTemplate,
  NotificationCategory,
  NotificationPriority,
  NotificationTarget,
} from "@/lib/notificationTemplates";
import { apiRequest } from "@/lib/api";

interface CustomerOption {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  totalOrders: number;
  totalAppointments: number;
}

interface BroadcastHistoryItem {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  target: string;
  recipientCount: number;
  channels: string[];
  linkUrl?: string;
  ctaText?: string;
  imageUrl?: string;
  sentBy?: {
    userId: string;
    role: string;
    name?: string;
  };
  createdAt: string;
}

const PRESET_BANNER_IMAGES = [
  { label: "Premium Acetate Frames", url: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80" },
  { label: "Titanium Round Wire", url: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80" },
  { label: "Designer Havana Sunglasses", url: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80" },
  { label: "Child Vision & Student Glasses", url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80" },
  { label: "Modern Optical Clinic Lab", url: "https://images.unsplash.com/photo-1587502537147-2ba64a62e3d3?w=800&auto=format&fit=crop&q=80" },
];

export function NotificationCampaignManager({ senderRole }: { senderRole: "OWNER" | "SUPER_ADMIN" }) {
  // Active template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("new-collection-drop");

  // Form State
  const [title, setTitle] = useState(NOTIFICATION_TEMPLATES[0]?.defaultTitle || "");
  const [body, setBody] = useState(NOTIFICATION_TEMPLATES[0]?.defaultBody || "");
  const [category, setCategory] = useState<NotificationCategory>("NEW_COLLECTION");
  const [priority, setPriority] = useState<NotificationPriority>("HIGH");
  const [target, setTarget] = useState<NotificationTarget>("ALL");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState("/shop");
  const [ctaText, setCtaText] = useState("Explore Collection");
  const [imageUrl, setImageUrl] = useState(NOTIFICATION_TEMPLATES[0]?.defaultImageUrl || "");

  // Channel toggles
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(true);
  const [channelSms, setChannelSms] = useState(false);
  const [channelEmail, setChannelEmail] = useState(false);

  // Preview Mode
  const [previewMode, setPreviewMode] = useState<"in-app" | "mobile-push">("in-app");

  // Customers & History Data
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  // Load initial data
  const loadData = async () => {
    try {
      const [custRes, histRes] = await Promise.all([
        apiRequest<CustomerOption[]>("/notifications/customers"),
        apiRequest<BroadcastHistoryItem[]>("/notifications/broadcast-history"),
      ]);

      if (custRes.success && Array.isArray(custRes.data)) {
        setCustomers(custRes.data);
      }
      if (histRes.success && Array.isArray(histRes.data)) {
        setHistory(histRes.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle template selection
  const applyTemplate = (tpl: NotificationTemplate) => {
    setSelectedTemplateId(tpl.id);
    setTitle(tpl.defaultTitle);
    setBody(tpl.defaultBody);
    setCategory(tpl.category);
    setPriority(tpl.priority);
    setLinkUrl(tpl.defaultLinkUrl);
    setCtaText(tpl.defaultCtaText);
    setImageUrl(tpl.defaultImageUrl || "");
    toast.success(`Template applied: ${tpl.name}`);
  };

  // Helper to insert {name} token
  const insertNameToken = (targetField: "title" | "body") => {
    if (targetField === "title") {
      setTitle((prev) => `${prev} {name}`);
    } else {
      setBody((prev) => `${prev} {name}`);
    }
    toast.info("Added {name} placeholder token. It will dynamically personalize with each customer's name!");
  };

  // Dispatch Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notification headline / title.");
      return;
    }
    if (!body.trim()) {
      toast.error("Please enter the notification message body.");
      return;
    }

    if (target === "SPECIFIC_USERS" && selectedCustomerIds.length === 0) {
      toast.error("Please select at least one specific customer to notify.");
      return;
    }

    const channels: string[] = [];
    if (channelInApp) channels.push("IN_APP");
    if (channelWhatsapp) channels.push("WHATSAPP");
    if (channelSms) channels.push("SMS");
    if (channelEmail) channels.push("EMAIL");

    if (channels.length === 0) {
      toast.error("Please select at least one delivery channel.");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        category,
        priority,
        target,
        userIds: target === "SPECIFIC_USERS" ? selectedCustomerIds : undefined,
        channels,
        linkUrl: linkUrl.trim() || undefined,
        ctaText: ctaText.trim() || "View Details",
        imageUrl: imageUrl.trim() || undefined,
        templateId: selectedTemplateId,
      };

      const res = await apiRequest<{ recipientCount: number }>("/notifications/broadcast", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success(`🎉 Campaign Dispatched! Delivered to ${res.data?.recipientCount ?? "all"} customer(s).`);
        loadData();
      } else {
        toast.error(res.message || "Failed to broadcast notification.");
      }
    } catch {
      toast.error("An error occurred while sending notification.");
    } finally {
      setIsSending(false);
    }
  };

  // Filtered customer list for picker
  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const toggleCustomerId = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCategoryBadgeClass = (cat: NotificationCategory) => {
    switch (cat) {
      case "NEW_COLLECTION":
        return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      case "PROMOTION":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "EYE_HEALTH":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "STORE_UPDATE":
        return "bg-cyan-500/15 text-cyan-500 border-cyan-500/30";
      default:
        return "bg-primary/15 text-primary border-primary/30";
    }
  };

  // Replaces {name} in preview with sample name
  const samplePersonalizedTitle = title.replace(/\{name\}/gi, "Aarav Sharma");
  const samplePersonalizedBody = body.replace(/\{name\}/gi, "Aarav Sharma");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Stats Overview */}
      <div className="surface-glass rounded-2xl p-6 sm:p-8 shadow-soft border border-border/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Nayantara Opticals Campaign Studio
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Customer Broadcast & Notification Hub
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Create and dispatch high-converting announcements, seasonal discounts, fresh frame drops, and vision health reminders to your customers with live interactive preview.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 text-primary bg-primary/5">
              Active Sender: {senderRole === "SUPER_ADMIN" ? "Executive Admin" : "Store Owner"}
            </Badge>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <span className="text-xs text-muted-foreground block font-medium">Broadcasts Sent</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-foreground">{history.length}</span>
              <span className="text-[11px] text-emerald-500 font-medium">Recorded</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <span className="text-xs text-muted-foreground block font-medium">Customer Audience</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-foreground">
                {customers.length || 1}
              </span>
              <span className="text-[11px] text-primary font-medium">Registered</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <span className="text-xs text-muted-foreground block font-medium">Active Channels</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-foreground">4</span>
              <span className="text-[11px] text-muted-foreground">In-App, WA, SMS, Mail</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <span className="text-xs text-muted-foreground block font-medium">Top Template</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold font-display text-primary truncate">Eyewear Drops</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Ready-Made Optical Templates Carousel / Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Select Ready-Made Optical Template</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Click any pre-crafted optical campaign template below to instantly prefill the composer.
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {NOTIFICATION_TEMPLATES.length} templates available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {NOTIFICATION_TEMPLATES.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;

            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                    : "border-border/80 bg-card/80 hover:border-primary/40 hover:bg-card shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${tpl.badgeColor}`}>
                      {tpl.badgeLabel}
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs shadow-xs animate-in zoom-in-50">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {tpl.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">CTA: {tpl.defaultCtaText || "View Details"}</span>
                  <span className="text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {isSelected ? "Active" : "Apply"} <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 2-Column Composer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Composer Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSendBroadcast}
            className="surface-glass rounded-2xl p-6 sm:p-7 shadow-soft border border-border/80 space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" /> Notification Composer
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTemplateId("custom-template");
                  setTitle("");
                  setBody("");
                  setImageUrl("");
                  toast.info("Composer reset to blank.");
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Clear Form
              </Button>
            </div>

            {/* Target Audience */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Target Audience <span className="text-primary">*</span></span>
                <span className="text-xs text-muted-foreground font-normal">
                  {target === "ALL"
                    ? `Broadcasting to all ${customers.length || "active"} customers`
                    : target === "SPECIFIC_USERS"
                      ? `${selectedCustomerIds.length} customer(s) selected`
                      : target === "WITH_APPOINTMENTS"
                        ? "Patients with appointments"
                        : "Past buyers with orders"}
                </span>
              </Label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setTarget("ALL")}
                  className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                    target === "ALL"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border/80 hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <Users className="h-4 w-4 mx-auto mb-1 opacity-80" />
                  All Customers
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTarget("SPECIFIC_USERS");
                    setShowCustomerPicker(true);
                  }}
                  className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                    target === "SPECIFIC_USERS"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border/80 hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <Search className="h-4 w-4 mx-auto mb-1 opacity-80" />
                  Specific User(s)
                </button>

                <button
                  type="button"
                  onClick={() => setTarget("WITH_APPOINTMENTS")}
                  className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                    target === "WITH_APPOINTMENTS"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border/80 hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-4 w-4 mx-auto mb-1 opacity-80" />
                  Clinic Patients
                </button>

                <button
                  type="button"
                  onClick={() => setTarget("WITH_ORDERS")}
                  className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                    target === "WITH_ORDERS"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border/80 hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <Glasses className="h-4 w-4 mx-auto mb-1 opacity-80" />
                  Past Buyers
                </button>
              </div>

              {/* Specific user selection trigger badge */}
              {target === "SPECIFIC_USERS" && (
                <div className="pt-2 flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/60">
                  <span className="text-xs text-foreground font-medium">
                    {selectedCustomerIds.length > 0
                      ? `${selectedCustomerIds.length} customer(s) selected`
                      : "No customer chosen yet"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomerPicker(!showCustomerPicker)}
                    className="h-7 text-xs"
                  >
                    {showCustomerPicker ? "Hide List" : "Select Customers"}
                  </Button>
                </div>
              )}

              {/* Customer multi-select drawer/panel */}
              {target === "SPECIFIC_USERS" && showCustomerPicker && (
                <div className="p-3 rounded-xl border border-border bg-card/90 space-y-2 mt-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search customer by name, email or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-border/40 text-xs">
                    {filteredCustomers.length === 0 ? (
                      <p className="py-3 text-center text-muted-foreground text-xs">No matching customer found.</p>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const isChecked = selectedCustomerIds.includes(cust.id);
                        return (
                          <label
                            key={cust.id}
                            className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCustomerId(cust.id)}
                                className="rounded border-border accent-primary"
                              />
                              <div>
                                <strong className="text-foreground block">{cust.fullName}</strong>
                                <span className="text-[11px] text-muted-foreground">{cust.phone || cust.email}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {cust.totalOrders} orders
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Channels Checklist */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Dispatch Channels <span className="text-primary">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelInApp}
                    onChange={(e) => setChannelInApp(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-foreground">In-App Bell</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelWhatsapp}
                    onChange={(e) => setChannelWhatsapp(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-emerald-500 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelSms}
                    onChange={(e) => setChannelSms(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <Smartphone className="h-3 w-3" /> SMS
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelEmail}
                    onChange={(e) => setChannelEmail(e.target.checked)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                </label>
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Campaign Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                  className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="NEW_COLLECTION">👓 New Eyewear Collection / Drop</option>
                  <option value="PROMOTION">🎉 Promotional Offer & Discount</option>
                  <option value="EYE_HEALTH">👁️ Eye Health / Exam Reminder</option>
                  <option value="STORE_UPDATE">📢 Store Update / Clinic News</option>
                  <option value="ANNOUNCEMENT">✨ General Announcement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Priority</Label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                  className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="HIGH">High Priority (Highlighted)</option>
                  <option value="URGENT">Urgent / Important</option>
                </select>
              </div>
            </div>

            {/* Title / Headline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Headline / Title <span className="text-primary">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertNameToken("title")}
                    className="text-[11px] text-primary hover:underline font-mono cursor-pointer"
                  >
                    + Insert &#123;name&#125;
                  </button>
                  <span className="text-[11px] text-muted-foreground">{title.length}/100</span>
                </div>
              </div>
              <Input
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 👓 Fresh Italian Titanium Frames Just Dropped!"
                className="text-xs font-medium"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Notification Message Body <span className="text-primary">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertNameToken("body")}
                    className="text-[11px] text-primary hover:underline font-mono cursor-pointer"
                  >
                    + Insert &#123;name&#125;
                  </button>
                  <span className="text-[11px] text-muted-foreground">{body.length}/350</span>
                </div>
              </div>
              <Textarea
                rows={3}
                maxLength={350}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write message details for your customers..."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Action CTA Link & Label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">CTA Button Label</Label>
                <Input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Explore Collection"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Action Destination Link</Label>
                <div className="flex gap-2">
                  <select
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="/shop">Shop Eyewear (/shop)</option>
                    <option value="/book-appointment">Book Eye Checkup (/book-appointment)</option>
                    <option value="/book-appointment?type=myopia">Pediatric Myopia (/book-appointment?type=myopia)</option>
                    <option value="/contact">Store Location & Directions (/contact)</option>
                    <option value="/lenses">Prescription Lenses (/lenses)</option>
                    <option value="/services">Clinical Services (/services)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Banner Image URL & Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Banner Image (Optional)
              </Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_BANNER_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      imageUrl === preset.url
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border/60 hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="text-xs"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSending}
                variant="hero"
                size="lg"
                className="w-full font-bold shadow-md"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Dispatching Campaign...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Dispatch Notification Broadcast Now
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="surface-glass rounded-2xl p-6 shadow-soft border border-border/80 space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-foreground">Live Interactive Preview</h3>
              </div>

              {/* Preview mode toggle */}
              <div className="flex rounded-lg border border-border/60 p-0.5 bg-muted/20 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode("in-app")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    previewMode === "in-app"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  In-App Card
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile-push")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    previewMode === "mobile-push"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mobile Push
                </button>
              </div>
            </div>

            {/* IN-APP PREVIEW */}
            {previewMode === "in-app" ? (
              <div className="space-y-3">
                <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>How customer sees this on website:</span>
                  <span className="font-mono text-[10px] text-primary">Live Preview</span>
                </div>

                <div className="rounded-2xl border border-primary/30 bg-card p-4 shadow-md space-y-3 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(category)}`}>
                        {category.replace(/_/g, " ")}
                      </span>
                      {priority === "HIGH" || priority === "URGENT" ? (
                        <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                          {priority}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">Just now</span>
                  </div>

                  <h4 className="font-bold text-sm text-foreground leading-snug">
                    {samplePersonalizedTitle || "Notification Headline"}
                  </h4>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {samplePersonalizedBody || "Notification body text will appear here with customer personal details."}
                  </p>

                  {imageUrl && (
                    <div className="h-32 w-full rounded-xl overflow-hidden border border-border/80 bg-muted/20">
                      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" /> Nayantara Flagship
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      {ctaText || "View Details"}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* MOBILE PUSH / WHATSAPP PREVIEW */
              <div className="space-y-3">
                <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Mobile Notification simulation:</span>
                  <span className="font-mono text-[10px] text-emerald-500">WhatsApp / Push</span>
                </div>

                <div className="rounded-3xl border-2 border-border/80 bg-black/90 p-4 shadow-xl text-white space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-white/60 mb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-white">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-400" /> NAYANTARA OPTICALS
                    </span>
                    <span>now</span>
                  </div>

                  <p className="font-bold text-xs text-white leading-tight">
                    {samplePersonalizedTitle || "Headline"}
                  </p>

                  <p className="text-[11px] text-white/80 line-clamp-3 leading-relaxed">
                    {samplePersonalizedBody || "Notification preview text..."}
                  </p>

                  {imageUrl && (
                    <div className="h-24 w-full rounded-lg overflow-hidden border border-white/20 mt-1">
                      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                    <span>Tap to view in store / web</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs text-muted-foreground space-y-1">
              <strong className="text-foreground block font-semibold">
                💡 Tip on &#123;name&#125; Personalization
              </strong>
              <p className="text-[11px] leading-relaxed">
                Use <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">&#123;name&#125;</code> in either headline or body. Nayantara will automatically swap it with each recipient’s registered full name upon dispatch!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Past Broadcast Campaigns Log */}
      <div className="surface-glass rounded-2xl p-6 shadow-soft border border-border/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Past Broadcast Campaigns & Log
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              History of notifications sent by owners and administrators.
            </p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {history.length} records
          </Badge>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">
            No broadcast campaigns sent yet. Use the composer above to launch your first one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="py-2.5 px-3 font-semibold">Campaign Title</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Audience</th>
                  <th className="py-2.5 px-3 font-semibold">Recipients</th>
                  <th className="py-2.5 px-3 font-semibold">Channels</th>
                  <th className="py-2.5 px-3 font-semibold">Dispatched At</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(item.category as NotificationCategory)}`}>
                        {item.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {item.target === "ALL" ? "All Customers" : item.target.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-primary">
                      {item.recipientCount}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {item.channels?.join(", ") || "IN_APP"}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTitle(item.title);
                          setBody(item.body);
                          setCategory(item.category as NotificationCategory);
                          setPriority(item.priority as NotificationPriority);
                          if (item.linkUrl) setLinkUrl(item.linkUrl);
                          if (item.ctaText) setCtaText(item.ctaText);
                          if (item.imageUrl) setImageUrl(item.imageUrl);
                          toast.info("Campaign loaded into composer!");
                        }}
                        className="text-[11px] h-7 text-primary hover:text-primary"
                      >
                        Reuse
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
