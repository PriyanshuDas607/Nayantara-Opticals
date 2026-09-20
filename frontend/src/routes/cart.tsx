import { createFileRoute, Link } from "@tanstack/react-router";
import { CartPage as CartContent } from "@/components/pages/InfoPages";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/cart")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Your Bag — Nayantara Opticals" },
      { name: "description", content: "Review eyewear selected for reservation and expert fitting at Nayantara Opticals." },
    ],
  }),
  component: CartProtectedRoute,
});

function CartProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="surface-glass rounded-2xl p-8 shadow-lift">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Sign In to View Your Bag</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to access your reserved frames, saved prescription lenses, and fitting appointments.
          </p>
          <Button asChild variant="hero" className="mt-6 w-full">
            <Link to="/login">Sign In</Link>
          </Button>
          <div className="mt-4">
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/shop">Continue Browsing Frames</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <CartContent />;
}