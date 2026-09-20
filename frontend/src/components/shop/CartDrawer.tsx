import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, BookmarkPlus, ShoppingBag, FileText, CheckCircle2, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { inr } from "@/lib/site";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";

export function CartDrawer() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const {
    cart,
    saved,
    cartOpen,
    setCartOpen,
    setQuantity,
    removeLine,
    saveForLater,
    moveToCart,
    clearCart,
    subtotal,
    lineProduct,
  } = useShop();

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setCartOpen(false);
      toast.info("Please sign in to complete your reservation or purchase.");
      navigate({ to: "/login" });
      return;
    }

    if (cart.length === 0) return;

    setSubmittingOrder(true);
    const orderItems = cart.map((line) => {
      const prod = lineProduct(line);
      return {
        productId: line.productId,
        productName: prod ? prod.name : "Eyewear Frame",
        quantity: line.quantity,
        unitPricePaise: prod ? prod.price * 100 : 349900,
      };
    });

    const res = await apiRequest<{ id: string; orderNumber: string }>("/orders", {
      method: "POST",
      body: JSON.stringify({
        paymentMethod,
        items: orderItems,
        customerName: user?.customerProfile?.fullName || user?.email || "Valued Customer",
        phone: user?.phone || "+91 9876543210",
      }),
    });

    setSubmittingOrder(false);

    if (res.success) {
      toast.success("Order & in-store fitting reserved successfully!", {
        description: `Order ${res.data?.orderNumber || "confirmed"}. Live invoice generated.`,
      });
      clearCart();
      setCartOpen(false);
      navigate({ to: "/account" });
    } else {
      toast.error(res.message || "Failed to process order.");
    }
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/70 p-5">
          <SheetTitle className="font-display text-xl">Your bag</SheetTitle>
          <SheetDescription>
            Reserve online, collect and get fitted at the Uttam Nagar store.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-muted">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold">Your bag is empty</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Browse frames, lenses and hearing aids — explore our handcrafted catalog.
              </p>
              <Button variant="hero" size="pill" className="mt-5" asChild>
                <Link to="/shop" onClick={() => setCartOpen(false)}>
                  Shop eyewear
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((line) => {
                const product = lineProduct(line);
                if (!product) return null;
                return (
                  <li key={line.productId} className="flex gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      width={800}
                      height={800}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{product.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.brand} · {line.color}
                      </p>
                      <p className="mt-1 text-sm font-medium">{inr(product.price)}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="grid h-8 w-8 place-items-center rounded-l-full hover:bg-muted"
                            onClick={() => setQuantity(line.productId, line.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span className="w-8 text-center text-sm" aria-live="polite">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${product.name}`}
                            className="grid h-8 w-8 place-items-center rounded-r-full hover:bg-muted"
                            onClick={() => setQuantity(line.productId, line.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => saveForLater(line.productId)}
                        >
                          <BookmarkPlus className="h-3.5 w-3.5" /> Save
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                          onClick={() => removeLine(line.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {saved.length > 0 ? (
            <div className="mt-8">
              <p className="eyebrow">Saved for later</p>
              <ul className="mt-3 space-y-2">
                {saved.map((line) => {
                  const product = lineProduct(line);
                  if (!product) return null;
                  return (
                    <li
                      key={line.productId}
                      className="flex items-center gap-3 rounded-xl border border-border/70 p-2"
                    >
                      <img
                        src={product.image}
                        alt=""
                        loading="lazy"
                        width={800}
                        height={800}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <p className="min-w-0 flex-1 truncate text-sm">{product.name}</p>
                      <Button size="sm" variant="ghost" onClick={() => moveToCart(line.productId)}>
                        Move to bag
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        {cart.length > 0 ? (
          <div className="space-y-4 border-t border-border/70 p-5">
            <div className="flex items-start gap-2 rounded-xl bg-accent/60 p-3 text-xs">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p>
                Prescription lenses?{" "}
                <Link
                  to="/prescription"
                  onClick={() => setCartOpen(false)}
                  className="font-medium underline underline-offset-4"
                >
                  Add your prescription
                </Link>{" "}
                so we can prepare your order before you arrive.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 p-3 bg-card space-y-2">
              <span className="text-xs font-semibold text-foreground block">Select Payment Channel</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs text-left transition-all ${
                    paymentMethod === "ONLINE"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/70 text-muted-foreground hover:border-border"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>UPI / Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs text-left transition-all ${
                    paymentMethod === "COD"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/70 text-muted-foreground hover:border-border"
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  <span>Pay at Store</span>
                </button>
              </div>
            </div>

            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order Total</span>
              <span className="font-display text-xl font-semibold">{inr(subtotal)}</span>
            </div>

            <div className="grid gap-2">
              <Button
                variant="hero"
                size="pill"
                onClick={handleCheckout}
                disabled={submittingOrder}
              >
                {submittingOrder ? "Confirming Order..." : `Place Order & Reserve (${inr(subtotal)})`}
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
