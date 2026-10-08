import { createFileRoute } from "@tanstack/react-router";
import { RefundPolicyPage } from "@/components/pages/LegalPages";

export const Route = createFileRoute("/refund")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Refund & Replacement Policy — Nayantara Opticals" },
      {
        name: "description",
        content:
          "Returns, 7-day frame exchange, power adaptation guarantee, and refund policies for eyewear at Nayantara Opticals.",
      },
      { property: "og:title", content: "Refund & Replacement Policy — Nayantara Opticals" },
      {
        property: "og:description",
        content: "Transparent return and power adaptation policies for spectacles and lenses in New Delhi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RefundPolicyPage,
});
