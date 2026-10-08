import { createFileRoute } from "@tanstack/react-router";
import { CookiePolicyPage } from "@/components/pages/LegalPages";

export const Route = createFileRoute("/cookies")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Cookie & Storage Policy — Nayantara Opticals" },
      {
        name: "description",
        content:
          "Learn how Nayantara Opticals uses essential cookies and local storage to keep your bag and session secure.",
      },
      { property: "og:title", content: "Cookie Policy — Nayantara Opticals" },
      {
        property: "og:description",
        content: "Transparent browser storage and privacy controls at Nayantara Opticals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CookiePolicyPage,
});
