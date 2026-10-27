import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Camera,
  Sparkles,
  ShoppingBag,
  Eye,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VirtualTryOnModal } from "@/components/common/VirtualTryOnModal";
import { PRODUCTS, type Product } from "@/data/catalog";
import { inr } from "@/lib/site";
import { cn } from "@/lib/utils";

export function TryOnPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "eyeglasses" | "sunglasses">("all");

  // Filter only eyeglasses and sunglasses
  const frames = useMemo(() => {
    return PRODUCTS.filter(
      (p) => p.category === "eyeglasses" || p.category === "sunglasses"
    );
  }, []);

  const filteredFrames = useMemo(() => {
    if (activeTab === "all") return frames;
    return frames.filter((f) => f.category === activeTab);
  }, [frames, activeTab]);

  const handleLaunchStudio = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct(filteredFrames[0] ?? frames[0] ?? null);
    }
    setModalOpen(true);
  };

  const inStockCount = frames.filter((f) => f.inStock).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Studio Hero Header */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card via-background to-background py-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            <Badge
              variant="outline"
              className="gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border-amber-500/30"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>468-POINT AI FACE MESH WebAR</span>
            </Badge>

            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.12]">
              Every Frame In Stock, <br />
              <span className="text-amber-500 italic font-normal">Virtually Ready</span> on Your Face.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Preview our collection of precision-crafted eyeglasses and UV400 sunglasses directly on your webcam or interactive 3D model. Experience true-to-life frame proportions, finishes, and lens tints before visiting our Uttam Nagar showroom.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                variant="hero"
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full px-6 shadow-lg shadow-amber-500/20 gap-2 border-none"
                onClick={() => handleLaunchStudio()}
              >
                <Camera className="h-5 w-5" />
                Launch 3D AR Studio
              </Button>

              <Button size="lg" variant="outline" asChild className="rounded-full px-6 gap-2">
                <Link to="/book">
                  <Calendar className="h-4 w-4" />
                  Book In-Store Eye Test
                </Link>
              </Button>
            </div>

            {/* Live Showroom Stock Telemetry Pill */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/80 w-full max-w-lg mt-6">
              <div className="p-3 rounded-2xl bg-card border border-border">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{frames.length}</div>
                <div className="text-[11px] text-muted-foreground">Catalog Frames</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xl sm:text-2xl font-bold text-emerald-500">{inStockCount}</div>
                <div className="text-[11px] text-emerald-600 font-medium">Ready in Showroom</div>
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border">
                <div className="text-xl sm:text-2xl font-bold text-amber-500">468</div>
                <div className="text-[11px] text-muted-foreground">3D Landmark Points</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frame Selection Gallery */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Select a Frame to Try On</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Click any frame below to open the real-time webcam mirror or 3D rotating portrait.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-card border border-border self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "all"
                  ? "bg-amber-500 text-black shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Frames ({frames.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("eyeglasses")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "eyeglasses"
                  ? "bg-amber-500 text-black shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Eyeglasses
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sunglasses")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "sunglasses"
                  ? "bg-amber-500 text-black shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sunglasses
            </button>
          </div>
        </div>

        {/* Frames Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFrames.map((frame) => {
            return (
              <div
                key={frame.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft hover:shadow-lg transition-all duration-300"
              >
                <div>
                  {/* Image & Try-On Overlay */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted/60">
                    <img
                      src={frame.image}
                      alt={frame.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-card/90 text-foreground text-[10px] font-semibold"
                      >
                        {frame.style}
                      </Badge>
                      {frame.inStock ? (
                        <Badge className="rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[10px]">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-full bg-card/90 text-muted-foreground text-[10px]">
                          Waitlist
                        </Badge>
                      )}
                    </div>

                    {/* Quick Try-On Overlay Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <Button
                        size="sm"
                        variant="hero"
                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full gap-2 shadow-lg border-none active:scale-95 transition-transform"
                        onClick={() => handleLaunchStudio(frame)}
                      >
                        <Camera className="h-4 w-4" />
                        Try on Face
                      </Button>
                    </div>
                  </div>

                  {/* Frame Metadata */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase">
                      <span>{frame.brand}</span>
                      <span>{frame.category}</span>
                    </div>

                    <h3 className="font-semibold text-base text-foreground leading-tight">
                      {frame.name}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {frame.description}
                    </p>

                    {/* Color Swatches */}
                    {frame.colors && frame.colors.length > 0 && (
                      <div className="pt-1 flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Finishes:</span>
                        {frame.colors.map((c) => (
                          <span
                            key={c.name}
                            title={c.name}
                            className="w-3.5 h-3.5 rounded-full border border-border shadow-xs inline-block"
                            style={{ backgroundColor: c.token.startsWith("oklch") ? "#a87b32" : c.token }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-base text-foreground">{inr(frame.price)}</span>
                    {frame.compareAt && (
                      <span className="text-xs text-muted-foreground line-through ml-1.5">
                        {inr(frame.compareAt)}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs gap-1.5 border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-500 font-semibold"
                    onClick={() => handleLaunchStudio(frame)}
                  >
                    <Camera className="h-3.5 w-3.5 text-amber-500" />
                    Try On
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* In-Store Guarantee & Visit Section */}
      <section className="border-t border-border bg-card/60 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Exact Proportions</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Calibrated to average pupillary distance (PD) so you can accurately see frame width against your cheekbones.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">100% In-Showroom Stock</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Every frame you preview virtually is verified in stock at our Uttam Nagar showroom for physical try-on and fitting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Expert Optometrist Fitting</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Walk in or book an appointment for comprehensive computerized eye exams and customized prescription lens fitting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Try-On Modal */}
      <VirtualTryOnModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialProductId={selectedProduct?.id}
        allProducts={PRODUCTS}
      />
    </div>
  );
}
