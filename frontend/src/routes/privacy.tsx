import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyPage } from "@/components/pages/LegalPages";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy & Data Protection — Nayantara Opticals" },
      {
        name: "description",
        content:
          "Read Nayantara Opticals' privacy policy and patient data protection practices under DPDP Act 2023.",
      },
      { property: "og:title", content: "Privacy Policy — Nayantara Opticals" },
      {
        property: "og:description",
        content: "Transparent data protection and clinical prescription privacy standards in New Delhi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPolicyPage,
});
