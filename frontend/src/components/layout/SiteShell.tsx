import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  ShoppingBag,
  X,
  User as UserIcon,
  ShieldCheck,
  Phone,
  Home,
  Glasses,
  CalendarDays,
  Sparkles,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { SITE, waLink } from "@/lib/site";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";
import { EyecareChatbot } from "@/components/chatbot/EyecareChatbot";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CookieConsent } from "@/components/layout/CookieConsent";

const NAV = [
  ["Shop", "/shop"],
  ["Virtual Try-On", "/try-on"],
  ["Services", "/services"],
  ["Lenses", "/lenses"],
  ["Myopia Care", "/myopia-management"],
  ["Reviews", "/reviews"],
  ["Our Story", "/about"],
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, wishlist, setCartOpen } = useShop();
  const { user, isAuthenticated, isAdmin, isOwner } = useAuth();
  const location = useLocation();

  // Active Tab Dwell Time & Heartbeat Telemetry
  useEffect(() => {
    let anonymousId = localStorage.getItem("nayantara_anon_id");
    if (!anonymousId) {
      anonymousId = `anon_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem("nayantara_anon_id", anonymousId);
    }

    // 1. Send immediate page view on route arrival
    apiRequest("/analytics/heartbeat", {
      method: "POST",
      body: JSON.stringify({
        anonymousId,
        eventName: "page_view",
        pagePath: location.pathname,
        pageTitle: document.title,
        activeDurationSec: 5,
      }),
    }).catch(() => {});

    // 2. Continuous visible-tab dwell heartbeat every 15s
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        apiRequest("/analytics/heartbeat", {
          method: "POST",
          body: JSON.stringify({
            anonymousId,
            eventName: "page_heartbeat",
            pagePath: location.pathname,
            pageTitle: document.title,
            activeDurationSec: 15,
          }),
        }).catch(() => {});
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  // Client Runtime Error Reporting to Error Monitor
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      apiRequest("/analytics/error-log", {
        method: "POST",
        body: JSON.stringify({
          message: event.message || "Uncaught client runtime error",
          stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
          endpoint: window.location.pathname,
          source: "FRONTEND_CLIENT",
        }),
      }).catch(() => {});
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      apiRequest("/analytics/error-log", {
        method: "POST",
        body: JSON.stringify({
          message: event.reason?.message || String(event.reason) || "Unhandled promise rejection",
          stack: event.reason?.stack,
          endpoint: window.location.pathname,
          source: "FRONTEND_CLIENT",
        }),
      }).catch(() => {});
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      <a
        href="#main-content"
        className="sr-only z-[100] focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      {/* Top Announcement Bar */}
      <div className="bg-ink px-3 sm:px-4 py-1.5 text-background border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] font-medium tracking-wide">
          <span className="flex items-center gap-1.5 truncate">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400 shrink-0" />
            <span className="truncate">Uttam Nagar, Opp. Metro Pillar 703 - Established 1990</span>
          </span>
          <div className="hidden sm:flex items-center gap-4 text-background/80 text-[11px]">
            <span>Mon-Sat 10:00 AM - 8:30 PM</span>
            <span>·</span>
            <a href="tel:+919876543210" className="hover:text-champagne transition-colors flex items-center gap-1">
              <Phone className="h-3 w-3" /> Call 098765 43210
            </a>
          </div>
          <a
            href={waLink("Hello Nayantara Opticals, I need advice on eye care or frames.")}
            target="_blank"
            rel="noreferrer"
            className="sm:hidden text-champagne hover:underline flex items-center gap-1 text-[11px] font-semibold shrink-0"
          >
            <MessageCircle className="h-3 w-3 text-emerald-400" /> WhatsApp
          </a>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-3 px-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group shrink-0 flex items-center" aria-label="Nayantara Opticals home">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Nayantara Opticals"
                className="h-10 sm:h-11 md:h-12 w-auto max-w-[13.5rem] sm:max-w-[16rem] object-contain object-left"
              />
            </div>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            {NAV.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-semibold" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden lg:inline-flex text-xs font-semibold text-primary border-primary/30 rounded-md"
              >
                <Link to="/admin">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Admin
                </Link>
              </Button>
            ) : isOwner ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden lg:inline-flex text-xs font-semibold text-champagne border-champagne/30 rounded-md"
              >
                <Link to="/owner">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Store View
                </Link>
              </Button>
            ) : null}

            {/* Virtual Try-On Studio Action */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex text-xs font-semibold text-amber-500 border-amber-500/30 rounded-md hover:bg-amber-500/10 gap-1.5"
            >
              <Link to="/try-on">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <Camera className="h-3.5 w-3.5" />
                <span>Try-On</span>
              </Link>
            </Button>

            {/* Notifications Bell */}
            <NotificationBell />

            {/* Account / Login Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              title={isAuthenticated ? "Your Account" : "Sign In"}
              className="relative h-9 w-9 rounded-md"
            >
              <Link to={isAuthenticated ? "/account" : "/login"} aria-label="Account">
                {isAuthenticated && user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.customerProfile?.fullName || "Account"}
                    className="h-6 w-6 rounded-md object-cover border border-primary/40 ring-1 ring-primary/20"
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
                {isAuthenticated && !user?.avatarUrl ? (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            </Button>

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:inline-flex h-9 w-9 rounded-md"
              title="Saved frames"
            >
              <Link to="/shop" aria-label={`${wishlist.length} saved frames`}>
                <Heart aria-hidden="true" className={wishlist.length > 0 ? "fill-destructive text-destructive" : ""} />
              </Link>
            </Button>

            {/* Cart Bag Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              className="relative h-9 w-9 rounded-md"
              aria-label={`Open bag, ${cartCount} items`}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-sm bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-xs">
                  {cartCount}
                </span>
              ) : null}
            </Button>

            <Button variant="hero" size="default" asChild className="hidden md:inline-flex rounded-md">
              <Link to="/book">Book an eye check</Link>
            </Button>

            {/* Mobile Hamburger Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-md"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen ? (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-border/70 bg-card/98 backdrop-blur-2xl px-4 py-4 lg:hidden shadow-xl"
          >
            <div className="mx-auto grid max-w-7xl gap-1.5">
              <div className="px-3 py-1.5 mb-1 rounded-md bg-muted border border-border flex items-center justify-between text-xs text-foreground font-medium">
                <span>Independent Optical Practice</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-semibold">Est. 1990</span>
              </div>

              {NAV.map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-md px-3.5 py-2.5 text-sm font-medium hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <span>{label}</span>
                  <span className="text-xs text-muted-foreground">-&gt;</span>
                </Link>
              ))}

              <div className="my-2 border-t border-border/60 pt-3 grid gap-2.5">
                <Link
                  to="/book"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CalendarDays className="h-4 w-4" /> Book an eye checkup
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-primary" /> Call Store
                  </a>
                  <a
                    href={waLink("Hello Nayantara Opticals, I want to inquire about eyewear.")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
                  </a>
                </div>

                <div className="rounded-md bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-start gap-2 border border-border/50">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Opp. Metro Pillar 703, Uttam Nagar</p>
                    <p className="mt-0.5 text-muted-foreground">Open Mon-Sat 10:00 AM - 8:30 PM (Sun 11:00 AM - 7:00 PM)</p>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        ) : null}
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          <Link
            to="/"
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-primary font-bold" }}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">Home</span>
          </Link>

          <Link
            to="/shop"
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-primary font-bold" }}
          >
            <Glasses className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">Frames</span>
          </Link>

          {/* Center Action: Book Eye Test */}
          <Link
            to="/book"
            className="-mt-5 flex flex-col items-center justify-center"
            aria-label="Book an Eye Test"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm border-2 border-background ring-1 ring-border">
              <CalendarDays className="h-5 w-5" />
            </span>
            <span className="mt-1 text-[10px] font-bold text-primary leading-none">Book Test</span>
          </Link>

          <a
            href={waLink("Hello Nayantara Opticals, I need advice on frames & lenses.")}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-muted-foreground transition-colors hover:text-emerald-600"
            aria-label="Chat with Optician on WhatsApp"
          >
            <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-medium leading-none text-emerald-700 dark:text-emerald-400">WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex flex-col items-center justify-center gap-1 py-1 px-3 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Open shopping bag with ${cartCount} items`}
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-sm bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-medium leading-none">Bag</span>
          </button>
        </div>
      </nav>

      <footer className="border-t border-border bg-ink text-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10 lg:px-8">
          <div>
            <p className="font-display text-2xl font-semibold">Nayantara Opticals</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/80">
              Independent optical care, considered eyewear and patient fitting in Uttam Nagar since
              1990. Certified optometrists & precision lens laboratory.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-champagne font-medium">
              <ShieldCheck className="h-4 w-4" /> 100% Patient Privacy & Quality Guarantee
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-champagne">Visit</p>
            <p className="mt-3 text-sm leading-relaxed text-background/80">{SITE.address}</p>
            <a
              href={SITE.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-champagne hover:underline"
            >
              <MapPin className="h-4 w-4" /> Get directions
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-champagne">Explore</p>
            <div className="mt-3 grid gap-2 text-sm text-background/80">
              <Link to="/contact" className="hover:text-champagne transition-colors">Contact & hours</Link>
              <Link to="/services" className="hover:text-champagne transition-colors">Eye care & services</Link>
              <Link to="/lenses" className="hover:text-champagne transition-colors">Lens technology</Link>
              <Link to="/myopia-management" className="hover:text-champagne transition-colors">Myopia management</Link>
              {isAuthenticated ? <Link to="/cart" className="hover:text-champagne transition-colors">Your bag</Link> : null}
              <Link to="/reviews" className="hover:text-champagne transition-colors">Reviews & feedback</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-champagne">Trust & Legal</p>
            <div className="mt-3 grid gap-2 text-sm text-background/80">
              <Link to="/privacy" className="hover:text-champagne transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-champagne transition-colors">Terms & Conditions</Link>
              <Link to="/refund" className="hover:text-champagne transition-colors">Refund & Replacement</Link>
              <Link to="/cookies" className="hover:text-champagne transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-background/15 px-4 py-5 text-center text-xs text-background/80">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
            <p>© 2026 Nayantara Opticals · New Delhi. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-background/70">
              <Link to="/privacy" className="hover:text-champagne transition-colors">Privacy</Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-champagne transition-colors">Terms</Link>
              <span>·</span>
              <Link to="/refund" className="hover:text-champagne transition-colors">Refunds</Link>
              <span>·</span>
              <Link to="/cookies" className="hover:text-champagne transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
      <EyecareChatbot />
      <CartDrawer />
      <CookieConsent />
    </div>
  );
}
