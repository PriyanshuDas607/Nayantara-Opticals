import { Role as AppRole } from "../constants/index.js";
import { CryptoUtil } from "./crypto.js";

export interface DevUser {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  plainPassword?: string; // For rapid dev fallback verification
  role: AppRole;
  fullName: string;
  storeId?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface DevProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categoryId: string;
  gender: string;
  frameShape: string;
  frameMaterial: string;
  frameType: string;
  description: string;
  style: string;
  price: number; // in INR
  pricePaise: number;
  originalPrice?: number;
  inStock: boolean;
  stockCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  image: string;
  images?: Array<{ url: string; sortOrder: number; altText?: string }>;
  tags: string[];
  storeId?: string;
  createdAt: string;
}

export interface DevOrder {
  id: string;
  orderNumber: string;
  totalPaise: number;
  paymentMethod: string;
  paymentStatus?: string;
  status: string;
  storeId?: string;
  createdAt: string;
  user: {
    customerProfile?: { fullName: string };
    phone?: string;
    email?: string;
  };
  items: Array<{ productName: string; quantity: number; unitPricePaise: number }>;
}

export const INITIAL_PRODUCTS: DevProduct[] = [
  {
    id: "prod-01",
    name: "Classic Acetate Square",
    slug: "classic-acetate-square",
    brand: "Nayantara Signature",
    category: "Eyeglasses",
    categoryId: "eyeglasses",
    gender: "Unisex",
    frameShape: "Square",
    frameMaterial: "Handcrafted Acetate",
    frameType: "Full Rim",
    description: "Architectural square frames with bevelled temples and spring hinges for day-long comfort.",
    style: "Urban Minimalist",
    price: 3499,
    pricePaise: 349900,
    originalPrice: 4499,
    inStock: true,
    stockCount: 15,
    isFeatured: true,
    isBestSeller: true,
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
    ],
    tags: ["Signature", "Handcrafted", "Anti-Glare"],
    storeId: "store-uttam-nagar-01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-02",
    name: "Aero Titanium Round",
    slug: "aero-titanium-round",
    brand: "Nayantara Air",
    category: "Eyeglasses",
    categoryId: "eyeglasses",
    gender: "Unisex",
    frameShape: "Round",
    frameMaterial: "Japanese Beta Titanium",
    frameType: "Rimless",
    description: "Featherweight 9g Japanese beta-titanium silhouette with silicone nose pads.",
    style: "Ultra Light",
    price: 5499,
    pricePaise: 549900,
    originalPrice: 6999,
    inStock: true,
    stockCount: 8,
    isFeatured: true,
    isBestSeller: false,
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
    ],
    tags: ["Titanium", "Featherweight", "Premium"],
    storeId: "store-uttam-nagar-01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-03",
    name: "Riviera Polarized Aviator",
    slug: "riviera-polarized-aviator",
    brand: "Nayantara Sun",
    category: "Sunglasses",
    categoryId: "sunglasses",
    gender: "Men",
    frameShape: "Aviator",
    frameMaterial: "Monel Metal",
    frameType: "Full Rim",
    description: "Classic teardrop aviator with Category 3 UV400 polarized emerald tint lenses.",
    style: "Heritage Aviator",
    price: 4299,
    pricePaise: 429900,
    originalPrice: 5299,
    inStock: true,
    stockCount: 20,
    isFeatured: true,
    isBestSeller: true,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
    ],
    tags: ["Polarized", "UV400", "Bestseller"],
    storeId: "store-uttam-nagar-01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-04",
    name: "Cat-Eye Havana Gradient",
    slug: "cat-eye-havana-gradient",
    brand: "Nayantara Sun",
    category: "Sunglasses",
    categoryId: "sunglasses",
    gender: "Women",
    frameShape: "Cat-Eye",
    frameMaterial: "Italian Bio-Acetate",
    frameType: "Full Rim",
    description: "Dramatic tortoiseshell cat-eye with gradient amber lenses for timeless glamour.",
    style: "Haute Glamour",
    price: 4799,
    pricePaise: 479900,
    originalPrice: 5999,
    inStock: true,
    stockCount: 12,
    isFeatured: true,
    isBestSeller: true,
    image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
    ],
    tags: ["Bio-Acetate", "UV400", "Women"],
    storeId: "store-uttam-nagar-01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-05",
    name: "HydroSoft Aqua Moist (30 Pack)",
    slug: "hydrosoft-aqua-moist-30",
    brand: "Acuvue Moist",
    category: "Contact Lenses",
    categoryId: "contact-lenses",
    gender: "Unisex",
    frameShape: "N/A",
    frameMaterial: "Silicone Hydrogel",
    frameType: "Daily Disposable",
    description: "Daily disposable breathable silicone hydrogel lenses with LACREON moisture technology.",
    style: "Daily Disposable",
    price: 2199,
    pricePaise: 219900,
    originalPrice: 2499,
    inStock: true,
    stockCount: 45,
    isFeatured: false,
    isBestSeller: true,
    image: "https://images.unsplash.com/photo-1587502537147-2ba64a62e3d3?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1587502537147-2ba64a62e3d3?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
    ],
    tags: ["Daily", "High Breathability", "Moist"],
    storeId: "store-uttam-nagar-01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-06",
    name: "Audion Clarity Digital Pro (RIC)",
    slug: "audion-clarity-digital-pro",
    brand: "Phonak Lumity",
    category: "Hearing Aids",
    categoryId: "hearing-aids",
    gender: "Unisex",
    frameShape: "Receiver-in-Canal",
    frameMaterial: "Medical Polymer",
    frameType: "Rechargeable",
    description: "Discreet Bluetooth rechargeable digital hearing instrument with AI speech clarity and noise suppression.",
    style: "Digital RIC",
    price: 34999,
    pricePaise: 3499900,
    originalPrice: 42000,
    inStock: true,
    stockCount: 6,
    isFeatured: true,
    isBestSeller: false,
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
    ],
    tags: ["Digital AI", "Bluetooth", "Rechargeable", "Audiology"],
    storeId: "store-uttam-nagar-01",
    createdAt: new Date().toISOString(),
  },
];

