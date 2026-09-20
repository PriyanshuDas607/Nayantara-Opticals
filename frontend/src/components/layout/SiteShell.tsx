import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Heart, MapPin, Menu, MessageCircle, ShoppingBag, X, User as UserIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { SITE, waLink } from "@/lib/site";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";

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
        <div className="mx-auto flex h-14 sm:h-15 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group min-w-0" aria-label="Nayantara Opticals home">
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Nayantara Opticals"
                className="h-8 sm:h-9 w-auto max-w-[12rem] object-contain object-left"
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

            {/* Account / Login Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              title={isAuthenticated ? "Your Account" : "Sign In"}
              className="relative"
            >
              <Link to={isAuthenticated ? "/account" : "/login"} aria-label="Account">
                <UserIcon className="h-5 w-5" />
                {isAuthenticated ? (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            </Button>

            {/* Saved Frames & Cart Bag only visible when logged in */}
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hidden sm:inline-flex"
                  title="Saved frames"
                >
                  <Link to="/shop" aria-label={`${wishlist.length} saved frames`}>
                    <Heart aria-hidden="true" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCartOpen(true)}
                  className="relative"
                  aria-label={`Open bag, ${cartCount} items`}
                >
                  <ShoppingBag aria-hidden="true" />
                  {cartCount > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
                      {cartCount}
                    </span>
                  ) : null}
                </Button>
              </>
            ) : null}
            <Button variant="hero" size="pill" asChild className="hidden md:inline-flex">
              <Link to="/book">Book an eye check</Link>
            </Button>
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
        {menuOpen ? (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-border/70 bg-card px-4 py-4 lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {NAV.map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-sm hover:bg-muted"
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/book"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-md bg-primary px-3 py-3 text-center text-sm font-medium text-primary-foreground"
              >
                Book an eye check
              </Link>
            </div>
          </nav>
        ) : null}
      </header>

      <main id="main-content">{children}</main>

      <footer className="border-t border-border bg-ink text-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
          <div>
            <p className="font-display text-2xl font-semibold">Nayantara Opticals</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/65">
              Independent optical care, considered eyewear and patient fitting in Uttam Nagar since
              1990.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase">Visit</p>
            <p className="mt-3 text-sm leading-relaxed text-background/65">{SITE.address}</p>
            <a
              href={SITE.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-champagne"
            >
              <MapPin className="h-4 w-4" /> Get directions
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase">Explore</p>
            <div className="mt-3 grid gap-2 text-sm text-background/65">
              <Link to="/contact">Contact & hours</Link>
              <Link to="/services">Eye care & services</Link>
              {isAuthenticated ? <Link to="/cart">Your bag</Link> : null}
              <Link to="/reviews">Reviews & feedback</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 px-4 py-4 text-center text-xs text-background/45">
          © 2026 Nayantara Opticals · New Delhi
        </div>
      </footer>
      <Button
        variant="hero"
        size="icon"
        asChild
        className="fixed right-4 bottom-4 z-30 h-12 w-12 rounded-full shadow-lift sm:right-6 sm:bottom-6"
        title="Ask on WhatsApp"
      >
        <a
          href={waLink("Hi Nayantara Opticals, I'd like some help.")}
          target="_blank"
          rel="noreferrer"
          aria-label="Ask Nayantara Opticals on WhatsApp"
        >
          <MessageCircle aria-hidden="true" />
        </a>
      </Button>
      <CartDrawer />
    </div>
  );
}
