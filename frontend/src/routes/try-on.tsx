import { createFileRoute } from "@tanstack/react-router";
import { TryOnPage } from "@/components/pages/TryOnPage";
import { PRODUCTS } from "@/data/catalog";

export const Route = createFileRoute("/try-on")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "3D Virtual Try-On - Nayantara Opticals" },
      {
        name: "description",
        content:
          "Try in-stock eyeglasses and sunglasses live on your face with 3D AR camera technology before visiting our Uttam Nagar showroom.",
      },
      { property: "og:title", content: "3D Virtual Try-On - Nayantara Opticals" },
      {
        property: "og:description",
        content:
          "Experience 468-point real-time AI face mesh virtual try-on for all designer optical frames and sunglasses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nayantaraopticals.in/try-on" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nayantaraopticals.in/try-on" }],
  }),
  component: TryOnPage,
});
