import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "nayantara_cookie_consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Show banner after brief delay for smooth entrance
        timer = setTimeout(() => setIsVisible(true), 1200);
      }
    } catch {
      // LocalStorage unavailable in private mode
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleConsent = (choice: "accepted" | "essential") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300 sm:bottom-6 sm:left-6"
    >
      <div className="surface-glass relative rounded-2xl border border-border/80 bg-card/95 p-5 shadow-lift backdrop-blur-xl sm:p-6">
        <button
          onClick={() => handleConsent("essential")}
          aria-label="Dismiss cookie notice with essential cookies only"
          className="absolute right-3.5 top-3.5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Cookie className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold text-foreground">
                Your Privacy & Cookie Choices
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> No Ad Tracking
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Nayantara Opticals uses essential cookies and local storage to manage your eyewear bag, clinical appointment bookings, and 2FA authentication. We respect your patient confidentiality and never sell your data to ad networks.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                variant="hero"
                className="h-8 rounded-full px-4 text-xs font-semibold"
                onClick={() => handleConsent("accepted")}
              >
                Accept All
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-full px-4 text-xs font-medium"
                onClick={() => handleConsent("essential")}
              >
                Essential Only
              </Button>
              <Link
                to="/cookies"
                className="text-xs font-medium text-primary hover:underline ml-1"
                onClick={() => setIsVisible(false)}
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