class DevDataStore {
  public users: DevUser[] = [
    {
      id: "user-super-admin-01",
      email: "admin@nayantaraopticals.com",
      phone: "+919876543210",
      passwordHash: "",
      plainPassword: "Admin@Nayantara2026!",
      role: AppRole.SUPER_ADMIN,
      fullName: "Super Admin",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-store-owner-01",
      email: "owner@nayantaraopticals.com",
      phone: "+919876543211",
      passwordHash: "",
      plainPassword: "Owner@Nayantara2026!",
      role: AppRole.OWNER,
      fullName: "Rajesh Sharma",
      storeId: "store-uttam-nagar-01",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-customer-01",
      email: "customer@nayantaraopticals.com",
      phone: "+919876543212",
      passwordHash: "",
      plainPassword: "Customer@2026!",
      role: AppRole.CUSTOMER,
      fullName: "Aarav Sharma",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
  ];

  public products: DevProduct[] = [...INITIAL_PRODUCTS];

  public stores = [
    {
      id: "store-uttam-nagar-01",
      name: "Nayantara Opticals - Uttam Nagar Flagship",
      slug: "nayantara-uttam-nagar",
      address: "WZ-27, Shop No.1, Om Vihar, Phase-1, Near Metro Pillar 703, Uttam Nagar",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110059",
      phone: "+919876543210",
      whatsappNumber: "+919876543210",
      isActive: true,
      _count: { products: 24, appointments: 8, orders: 12 },
    },
  ];

  public appointments: any[] = [];

  public orders: DevOrder[] = [];

  // User methods
  addUser(user: Omit<DevUser, "id" | "createdAt"> & { id?: string }) {
    const newUser: DevUser = {
      id: user.id || `dev-user-${Date.now()}`,
      email: user.email.toLowerCase().trim(),
      phone: user.phone,
      passwordHash: user.passwordHash || "",
      plainPassword: user.plainPassword,
      role: user.role,
      fullName: user.fullName,
      storeId: user.storeId,
      status: user.status || "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  findUserByIdentifier(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    return this.users.find(
      (u) => u.email.toLowerCase() === clean || (u.phone && u.phone.includes(clean))
    );
  }

  async verifyPassword(user: DevUser, plainText: string): Promise<boolean> {
    if (user.plainPassword && user.plainPassword === plainText) {
      return true;
    }
    if (user.passwordHash) {
      return await CryptoUtil.comparePassword(plainText, user.passwordHash);
    }
    return false;
  }

  // Product methods
  addProduct(productData: Partial<DevProduct>): DevProduct {
    const name = productData.name || "Untitled Product";
    const slug =
      productData.slug ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now().toString(36)}`;
    const price = Number(productData.price) || 2999;
    const pricePaise = productData.pricePaise || price * 100;
    const category = productData.category || "Eyeglasses";
    const categoryId = category.toLowerCase().replace(/\s+/g, "-");

    const newProd: DevProduct = {
      id: `prod-${Date.now()}`,
      name,
      slug,
      brand: productData.brand || "Nayantara Eyewear",
      category,
      categoryId,
      gender: productData.gender || "Unisex",
      frameShape: productData.frameShape || "Square",
      frameMaterial: productData.frameMaterial || "Acetate",
      frameType: productData.frameType || "Full Rim",
      description: productData.description || "Premium handcrafted frames from Nayantara Opticals.",
      style: productData.style || "Modern",
      price,
      pricePaise,
      originalPrice: productData.originalPrice || Math.round(price * 1.25),
      inStock: productData.inStock !== false,
      stockCount: Number(productData.stockCount) || 10,
      isFeatured: Boolean(productData.isFeatured),
      isBestSeller: Boolean(productData.isBestSeller),
      image:
        productData.image ||
        "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80",
      images: productData.images || [
        {
          url:
            productData.image ||
            "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80",
          sortOrder: 0,
        },
      ],
      tags: productData.tags || ["New Arrival", category],
      storeId: productData.storeId || "store-uttam-nagar-01",
      createdAt: new Date().toISOString(),
    };

    this.products.unshift(newProd);
    return newProd;
  }

  updateProduct(id: string, updates: Partial<DevProduct>): DevProduct | null {
    const idx = this.products.findIndex((p) => p.id === id || p.slug === id);
    if (idx === -1) return null;

    if (updates.price && !updates.pricePaise) {
      updates.pricePaise = updates.price * 100;
    }
    this.products[idx] = { ...this.products[idx], ...updates };
    return this.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id && p.slug !== id);
    return this.products.length < initialLen;
  }

  // Order methods
  addOrder(orderData: any) {
    const totalPaise = orderData.totalPaise || (orderData.total ? orderData.total * 100 : 349900);
    const newOrder = {
      id: orderData.id || `order-${Date.now()}`,
      orderNumber:
        orderData.orderNumber ||
        `NYN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      totalPaise,
      paymentMethod: orderData.paymentMethod || "ONLINE",
      paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === "COD" ? "PENDING" : "PAID"),
      status: orderData.status || (orderData.paymentMethod === "COD" ? "PLACED" : "PROCESSING"),
      createdAt: orderData.createdAt || new Date().toISOString(),
      storeId: orderData.storeId || "store-uttam-nagar-01",
      user: orderData.user || {
        customerProfile: { fullName: orderData.customerName || "Valued Customer" },
        phone: orderData.phone || "+91 9876543210",
        email: orderData.email || "customer@nayantaraopticals.com",
      },
      items: orderData.items || [
        { productName: "Custom Optical Eyewear", quantity: 1, unitPricePaise: totalPaise },
      ],
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateOrderStatus(id: string, status: string, paymentStatus?: string) {
    const order = this.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    if (paymentStatus) {
      (order as any).paymentStatus = paymentStatus;
    } else if (status === "DELIVERED" || status === "PROCESSING" || status === "SHIPPED") {
      (order as any).paymentStatus = "PAID";
    }
    return order;
  }
}

export const devStore = new DevDataStore();
