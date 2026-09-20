import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Check, Heart, MessageCircle, ShoppingBag, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/common/StarRating";
import { TryOnDialog } from "@/components/common/TryOnDialog";
import { inr, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop";
import type { Product } from "@/data/catalog";

export function ProductDialog({
  product,
  onOpenChange,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [color, setColor] = useState<string>("");
  const [tryOn, setTryOn] = useState(false);

  useEffect(() => {
    if (product) setColor(product.colors[0]?.name ?? "");
  }, [product]);

  if (!product) return null;
  const wished = wishlist.includes(product.id);
  const isFrame = product.category === "eyeglasses" || product.category === "sunglasses";

  return (
    <>
      <Dialog open={!!product} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92dvh] max-w-4xl overflow-y-auto p-0">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="bg-lens relative aspect-square md:aspect-auto md:min-h-[520px]">
              <img
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                loading="lazy"
                width={800}
                height={800}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                {product.badges.map((b) => (
                  <Badge key={b} className="rounded-full bg-card/90 text-foreground">
                    {b}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <div className="min-w-0">
                <p className="eyebrow">{product.brand}</p>
                <DialogTitle className="mt-2 text-2xl leading-tight sm:text-3xl">
                  {product.name}
                </DialogTitle>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StarRating value={product.rating} />
                  <span className="text-xs text-muted-foreground">
                    {product.rating} · {product.reviews} reviews
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      product.inStock
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {product.inStock ? "In stock at Uttam Nagar" : "Currently on waitlist"}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-3">
                <p className="font-display text-3xl font-semibold">{inr(product.price)}</p>
                {product.compareAt ? (
                  <p className="pb-1 text-sm text-muted-foreground line-through">
                    {inr(product.compareAt)}
                  </p>
                ) : null}
              </div>

              <p className="text-balance-pretty text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {product.colors.length > 1 ? (
                <div>
                  <p className="text-xs font-medium">Colour · {color}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColor(c.name)}
                        aria-label={`Select colour ${c.name}`}
                        aria-pressed={color === c.name}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          color === c.name
                            ? "scale-110 border-primary"
                            : "border-border hover:scale-105",
                        )}
                        style={{ backgroundColor: c.token }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {isFrame ? (
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 bg-muted/40 p-4 text-xs sm:grid-cols-4">
                  {[
                    ["Lens", `${product.dimensions.lensWidth} mm`],
                    ["Bridge", `${product.dimensions.bridge} mm`],
                    ["Temple", `${product.dimensions.templeLength} mm`],
                    ["Weight", `${product.dimensions.weight} g`],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-muted-foreground">{label}</p>
                      <p className="mt-0.5 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="space-y-2 text-xs">
                <p className="font-medium">Suits face shapes</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.faceShapes.map((s) => (
                    <Badge key={s} variant="outline" className="rounded-full font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="hero"
                  size="pill"
                  className="w-full"
                  disabled={!product.inStock}
                  onClick={() => addToCart(product, { color })}
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  {product.inStock ? "Add to bag" : "Out of stock"}
                </Button>
                <Button
                  variant="quiet"
                  size="pill"
                  className="w-full"
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart
                    className={cn("h-4 w-4", wished && "fill-destructive text-destructive")}
                    aria-hidden="true"
                  />
                  {wished ? "Saved" : "Wishlist"}
                </Button>
                <Button variant="gold" size="pill" className="w-full" asChild>
                  <a
                    href={waLink(`Hi Nayantara Opticals, I'd like to know more about ${product.name}.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="pill"
                  className="w-full rounded-full"
                  onClick={() => setTryOn(true)}
                >
                  <Camera className="h-4 w-4" aria-hidden="true" /> Try-On · Phase 2
                </Button>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Free fitting & adjustments at
                  the store, always.
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Need lenses fitted?{" "}
                  <Link to="/lenses" className="underline underline-offset-4">
                    Choose a lens package
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <TryOnDialog open={tryOn} onOpenChange={setTryOn} productName={product.name} />
    </>
  );
}
