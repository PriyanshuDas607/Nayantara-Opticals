import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Plus, Sparkles, X, Check, Package, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductDialog } from "@/components/shop/ProductDialog";
import { CATEGORIES, PRODUCTS as STATIC_PRODUCTS, type CategoryId, type Product } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { apiRequest } from "@/lib/api";

const PRESET_IMAGES = [
  { label: "Classic Black Acetate", url: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80" },
  { label: "Titanium Round", url: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80" },
  { label: "Aviator Sunglasses", url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80" },
  { label: "Cat-Eye Havana", url: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80" },
  { label: "Contact Lenses", url: "https://images.unsplash.com/photo-1587502537147-2ba64a62e3d3?w=800&auto=format&fit=crop&q=80" },
  { label: "Digital Hearing Aid", url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80" },
];

export function ShopPage() {
  const { isAdmin, isOwner } = useAuth();
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(false);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("Nayantara Eyewear");
  const [formCategory, setFormCategory] = useState<CategoryId>("eyeglasses");
  const [formShape, setFormShape] = useState("Square");
  const [formMaterial, setFormMaterial] = useState("Handcrafted Acetate");
  const [formGender, setFormGender] = useState("Unisex");
  const [formPrice, setFormPrice] = useState("3499");
  const [formComparePrice, setFormComparePrice] = useState("4499");
  const [formStock, setFormStock] = useState("15");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState(PRESET_IMAGES[0]?.url ?? "");
  const [formFeatured, setFormFeatured] = useState(true);
  const [formBestseller, setFormBestseller] = useState(false);

  // Fetch live products from backend
  const fetchProducts = async () => {
    try {
      const res = await apiRequest<any[]>("/products");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: Product[] = res.data.map((p) => ({
          id: p.id || p.slug,
          name: p.name,
          brand: p.brand || "Nayantara Eyewear",
          category: (p.categoryId || p.category?.toLowerCase() || "eyeglasses") as CategoryId,
          price: p.price || (p.pricePaise ? p.pricePaise / 100 : 2999),
          compareAt: p.originalPrice || (p.salePricePaise ? p.salePricePaise / 100 : undefined),
          rating: 4.8,
          reviews: 24,
          image: p.image || p.images?.[0]?.url || PRESET_IMAGES[0]?.url || "",
          badges: p.isBestSeller ? ["Bestseller", "New"] : p.isFeatured ? ["Featured"] : ["New"],
          style: p.style || p.frameShape || "Modern",
          material: p.frameMaterial || "Acetate",
          colors: p.colors || [{ name: "Classic", token: "oklch(0.28 0.03 250)" }],
          sizes: p.sizes || ["Medium"],
          faceShapes: ["Oval", "Square", "Round"],
          dimensions: p.dimensions || { lensWidth: 52, bridge: 18, templeLength: 145, weight: 24 },
          description: p.description || "Handcrafted luxury frame by Nayantara Opticals.",
          inStock: p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0),
        }));

        const seenIds = new Set(mapped.map((m) => m.id));
        const combined = [...mapped, ...STATIC_PRODUCTS.filter((sp) => !seenIds.has(sp.id))];
        setProductsList(combined);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormBrand("Nayantara Eyewear");
    setFormCategory("eyeglasses");
    setFormShape("Square");
    setFormMaterial("Handcrafted Acetate");
    setFormGender("Unisex");
    setFormPrice("3499");
    setFormComparePrice("4499");
    setFormStock("15");
    setFormDesc("");
    setFormImage(PRESET_IMAGES[0]?.url ?? "");
    setFormFeatured(true);
    setFormBestseller(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormBrand(prod.brand);
    setFormCategory(prod.category);
    setFormShape(prod.style || "Square");
    setFormMaterial(prod.material || "Handcrafted Acetate");
    setFormGender("Unisex");
    setFormPrice(prod.price.toString());
    setFormComparePrice(prod.compareAt ? prod.compareAt.toString() : (prod.price * 1.25).toString());
    setFormStock("15");
    setFormDesc(prod.description);
    setFormImage(prod.image);
    setFormFeatured(prod.badges.includes("Featured"));
    setFormBestseller(prod.badges.includes("Bestseller"));
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Are you sure you want to delete "${prod.name}" from the store?`)) return;

    try {
      const res = await apiRequest(`/products/${prod.id}`, {
        method: "DELETE",
      });

      if (res.success) {
        toast.success(`Product "${prod.name}" deleted.`);
        setProductsList((prev) => prev.filter((p) => p.id !== prod.id));
      } else {
        // Optimistic removal for local dev
        setProductsList((prev) => prev.filter((p) => p.id !== prod.id));
        toast.success(`Product "${prod.name}" removed from catalog.`);
      }
    } catch {
      setProductsList((prev) => prev.filter((p) => p.id !== prod.id));
      toast.success(`Product "${prod.name}" removed.`);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    setSubmitting(true);
    const priceNum = parseFloat(formPrice) || 2999;
    const compareNum = parseFloat(formComparePrice) || priceNum * 1.25;

    const payload = {
      name: formName.trim(),
      brand: formBrand.trim(),
      category: formCategory,
      categoryId: formCategory,
      frameShape: formShape,
      frameMaterial: formMaterial,
      gender: formGender,
      price: priceNum,
      pricePaise: priceNum * 100,
      originalPrice: compareNum,
      description: formDesc.trim() || `${formShape} ${formMaterial} frame crafted for comfort and elegance.`,
      image: formImage,
      imageUrls: [formImage],
      stockCount: parseInt(formStock, 10) || 10,
      isFeatured: formFeatured,
      isBestSeller: formBestseller,
    };

    try {
      if (editingProduct) {
        // UPDATE (CRUD Update)
        const res = await apiRequest(`/products/${editingProduct.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        toast.success(`✨ Product "${formName}" updated successfully!`);
        setProductsList((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: formName.trim(),
                  brand: formBrand.trim(),
                  category: formCategory,
                  price: priceNum,
                  compareAt: compareNum,
                  style: formShape,
                  material: formMaterial,
                  description: formDesc.trim(),
                  image: formImage,
                  badges: formBestseller ? ["Bestseller"] : formFeatured ? ["Featured"] : ["New"],
                }
              : p
          )
        );
      } else {
        // CREATE (CRUD Create)
        const res = await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        toast.success(`✨ Product "${formName}" published to shop!`);
        const newLocalProduct: Product = {
          id: `prod-${Date.now()}`,
          name: formName.trim(),
          brand: formBrand.trim(),
          category: formCategory,
          price: priceNum,
          compareAt: compareNum,
          rating: 5.0,
          reviews: 1,
          image: formImage,
          badges: formBestseller ? ["Bestseller"] : ["New"],
          style: formShape,
          material: formMaterial,
          colors: [{ name: "Classic", token: "oklch(0.28 0.03 250)" }],
          sizes: ["Medium"],
          faceShapes: ["All"],
          dimensions: { lensWidth: 52, bridge: 18, templeLength: 145, weight: 24 },
          description: formDesc.trim() || "Handcrafted luxury frame by Nayantara Opticals.",
          inStock: true,
        };
        setProductsList((prev) => [newLocalProduct, ...prev]);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const haystack = `${product.brand} ${product.name} ${product.style} ${product.material}`.toLowerCase();
      return matchesCategory && haystack.includes(query.toLowerCase());
    });
  }, [category, query, productsList]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 sm:py-5 lg:px-8">
      {/* Header & Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">The collection</p>
          <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight font-display">
            Find a frame that feels like you.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Curated eyewear, contact lenses and specialist audiology aids—available to reserve for an expert in-store fitting.
          </p>
        </div>

        {(isAdmin || isOwner) && (
          <Button
            onClick={handleOpenAddModal}
            variant="hero"
            size="sm"
            className="rounded-full shadow-gold gap-1.5 shrink-0 self-start sm:self-auto text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Product (Store Owner / Admin)</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-3 flex flex-col gap-2.5 border-y border-border py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-8 h-8 text-xs bg-card/60"
            placeholder="Search frames, brands, materials..."
            aria-label="Search products"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label="Product categories">
          <SlidersHorizontal className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <Button
            size="sm"
            variant={category === "all" ? "default" : "outline"}
            onClick={() => setCategory("all")}
            className="rounded-full shrink-0 h-7 text-xs px-3"
          >
            All Pieces
          </Button>
          {CATEGORIES.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={category === item.id ? "default" : "outline"}
              onClick={() => setCategory(item.id)}
              className="rounded-full shrink-0 h-7 text-xs px-3"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Item Count & Admin/Owner Status */}
      <div className="mt-2.5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "piece" : "pieces"}
        </p>

        {(isAdmin || isOwner) && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary border border-primary/20">
            <Sparkles className="h-3 w-3" />
            {isAdmin ? "Super Admin (Full CRUD Enabled)" : "Store Owner (Catalog CRUD Enabled)"}
          </span>
        )}
      </div>

      {/* Product Grid */}
      <div className={cn("mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", filteredProducts.length === 0 && "block")}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={setSelected}
            onEdit={isAdmin || isOwner ? handleOpenEditModal : undefined}
            onDelete={isAdmin || isOwner ? handleDeleteProduct : undefined}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center surface-glass rounded-2xl p-8 border border-border">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="font-display text-2xl font-semibold">No exact match found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try clearing your search query or selecting another category.</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setQuery(""); setCategory("all"); }}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Quick View Dialog */}
      <ProductDialog product={selected} onOpenChange={(open) => !open && setSelected(null)} />

      {/* Add / Edit Product Modal for Store Owner & Super Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="surface-glass relative w-full max-w-2xl rounded-3xl border border-border/80 p-6 sm:p-8 shadow-lift max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                {editingProduct ? "Edit Product Details" : "Store Owner Product Template"}
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold">
              {editingProduct ? `Edit "${editingProduct.name}"` : "Add New Eyewear / Optical Product"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Configure attributes, pricing, and stock count for this item.
            </p>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mProdName">Product Name *</Label>
                  <Input
                    id="mProdName"
                    required
                    placeholder="e.g. Sovereign Bold Aviator"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mProdBrand">Brand / Collection</Label>
                  <Input
                    id="mProdBrand"
                    placeholder="e.g. Nayantara Signature, Ray-Ban"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mProdCategory">Category *</Label>
                  <select
                    id="mProdCategory"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="eyeglasses">Eyeglasses</option>
                    <option value="sunglasses">Sunglasses</option>
                    <option value="contact-lenses">Contact Lenses</option>
                    <option value="hearing-aids">Hearing Aids</option>
                    <option value="kids">Kids Eyewear</option>
                    <option value="computer-glasses">Computer Glasses</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mProdShape">Frame Shape</Label>
                  <select
                    id="mProdShape"
                    value={formShape}
                    onChange={(e) => setFormShape(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Square">Square</option>
                    <option value="Round">Round</option>
                    <option value="Aviator">Aviator</option>
                    <option value="Cat-Eye">Cat-Eye</option>
                    <option value="Rectangle">Rectangle</option>
                    <option value="Geometric">Geometric</option>
                    <option value="Rimless">Rimless / Sleek</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mProdGender">Gender</Label>
                  <select
                    id="mProdGender"
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mProdMaterial">Material</Label>
                  <Input
                    id="mProdMaterial"
                    placeholder="e.g. Handcrafted Bio-Acetate"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mProdPrice">Price (₹) *</Label>
                  <Input
                    id="mProdPrice"
                    type="number"
                    required
                    placeholder="3499"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mProdCompare">MRP Strike Price (₹)</Label>
                  <Input
                    id="mProdCompare"
                    type="number"
                    placeholder="4499"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mProdDesc">Product Description</Label>
                <textarea
                  id="mProdDesc"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Architectural silhouette with bevelled temples..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>Choose Image Preset or Custom URL</span>
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden border-2 transition-all group",
                        formImage === preset.url ? "border-primary ring-2 ring-primary/30" : "border-border/60 hover:border-border"
                      )}
                    >
                      <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                      {formImage === preset.url && (
                        <div className="absolute inset-0 bg-primary/20 grid place-items-center">
                          <Check className="h-4 w-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Input
                  className="mt-2 text-xs"
                  placeholder="Or paste custom image URL (https://...)"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Mark as Featured</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formBestseller}
                    onChange={(e) => setFormBestseller(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero" disabled={submitting} className="rounded-full shadow-gold">
                  {submitting ? "Saving..." : editingProduct ? "Save Changes" : "✨ Publish to Shop"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}