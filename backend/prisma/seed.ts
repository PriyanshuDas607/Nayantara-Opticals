import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Nayantara Opticals database seeding...");

  // 1. Create Default Store
  const store = await prisma.store.upsert({
    where: { slug: "nayantara-opticals-delhi" },
    update: {},
    create: {
      name: "Nayantara Opticals (Main Branch)",
      slug: "nayantara-opticals-delhi",
      address: "WZ-27, Shop No.1, Om Vihar, Phase-1, Near Metro Pillar 703, Uttam Nagar",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110059",
      phone: "+919876543210",
      whatsappNumber: "+919876543210",
      email: "info@nayantaraopticals.com",
    },
  });
  console.log(`✅ Store ready: ${store.name}`);

  // 2. Weekly Store Appointment Availability (Days 0 to 6)
  for (let day = 0; day <= 6; day++) {
    await prisma.appointmentAvailability.upsert({
      where: {
        storeId_dayOfWeek: {
          storeId: store.id,
          dayOfWeek: day,
        },
      },
      update: {},
      create: {
        storeId: store.id,
        dayOfWeek: day,
        openTime: "10:30",
        closeTime: "20:00",
        slotDuration: 30,
        maxPerSlot: 2,
        isActive: true,
      },
    });
  }
  console.log("✅ Weekly appointment availability configured.");

  // 3. Create Super Admin User
  const adminPasswordHash = await bcrypt.hash("Admin@Nayantara2026!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nayantaraopticals.com" },
    update: {},
    create: {
      email: "admin@nayantaraopticals.com",
      phone: "+919876543210",
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
      customerProfile: {
        create: {
          fullName: "Super Admin",
        },
      },
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // 4. Create Sample Store Owner
  const ownerPasswordHash = await bcrypt.hash("Owner@Nayantara2026!", 12);
  const owner = await prisma.user.upsert({
    where: { email: "owner@nayantaraopticals.com" },
    update: {},
    create: {
      email: "owner@nayantaraopticals.com",
      phone: "+919876543211",
      passwordHash: ownerPasswordHash,
      role: Role.OWNER,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
      ownerProfile: {
        create: {
          fullName: "Store Manager",
          storeId: store.id,
          notificationPhone: "+919876543211",
        },
      },
    },
  });
  console.log(`✅ Store Owner created: ${owner.email}`);

  // 5. Seed Product Categories
  const categoriesData = [
    { name: "Eyeglasses", slug: "eyeglasses", description: "Designer & lightweight optical frames" },
    { name: "Sunglasses", slug: "sunglasses", description: "UV400 & polarized protective sunglasses" },
    { name: "Contact Lenses", slug: "contact-lenses", description: "Daily, monthly and toric soft contact lenses" },
    { name: "Vision Aids", slug: "vision-aids", description: "Low vision magnifiers, LED reading tools & accessories" },
    { name: "Hearing Aids", slug: "hearing-aids", description: "Digital rechargeable CIC & BTE hearing aids" },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.name, created.id);
  }
  console.log("✅ Categories seeded.");

  // 6. Seed Sample Products
  const sampleProducts = [
    {
      name: "Classic Acetate Square",
      slug: "classic-acetate-square",
      sku: "NO-EYE-001",
      categoryName: "Eyeglasses",
      pricePaise: 249900,
      salePricePaise: 199900,
      frameShape: "Square",
      frameMaterial: "Handcrafted Acetate",
      frameType: "Full Rim",
      gender: "Unisex",
      color: "Tortoise",
      size: "Medium",
      requiresPrescription: true,
      virtualTryOnEnabled: true,
      isFeatured: true,
      description: "Lightweight vintage-inspired optical frame with German spring hinges and custom nose pads.",
      images: ["/assets/frame-01.jpg"],
      stock: 25,
    },
    {
      name: "Aero Titanium Round",
      slug: "aero-titanium-round",
      sku: "NO-EYE-002",
      categoryName: "Eyeglasses",
      pricePaise: 399900,
      salePricePaise: 349900,
      frameShape: "Round",
      frameMaterial: "Pure Titanium",
      frameType: "Full Rim",
      gender: "Unisex",
      color: "Matte Black",
      size: "Small",
      requiresPrescription: true,
      virtualTryOnEnabled: true,
      isFeatured: true,
      description: "Featherlight 7g titanium wire frame designed for all-day comfort and timeless minimalism.",
      images: ["/assets/frame-02.jpg"],
      stock: 18,
    },
    {
      name: "Polarized Aviator Elite",
      slug: "polarized-aviator-elite",
      sku: "NO-SUN-001",
      categoryName: "Sunglasses",
      pricePaise: 349900,
      salePricePaise: 299900,
      frameShape: "Aviator",
      frameMaterial: "Monel Metal",
      frameType: "Full Rim",
      gender: "Men",
      color: "Gold / Green G-15",
      size: "Large",
      requiresPrescription: false,
      virtualTryOnEnabled: true,
      isFeatured: true,
      description: "HD polarized optical lenses offering 100% UV protection and enhanced road clarity.",
      images: ["/assets/sun-01.jpg"],
      stock: 15,
    },
    {
      name: "AquaHydrate Daily Lenses (30 Pack)",
      slug: "aquahydrate-daily-lenses",
      sku: "NO-LENS-001",
      categoryName: "Contact Lenses",
      pricePaise: 185000,
      requiresPrescription: true,
      isFeatured: true,
      description: "Daily disposable silicone hydrogel contact lenses providing 16 hours of continuous moisture.",
      images: ["/assets/lens-01.jpg"],
      stock: 50,
    },
  ];

  for (const prod of sampleProducts) {
    const categoryId = categoryMap.get(prod.categoryName);
    if (!categoryId) continue;

    const created = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        categoryId,
        storeId: store.id,
        pricePaise: prod.pricePaise,
        salePricePaise: prod.salePricePaise,
        frameShape: prod.frameShape,
        frameMaterial: prod.frameMaterial,
        frameType: prod.frameType,
        gender: prod.gender,
        color: prod.color,
        size: prod.size,
        requiresPrescription: prod.requiresPrescription || false,
        virtualTryOnEnabled: prod.virtualTryOnEnabled || false,
        isFeatured: prod.isFeatured || false,
        description: prod.description,
        inventory: {
          create: {
            quantity: prod.stock,
          },
        },
        images: {
          create: prod.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
      },
    });
    console.log(`✅ Product seeded: ${created.name}`);
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
