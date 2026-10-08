import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Heart, MapPin, Menu, MessageCircle, ShoppingBag, X, User as UserIcon, ShieldCheck, Phone } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only z-[100] focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div className="bg-ink px-4 py-1.5 text-center text-[10.5px] font-medium tracking-[0.14em] text-background uppercase">
        Trusted optical care in New Delhi for 35+ years
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group shrink-0" aria-label="Nayantara Opticals home">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Nayantara Opticals"
                className="h-9 sm:h-11 md:h-12 w-auto max-w-[13rem] sm:max-w-[16rem] object-contain object-left transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            {NAV.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            {isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden lg:inline-flex text-xs font-semibold text-primary border-primary/30"
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
                className="hidden lg:inline-flex text-xs font-semibold text-champagne border-champagne/30"
              >
                <Link to="/owner">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Store View
                </Link>
              </Button>
            ) : null}

            {/* Notifications Bell (for authenticated users) */}
            <NotificationBell />

            {/* Account / Login Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              title={isAuthenticated ? "Your Account" : "Sign In"}
              className="relative"
            >
              <Link to={isAuthenticated ? "/account" : "/login"} aria-label="Account">
                {isAuthenticated && user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.customerProfile?.fullName || "Account"}
                    className="h-6 w-6 rounded-full object-cover border border-primary/40 ring-1 ring-primary/20"
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
                {isAuthenticated && !user?.avatarUrl ? (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            </Button>

            {/* Wishlist Button (Tablet & Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:inline-flex"
              title="Saved frames"
            >
              <Link to="/shop" aria-label={`${wishlist.length} saved frames`}>
                <Heart aria-hidden="true" className={wishlist.length > 0 ? "fill-destructive text-destructive" : ""} />
              </Link>
            </Button>

            {/* Cart Bag Button (Always accessible to all mobile and desktop shoppers) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              className="relative"
              aria-label={`Open bag, ${cartCount} items`}
            >
              <ShoppingBag aria-hidden="true" />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground animate-in zoom-in-50">
                  {cartCount}
                </span>
              ) : null}
            </Button>

            <Button variant="hero" size="pill" asChild className="hidden md:inline-flex">
              <Link to="/book">Book an eye check</Link>
            </Button>

            {/* Mobile Hamburger Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
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
            className="border-t border-border/70 bg-card/95 backdrop-blur-xl px-4 py-4 lg:hidden animate-in fade-in-50 duration-200"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {NAV.map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <span>{label}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </Link>
              ))}

              <div className="my-2 border-t border-border/60 pt-2 grid gap-2">
                <Link
                  to="/book"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  Book an eye checkup
                </Link>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-primary" /> Call Store
                  </a>
                  <a
                    href={waLink("Hello Nayantara Opticals, I want to inquire about eyewear.")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>

                <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>Opp. Metro Pillar 703, Uttam Nagar · Open Mon-Sat 10AM-8:30PM</span>
                </div>
              </div>
            </div>
          </nav>
        ) : null}
      </header>

      <main id="main-content">{children}</main>

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
