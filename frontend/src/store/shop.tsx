import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { PRODUCTS, type Product } from "@/data/catalog";
import { useAuth } from "./auth";

export type CartLine = {
  productId: string;
  quantity: number;
  color: string;
  lensPackage?: string | undefined;
};

type ShopState = {
  cart: CartLine[];
  saved: CartLine[];
  wishlist: string[];
  compare: string[];
  recentlyViewed: string[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, opts?: { color?: string; lensPackage?: string; quantity?: number }) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
  markViewed: (product: Product) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  lineProduct: (line: CartLine) => Product | undefined;
};

const ShopContext = createContext<ShopState | null>(null);

const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [saved, setSaved] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart: ShopState["addToCart"] = useCallback((product, opts) => {
    if (!isAuthenticated) {
      toast.error("Sign in required", {
        description: "Please sign in to add items to your shopping bag.",
        action: {
          label: "Sign In",
          onClick: () => {
            window.location.href = "/login";
          },
        },
      });
      window.location.href = "/login";
      return;
    }

    const quantity = opts?.quantity ?? 1;
    const color = opts?.color ?? product.colors[0]?.name ?? "Default";
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + quantity, color } : l,
        );
      }
      return [...prev, { productId: product.id, quantity, color, lensPackage: opts?.lensPackage }];
    });
    toast.success(`${product.name} added to bag`, {
      description: `${color} · ${quantity} item${quantity > 1 ? "s" : ""}`,
    });
  }, [isAuthenticated]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeLine = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
    toast("Removed from bag");
  }, []);

  const saveForLater = useCallback((productId: string) => {
    setCart((prev) => {
      const line = prev.find((l) => l.productId === productId);
      if (line) setSaved((s) => (s.some((x) => x.productId === productId) ? s : [...s, line]));
      return prev.filter((l) => l.productId !== productId);
    });
    toast("Saved for later");
  }, []);

  const moveToCart = useCallback((productId: string) => {
    setSaved((prev) => {
      const line = prev.find((l) => l.productId === productId);
      if (line) setCart((c) => (c.some((x) => x.productId === productId) ? c : [...c, line]));
      return prev.filter((l) => l.productId !== productId);
    });
    toast.success("Moved back to bag");
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    if (!isAuthenticated) {
      toast.error("Sign in required", {
        description: "Please sign in to save frames to your wishlist.",
        action: {
          label: "Sign In",
          onClick: () => {
            window.location.href = "/login";
          },
        },
      });
      window.location.href = "/login";
      return;
    }

    setWishlist((prev) => {
      const has = prev.includes(product.id);
      toast(has ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`);
      return has ? prev.filter((id) => id !== product.id) : [...prev, product.id];
    });
  }, [isAuthenticated]);

  const toggleCompare = useCallback((product: Product) => {
    setCompare((prev) => {
      if (prev.includes(product.id)) return prev.filter((id) => id !== product.id);
      if (prev.length >= 3) {
        toast("Compare holds up to 3 frames", { description: "Remove one to add another." });
        return prev;
      }
      return [...prev, product.id];
    });
  }, []);

  const clearCompare = useCallback(() => setCompare([]), []);

  const markViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 6));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<ShopState>(() => {
    const subtotal = cart.reduce((sum, line) => {
      const product = findProduct(line.productId);
      return sum + (product ? product.price * line.quantity : 0);
    }, 0);
    return {
      cart,
      saved,
      wishlist,
      compare,
      recentlyViewed,
      cartOpen,
      setCartOpen,
      addToCart,
      setQuantity,
      removeLine,
      saveForLater,
      moveToCart,
      toggleWishlist,
      toggleCompare,
      clearCompare,
      markViewed,
      clearCart,
      cartCount: cart.reduce((n, l) => n + l.quantity, 0),
      subtotal,
      lineProduct: (line) => findProduct(line.productId),
    };
  }, [
    cart,
    saved,
    wishlist,
    compare,
    recentlyViewed,
    cartOpen,
    addToCart,
    setQuantity,
    removeLine,
    saveForLater,
    moveToCart,
    toggleWishlist,
    toggleCompare,
    clearCompare,
    markViewed,
    clearCart,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
