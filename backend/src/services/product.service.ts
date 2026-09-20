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

export class ProductService {
  /**
   * Public Product Listing with advanced filters and pagination
   */
  static async getPublicProducts(query: GetProductsQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 24));
    const skip = (page - 1) * limit;

    try {
      const where: Prisma.ProductWhereInput = {
        isActive: true,
        deletedAt: null,
      };

      if (query.category && query.category !== "All" && query.category !== "all") {
        where.category = {
          name: { equals: query.category, mode: "insensitive" },
        };
      }

      if (query.gender) {
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

      if (products.length > 0) {
        return {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      }
    } catch {
      // Fall through to devStore
    }

    // Filter devStore products
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
        totalPages: Math.ceil(total / limit),
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

      if (product) return product;
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
    const pricePaise = data.pricePaise || price * 100;
    const category = data.category || "Eyeglasses";

    try {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + `-${Date.now().toString(36)}`;

      const sku = data.sku || `SKU-${Date.now().toString(36).toUpperCase()}`;

      const product = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
          data: {
            name: data.name,
            slug,
            sku,
            categoryId: data.categoryId || "cat-eyeglasses-01",
            storeId: data.storeId,
            brandId: data.brandId,
            pricePaise,
            salePricePaise: data.salePricePaise,
            description: data.description,
            frameShape: data.frameShape,
            frameMaterial: data.frameMaterial,
            frameType: data.frameType,
            gender: data.gender,
            color: data.color,
            size: data.size,
            isFeatured: data.isFeatured || false,
            inventory: {
              create: {
                quantity: data.stockCount || data.initialStock || 10,
              },
            },
            images: data.imageUrls?.length
              ? {
                  create: data.imageUrls.map((url, idx) => ({
                    url,
                    isPrimary: idx === 0,
                    sortOrder: idx,
                  })),
                }
              : undefined,
          },
          include: {
            category: true,
            images: true,
            inventory: true,
          },
        });

        return newProduct;
      });

      return product;
    } catch {
      // In-memory devStore creation
      const devProd = devStore.addProduct({
        name: data.name,
        brand: data.brand || "Nayantara Eyewear",
        category,
        gender: data.gender || "Unisex",
        frameShape: data.frameShape || "Square",
        frameMaterial: data.frameMaterial || "Handcrafted Acetate",
        frameType: data.frameType || "Full Rim",
        description: data.description || "Fine eyewear from Nayantara Opticals.",
        price,
        pricePaise,
        originalPrice: data.originalPrice,
        inStock: true,
        stockCount: data.stockCount || data.initialStock || 15,
        isFeatured: Boolean(data.isFeatured),
        isBestSeller: Boolean(data.isBestSeller),
        image:
          data.image ||
          data.imageUrls?.[0] ||
          "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80",
        images: data.imageUrls?.map((url, i) => ({ url, sortOrder: i })) || [
          {
            url:
              data.image ||
              "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80",
            sortOrder: 0,
          },
        ],
        storeId: data.storeId,
      });

      return devProd;
    }
  }

  /**
   * Update Product
   */
  static async updateProduct(id: string, storeIdFilter?: string, data?: Partial<DevProduct>) {
    try {
      const updated = await prisma.product.update({
        where: {
          id,
          storeId: storeIdFilter,
        },
        data: {
          name: data?.name,
          description: data?.description,
          pricePaise: data?.pricePaise,
          isFeatured: data?.isFeatured,
        },
      });
      return updated;
    } catch {
      return devStore.updateProduct(id, data || {});
    }
  }

  /**
   * Delete Product (Soft delete in DB or remove from devStore)
   */
  static async deleteProduct(id: string, storeIdFilter?: string) {
    try {
      await prisma.product.update({
        where: {
          id,
          storeId: storeIdFilter,
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });
    } catch {
      devStore.deleteProduct(id);
    }
    return true;
  }

  /**
   * Categories Listing
   */
  static async getCategories() {
    return [
      { id: "all", name: "All", slug: "all" },
      { id: "eyeglasses", name: "Eyeglasses", slug: "eyeglasses" },
      { id: "sunglasses", name: "Sunglasses", slug: "sunglasses" },
      { id: "contact-lenses", name: "Contact Lenses", slug: "contact-lenses" },
      { id: "hearing-aids", name: "Hearing Aids", slug: "hearing-aids" },
      { id: "reading-glasses", name: "Reading Glasses", slug: "reading-glasses" },
    ];
  }
}
