import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/components/pages/ShopPage";
import { PRODUCTS } from "@/data/catalog";

export const Route = createFileRoute("/shop")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Shop Eyewear — Nayantara Opticals" },
      {
        name: "description",
        content:
          "Shop premium eyeglasses, sunglasses, contact lenses and optical aids in New Delhi.",
      },
      { property: "og:title", content: "Shop Eyewear — Nayantara Opticals" },
      {
        property: "og:description",
        content: "Curated eyewear with expert in-store fitting in Uttam Nagar.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nayantaraopticals.in/shop" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nayantaraopticals.in/shop" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Eyewear at Nayantara Opticals",
          itemListElement: PRODUCTS.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: product.name,
              brand: { "@type": "Brand", name: product.brand },
              category: product.category,
              material: product.material,
              description: product.description,
              offers: {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "INR",
                availability: product.inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                url: "https://nayantaraopticals.in/shop",
              },
            },
          })),
        }),
      },
    ],
  }),
  component: ShopPage,
});
