import { Heart, Eye, ShoppingBag, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/common/StarRating";
import { inr } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/auth";
import type { Product } from "@/data/catalog";

export function ProductCard({
  product,
  onQuickView,
  onEdit,
  onDelete,
}: {
  product: Product;
  onQuickView: (product: Product) => void;
  onEdit?: ((product: Product) => void) | undefined;
  onDelete?: ((product: Product) => void | Promise<void>) | undefined;
}) {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const { isAdmin, isOwner } = useAuth();
  const wished = wishlist.includes(product.id);

  return (
    <article className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
      <div className="sheen relative aspect-square overflow-hidden bg-muted/60">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name} — ${product.style} ${product.category.replace("-", " ")}`}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="rounded-full bg-card/90 text-[11px]">
              {badge}
            </Badge>
          ))}
          {!product.inStock && (
            <Badge variant="outline" className="rounded-full bg-card/90 text-[11px]">
              Waitlist
            </Badge>
          )}
        </div>

        {/* Top Right Actions: Wishlist + Staff Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {(isAdmin || isOwner) && (
            <>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  aria-label={`Edit ${product.name}`}
                  title="Edit Product (Store Owner / Admin)"
                  className="grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-card/90 text-foreground backdrop-blur-sm transition-colors hover:bg-primary hover:text-white"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  aria-label={`Delete ${product.name}`}
                  title="Delete Product (Store Owner / Admin)"
                  className="grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-card/90 text-destructive backdrop-blur-sm transition-colors hover:bg-destructive hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={wished}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/85 backdrop-blur-sm transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Heart
              className={cn("h-4 w-4", wished ? "fill-destructive text-destructive" : "text-foreground")}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
          <Button
            variant="quiet"
            size="sm"
            className="flex-1 rounded-full"
            onClick={() => onQuickView(product)}
          >
            <Eye className="h-4 w-4" aria-hidden="true" /> Quick view
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {product.brand}
          </p>
          <h3 className="mt-1 truncate text-base font-semibold">{product.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {product.style} · {product.material}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={product.rating} />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviews})
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold">{inr(product.price)}</p>
            {product.compareAt ? (
              <p className="text-xs text-muted-foreground line-through">{inr(product.compareAt)}</p>
            ) : null}
          </div>
          <Button
            size="sm"
            variant={product.inStock ? "hero" : "quiet"}
            className="rounded-full"
            onClick={() => (product.inStock ? addToCart(product) : onQuickView(product))}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {product.inStock ? "Add" : "Notify"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
