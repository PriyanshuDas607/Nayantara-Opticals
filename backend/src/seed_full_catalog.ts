import { prisma } from "./utils/prisma.js";

async function main() {
  console.log("🌱 Syncing all 13 catalog products into Supabase PostgreSQL...");

  // 1. Ensure Categories exist
  const categories = [
    { name: "Eyeglasses", slug: "eyeglasses", description: "Designer & lightweight optical frames" },
    { name: "Sunglasses", slug: "sunglasses", description: "UV400 & polarized protective sunglasses" },
    { name: "Contact Lenses", slug: "contact-lenses", description: "Daily, monthly and toric soft contact lenses" },
    { name: "Vision Aids", slug: "vision-aids", description: "Low vision magnifiers, LED reading tools & accessories" },
    { name: "Hearing Aids", slug: "hearing-aids", description: "Digital rechargeable CIC & BTE hearing aids" },
  ];

  const catMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    catMap.set(c.slug, cat.id);
    catMap.set(c.name.toLowerCase(), cat.id);
  }

  // 2. Ensure Store exists
  const store = await prisma.store.findFirst();
  const storeId = store?.id;

  // 3. Complete 13 Products list
  const allProducts = [
    {
      slug: "aurelia-round",
      name: "Aurelia Round",
      sku: "NO-EYE-AUR",
      categorySlug: "eyeglasses",
      pricePaise: 349900,
      salePricePaise: 429900,
      image: "/assets/frame-01.jpg",
      frameShape: "Round",
      frameMaterial: "Acetate",
      gender: "Unisex",
      isFeatured: true,
      description: "Hand-polished Italian acetate with a warm tortoise depth. A softly rounded silhouette that balances angular features.",
      stock: 20,
    },
    {
      slug: "meridian-gold",
      name: "Meridian Gold",
      sku: "NO-EYE-MER",
      categorySlug: "eyeglasses",
      pricePaise: 489900,
      salePricePaise: 599900,
      image: "/assets/frame-02.jpg",
      frameShape: "Rectangle",
      frameMaterial: "Metal",
      gender: "Unisex",
      isFeatured: true,
      description: "A whisper-thin metal rim with adjustable nose pads. Understated, boardroom-ready, and barely there at 17 grams.",
      stock: 15,
    },
    {
      slug: "graphite-squareline",
      name: "Graphite Squareline",
      sku: "NO-EYE-GRA",
      categorySlug: "eyeglasses",
      pricePaise: 569900,
      salePricePaise: 699900,
      image: "/assets/frame-03.jpg",
      frameShape: "Square",
      frameMaterial: "Titanium",
      gender: "Men",
      isFeatured: true,
      description: "Flex-hinge titanium with a matte finish that resists fingerprints. Built for long screen days and long commutes.",
      stock: 12,
    },
    {
      slug: "classic-acetate-square",
      name: "Classic Acetate Square",
      sku: "NO-EYE-001",
      categorySlug: "eyeglasses",
      pricePaise: 249900,
      salePricePaise: 349900,
      image: "/assets/frame-01.jpg",
      frameShape: "Square",
      frameMaterial: "Handcrafted Acetate",
      gender: "Unisex",
      isFeatured: true,
      description: "Lightweight vintage-inspired optical frame with German spring hinges and custom nose pads.",
      stock: 25,
    },
    {
      slug: "aero-titanium-round",
      name: "Aero Titanium Round",
      sku: "NO-EYE-002",
      categorySlug: "eyeglasses",
      pricePaise: 399900,
      salePricePaise: 499900,
      image: "/assets/frame-02.jpg",
      frameShape: "Round",
      frameMaterial: "Pure Titanium",
      gender: "Unisex",
      isFeatured: true,
      description: "Featherlight 7g titanium wire frame designed for all-day comfort and timeless minimalism.",
      stock: 18,
    },
    {
      slug: "solstice-aviator",
      name: "Solstice Aviator",
      sku: "NO-SUN-SOL",
      categorySlug: "sunglasses",
      pricePaise: 429900,
      salePricePaise: 519900,
      image: "/assets/sun-01.jpg",
      frameShape: "Aviator",
      frameMaterial: "Monel Metal",
      gender: "Men",
      isFeatured: true,
      description: "Polarised green gradient lenses cut glare off glass and asphalt. Classic double-bridge aviator in a warm gold finish.",
      stock: 22,
    },
    {
      slug: "amber-cat-eye",
      name: "Amber Cat-Eye",
      sku: "NO-SUN-AMB",
      categorySlug: "sunglasses",
      pricePaise: 389900,
      salePricePaise: 479900,
      image: "/assets/sun-02.jpg",
      frameShape: "Cat-Eye",
      frameMaterial: "Acetate",
      gender: "Women",
      isFeatured: true,
      description: "An oversized cat-eye in translucent amber acetate. Sculpted uplift at the temples with full UV400 tinted lenses.",
      stock: 14,
    },
    {
      slug: "polarized-aviator-elite",
      name: "Polarized Aviator Elite",
      sku: "NO-SUN-001",
      categorySlug: "sunglasses",
      pricePaise: 349900,
      salePricePaise: 449900,
      image: "/assets/sun-01.jpg",
      frameShape: "Aviator",
      frameMaterial: "Monel Metal",
      gender: "Men",
      isFeatured: true,
      description: "HD polarized optical lenses offering 100% UV protection and enhanced road clarity.",
      stock: 20,
    },
    {
      slug: "clearday-daily-30",
      name: "ClearDay Daily 30",
      sku: "NO-LENS-CLR",
      categorySlug: "contact-lenses",
      pricePaise: 129900,
      salePricePaise: 159900,
      image: "/assets/lens-01.jpg",
      frameShape: "Daily Disposable",
      frameMaterial: "Silicone Hydrogel",
      gender: "Unisex",
      isFeatured: false,
      description: "Breathable silicone hydrogel daily lenses with high water content. Fresh pair each morning, nothing to clean at night.",
      stock: 40,
    },
    {
      slug: "aquamonth-toric-6",
      name: "AquaMonth Toric 6",
      sku: "NO-LENS-TOR",
      categorySlug: "contact-lenses",
      pricePaise: 219900,
      salePricePaise: 269900,
      image: "/assets/lens-01.jpg",
      frameShape: "Monthly Toric",
      frameMaterial: "Silicone Hydrogel",
      gender: "Unisex",
      isFeatured: false,
      description: "Stabilised toric design for cylindrical astigmatism prescriptions. Six monthly lenses per box.",
      stock: 30,
    },
    {
      slug: "aquahydrate-daily-lenses",
      name: "AquaHydrate Daily Lenses (30 Pack)",
      sku: "NO-LENS-001",
      categorySlug: "contact-lenses",
      pricePaise: 185000,
      salePricePaise: 225000,
      image: "/assets/lens-01.jpg",
      frameShape: "Daily Disposable",
      frameMaterial: "Silicone Hydrogel",
      gender: "Unisex",
      isFeatured: true,
      description: "Daily disposable silicone hydrogel contact lenses providing 16 hours of continuous moisture.",
      stock: 50,
    },
    {
      slug: "echo-bte-mini",
      name: "Echo BTE Mini",
      sku: "NO-AID-ECH",
      categorySlug: "hearing-aids",
      pricePaise: 1899900,
      salePricePaise: 2199900,
      image: "/assets/hearing-01.jpg",
      frameShape: "Behind-the-ear",
      frameMaterial: "Polymer",
      gender: "Unisex",
      isFeatured: true,
      description: "Discreet rechargeable behind-the-ear aid with directional microphones and a full-day battery.",
      stock: 8,
    },
    {
      slug: "lumen-handheld-magnifier",
      name: "Lumen Handheld Magnifier",
      sku: "NO-AID-LUM",
      categorySlug: "vision-aids",
      pricePaise: 249900,
      salePricePaise: 299900,
      image: "/assets/vision-01.jpg",
      frameShape: "Handheld",
      frameMaterial: "Polymer",
      gender: "Unisex",
      isFeatured: false,
      description: "LED-illuminated 5x magnifier with a distortion-free aspheric lens. Helpful for fine print and documents.",
      stock: 16,
    },
  ];

  for (const item of allProducts) {
    const categoryId = catMap.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`Category not found for slug: ${item.categorySlug}`);
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: { slug: item.slug },
    });

    if (existing) {
      // Update image, category, and ensure active
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          categoryId,
          pricePaise: item.pricePaise,
          salePricePaise: item.salePricePaise,
          frameShape: item.frameShape,
          frameMaterial: item.frameMaterial,
          gender: item.gender,
          description: item.description,
          isFeatured: item.isFeatured,
          isActive: true,
          deletedAt: null,
          images: {
            deleteMany: {},
            create: [{ url: item.image, isPrimary: true, sortOrder: 0 }],
          },
          inventory: {
            upsert: {
              create: { quantity: item.stock },
              update: { quantity: item.stock },
            },
          },
        },
      });
      console.log(`Updated product: ${item.name}`);
    } else {
      await prisma.product.create({
        data: {
          slug: item.slug,
          name: item.name,
          sku: item.sku,
          categoryId,
          storeId,
          pricePaise: item.pricePaise,
          salePricePaise: item.salePricePaise,
          frameShape: item.frameShape,
          frameMaterial: item.frameMaterial,
          gender: item.gender,
          description: item.description,
          isFeatured: item.isFeatured,
          isActive: true,
          inventory: {
            create: { quantity: item.stock },
          },
          images: {
            create: [{ url: item.image, isPrimary: true, sortOrder: 0 }],
          },
        },
      });
      console.log(`Created product: ${item.name}`);
    }
  }

  const finalCount = await prisma.product.count({ where: { isActive: true, deletedAt: null } });
  console.log(`🎉 Catalog sync complete! Active products in Supabase DB: ${finalCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
