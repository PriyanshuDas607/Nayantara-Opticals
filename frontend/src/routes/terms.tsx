import { createFileRoute } from "@tanstack/react-router";
import { TermsConditionsPage } from "@/components/pages/LegalPages";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Nayantara Opticals" },
      {
        name: "description",
        content:
          "Terms and conditions for optical checkup appointments, eyewear orders, and warranty at Nayantara Opticals.",
      },
      { property: "og:title", content: "Terms & Conditions — Nayantara Opticals" },
      {
        property: "og:description",
        content: "Agreement for optical care, eyewear fitting, and custom lens dispensing in Uttam Nagar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsConditionsPage,
});
