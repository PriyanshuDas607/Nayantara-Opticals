import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { devStore, DevProduct } from "../utils/devStore.js";

export interface GetProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  gender?: string;
  frameShape?: string;
  frameMaterial?: string;
  frameType?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "featured";
  isFeatured?: boolean;
}

async function resolveCategory(catInput?: string): Promise<{ id: string; name: string; slug: string }> {
  const input = (catInput || "Eyeglasses").trim();
  const slugTarget = input.toLowerCase().replace(/\s+/g, "-");

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);

    const found = await prisma.category.findFirst({
      where: {
        OR: [
          isUuid ? { id: input } : undefined,
          { slug: { equals: slugTarget, mode: "insensitive" } },
          { name: { equals: input, mode: "insensitive" } },
        ].filter(Boolean) as Prisma.CategoryWhereInput[],
      },
    });

    if (found) {
      return { id: found.id, name: found.name, slug: found.slug };
    }

    // Try first category in DB
    const firstCat = await prisma.category.findFirst();
    if (firstCat) {
      return { id: firstCat.id, name: firstCat.name, slug: firstCat.slug };
    }

    // Auto-create category if table is empty
    const created = await prisma.category.create({
      data: {
        name: input,
        slug: slugTarget,
        description: `${input} collection`,
      },
    });
    return { id: created.id, name: created.name, slug: created.slug };
  } catch (err) {
    console.error("Category resolution error:", err);
    return { id: "cat-eyeglasses-01", name: input, slug: slugTarget };
  }
}

export class ProductService {
  /**
   * Public Product Listing with advanced filters and pagination
   */
  static async getPublicProducts(query: GetProductsQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    try {
      const where: Prisma.ProductWhereInput = {
        isActive: true,
        deletedAt: null,
      };

      if (query.category && query.category !== "All" && query.category !== "all") {
        where.category = {
          OR: [
            { name: { equals: query.category, mode: "insensitive" } },
            { slug: { equals: query.category.toLowerCase().replace(/\s+/g, "-"), mode: "insensitive" } },
          ],
        };
      }

      if (query.gender && query.gender !== "All") {
        where.gender = { equals: query.gender, mode: "insensitive" };
      }

      if (query.frameShape) {
        where.frameShape = { equals: query.frameShape, mode: "insensitive" };
      }

      if (query.frameMaterial) {
        where.frameMaterial = { equals: query.frameMaterial, mode: "insensitive" };
      }

      if (query.frameType) {
        where.frameType = { equals: query.frameType, mode: "insensitive" };
      }

      if (query.isFeatured !== undefined) {
        where.isFeatured = query.isFeatured;
      }

      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        where.pricePaise = {};
        if (query.minPrice !== undefined) where.pricePaise.gte = query.minPrice * 100;
        if (query.maxPrice !== undefined) where.pricePaise.lte = query.maxPrice * 100;
      }

      if (query.search) {
        const q = query.search.trim();
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ];
      }

      let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
      if (query.sortBy === "price_asc") orderBy = { pricePaise: "asc" };
      if (query.sortBy === "price_desc") orderBy = { pricePaise: "desc" };
      if (query.sortBy === "featured") orderBy = { isFeatured: "desc" };

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: true,
            brand: true,
            images: { orderBy: { sortOrder: "asc" } },
            variants: true,
            inventory: true,
          },
        }),
      ]);

      const formattedProducts = products.map((p) => {
        const primaryImage = p.images?.[0]?.url || "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80";
        const stock = p.inventory?.quantity ?? 15;
        return {
          ...p,
          price: p.pricePaise / 100,
          originalPrice: p.salePricePaise ? p.salePricePaise / 100 : undefined,
          image: primaryImage,
          stockCount: stock,
          inStock: stock > 0,
        };
      });

      return {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (err) {
      console.warn("Database query failed in getPublicProducts, falling back to devStore:", err);
    }

    // Fallback: Filter devStore products
    let filtered = [...devStore.products];

    if (query.category && query.category !== "All" && query.category !== "all") {
      const catLower = query.category.toLowerCase().replace(/\s+/g, "-");
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase() === query.category?.toLowerCase() ||
          p.categoryId.toLowerCase() === catLower
      );
    }

    if (query.gender && query.gender !== "All") {
      filtered = filtered.filter((p) => p.gender.toLowerCase() === query.gender?.toLowerCase() || p.gender === "Unisex");
    }

    if (query.search) {
      const q = query.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (query.sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (query.sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      products: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single product by slug or ID
   */
  static async getProductBySlugOrId(identifier: string) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ slug: identifier }, { id: identifier }],
          isActive: true,
          deletedAt: null,
        },
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: {
            include: { inventory: true },
          },
          inventory: true,
        },
      });

      if (product) {
        const primaryImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80";
        const stock = product.inventory?.quantity ?? 15;
        return {
          ...product,
          price: product.pricePaise / 100,
          originalPrice: product.salePricePaise ? product.salePricePaise / 100 : undefined,
          image: primaryImage,
          stockCount: stock,
          inStock: stock > 0,
        };
      }
    } catch {
      // Fall through to devStore
    }

    return devStore.products.find((p) => p.id === identifier || p.slug === identifier) || null;
  }

  /**
   * Create Product (Admin or Owner)
   */
  static async createProduct(data: {
    name: string;
    category?: string;
    categoryId?: string;
    storeId?: string;
    brand?: string;
    brandId?: string;
    price?: number;
    pricePaise?: number;
    originalPrice?: number;
    salePricePaise?: number;
    sku?: string;
    description?: string;
    frameShape?: string;
    frameMaterial?: string;
    frameType?: string;
    gender?: string;
    color?: string;
    size?: string;
    image?: string;
    imageUrls?: string[];
    isFeatured?: boolean;
    isBestSeller?: boolean;
    stockCount?: number;
    initialStock?: number;
  }) {
    const price = data.price || (data.pricePaise ? data.pricePaise / 100 : 2999);
    const pricePaise = data.pricePaise || Math.round(price * 100);
    const originalPrice = data.originalPrice || (data.salePricePaise ? data.salePricePaise / 100 : undefined);
    const salePricePaise = data.salePricePaise || (originalPrice ? Math.round(originalPrice * 100) : undefined);
    const stockCount = data.stockCount || data.initialStock || 15;
    const primaryImage = data.image || data.imageUrls?.[0] || "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80";
    const allImages = data.imageUrls?.length ? data.imageUrls : [primaryImage];

    const resolvedCategory = await resolveCategory(data.categoryId || data.category);

    try {
      let storeId = data.storeId;
      if (!storeId) {
        const defaultStore = await prisma.store.findFirst();
        storeId = defaultStore?.id;
      }

      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + `-${Date.now().toString(36)}`;

      const sku = data.sku || `NO-${Date.now().toString(36).toUpperCase()}`;

      const newProduct = await prisma.$transaction(async (tx) => {
        return tx.product.create({
          data: {
            name: data.name.trim(),
            slug,
            sku,
            categoryId: resolvedCategory.id,
            storeId,
            brandId: data.brandId,
            pricePaise,
            salePricePaise,
            description: data.description || `${data.brand || "Nayantara Eyewear"} ${data.name}.`,
            frameShape: data.frameShape || "Square",
            frameMaterial: data.frameMaterial || "Acetate",
            frameType: data.frameType || "Full Rim",
            gender: data.gender || "Unisex",
            color: data.color,
            size: data.size,
            isFeatured: Boolean(data.isFeatured),
            isActive: true,
            inventory: {
              create: {
                quantity: stockCount,
              },
            },
            images: {
              create: allImages.map((url, idx) => ({
                url,
                isPrimary: idx === 0,
                sortOrder: idx,
              })),
            },
          },
          include: {
            category: true,
            images: true,
            inventory: true,
          },
        });
      });

      // Mirror into devStore
      devStore.addProduct({
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        brand: data.brand || "Nayantara Eyewear",
        category: resolvedCategory.name,
        categoryId: resolvedCategory.slug,
        gender: data.gender || "Unisex",
        frameShape: data.frameShape || "Square",
        frameMaterial: data.frameMaterial || "Acetate",
        frameType: data.frameType || "Full Rim",
        description: data.description || "Fine eyewear from Nayantara Opticals.",
        style: data.frameShape || "Modern",
        price,
        pricePaise,
        originalPrice,
        inStock: true,
        stockCount,
        isFeatured: Boolean(data.isFeatured),
        isBestSeller: Boolean(data.isBestSeller),
        image: primaryImage,
        images: allImages.map((url, i) => ({ url, sortOrder: i })),
        tags: [resolvedCategory.name, data.gender || "Unisex"],
        storeId,
      });

      return {
        ...newProduct,
        price,
        originalPrice,
        image: primaryImage,
        stockCount,
        inStock: true,
      };
    } catch (err) {
      console.error("Prisma createProduct error, falling back to devStore:", err);
      // In-memory devStore creation fallback
      const devProd = devStore.addProduct({
        name: data.name,
        brand: data.brand || "Nayantara Eyewear",
        category: resolvedCategory.name,
        gender: data.gender || "Unisex",
        frameShape: data.frameShape || "Square",
        frameMaterial: data.frameMaterial || "Handcrafted Acetate",
        frameType: data.frameType || "Full Rim",
        description: data.description || "Fine eyewear from Nayantara Opticals.",
        style: data.frameShape || "Modern",
        price,
        pricePaise,
        originalPrice,
        inStock: true,
        stockCount,
        isFeatured: Boolean(data.isFeatured),
        isBestSeller: Boolean(data.isBestSeller),
        image: primaryImage,
        images: allImages.map((url, i) => ({ url, sortOrder: i })),
        tags: [resolvedCategory.name, data.gender || "Unisex"],
        storeId: data.storeId,
      });

      return devProd;
    }
  }

  /**
   * Update Product (Admin or Owner)
   */
  static async updateProduct(id: string, _storeIdFilter?: string, data?: any) {
    try {
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: { images: true, inventory: true, category: true },
      });

      if (existing) {
        let categoryId = existing.categoryId;
        if (data?.category || data?.categoryId) {
          const resolved = await resolveCategory(data.categoryId || data.category);
          categoryId = resolved.id;
        }

        const pricePaise = data?.pricePaise || (data?.price ? Math.round(data.price * 100) : existing.pricePaise);
        const salePricePaise = data?.salePricePaise || (data?.originalPrice ? Math.round(data.originalPrice * 100) : existing.salePricePaise);

        const updated = await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: data?.name ?? existing.name,
            description: data?.description ?? existing.description,
            categoryId,
            pricePaise,
            salePricePaise,
            frameShape: data?.frameShape ?? existing.frameShape,
            frameMaterial: data?.frameMaterial ?? existing.frameMaterial,
            frameType: data?.frameType ?? existing.frameType,
            gender: data?.gender ?? existing.gender,
            color: data?.color ?? existing.color,
            size: data?.size ?? existing.size,
            isFeatured: data?.isFeatured !== undefined ? Boolean(data.isFeatured) : existing.isFeatured,
            images: data?.image
              ? {
                  deleteMany: {},
                  create: [{ url: data.image, isPrimary: true, sortOrder: 0 }],
                }
              : undefined,
            inventory: data?.stockCount !== undefined
              ? {
                  upsert: {
                    create: { quantity: Number(data.stockCount) },
                    update: { quantity: Number(data.stockCount) },
                  },
                }
              : undefined,
          },
          include: {
            category: true,
            images: true,
            inventory: true,
          },
        });

        devStore.updateProduct(id, data || {});
        devStore.updateProduct(existing.id, data || {});

        const primaryImage = updated.images?.[0]?.url || data?.image || "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80";
        const stock = updated.inventory?.quantity ?? 15;

        return {
          ...updated,
          price: updated.pricePaise / 100,
          originalPrice: updated.salePricePaise ? updated.salePricePaise / 100 : undefined,
          image: primaryImage,
          stockCount: stock,
          inStock: stock > 0,
        };
      }
    } catch (err) {
      console.error("Prisma updateProduct error:", err);
    }

    return devStore.updateProduct(id, data || {});
  }

  /**
   * Delete Product (Soft delete in DB and remove from devStore)
   */
  static async deleteProduct(id: string, _storeIdFilter?: string) {
    try {
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            deletedAt: new Date(),
            isActive: false,
          },
        });
        devStore.deleteProduct(existing.id);
        devStore.deleteProduct(id);
        return true;
      }
    } catch (err) {
      console.error("Prisma deleteProduct error:", err);
    }

    devStore.deleteProduct(id);
    return true;
  }

  /**
   * Categories Listing
   */
  static async getCategories() {
    try {
      const cats = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });
      if (cats.length > 0) {
        return [
          { id: "all", name: "All", slug: "all" },
          ...cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
        ];
      }
    } catch {
      // Fallback
    }

    return [
      { id: "all", name: "All", slug: "all" },
      { id: "eyeglasses", name: "Eyeglasses", slug: "eyeglasses" },
      { id: "sunglasses", name: "Sunglasses", slug: "sunglasses" },
      { id: "contact-lenses", name: "Contact Lenses", slug: "contact-lenses" },
      { id: "hearing-aids", name: "Hearing Aids", slug: "hearing-aids" },
      { id: "vision-aids", name: "Vision Aids", slug: "vision-aids" },
    ];
  }
}
