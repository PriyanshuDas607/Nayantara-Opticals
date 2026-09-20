import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages/HomePage";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Nayantara Opticals — Premium Eyewear in New Delhi" },
      {
        name: "description",
        content:
          "Premium eyewear, precision lenses and trusted optical care in Uttam Nagar, New Delhi, backed by 35+ years of optical experience.",
      },
      { property: "og:title", content: "Nayantara Opticals — Premium Eyewear in New Delhi" },
      {
        property: "og:description",
        content:
          "Frames, lenses, contact lenses and optical aids with unhurried in-store fitting in Uttam Nagar, New Delhi.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nayantaraopticals.in/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://nayantaraopticals.in/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Optician",
          name: "Nayantara Opticals",
          url: "https://nayantaraopticals.in/",
          description:
            "Premium eyewear, precision lenses and trusted optical care in Uttam Nagar, New Delhi.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "WZ-27, Shop No.1, Om Vihar, Phase-1, Near Metro Pillar 703",
            addressLocality: "Uttam Nagar, New Delhi",
            postalCode: "110059",
            addressRegion: "Delhi",
            addressCountry: "IN",
          },
          areaServed: "New Delhi",
          hasMap:
            "https://www.google.com/maps/search/?api=1&query=Nayantara+Opticals+Om+Vihar+Uttam+Nagar+New+Delhi",
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "10:00",
              closes: "20:30",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Sunday",
              opens: "11:00",
              closes: "18:00",
            },
          ],
        }),
      },
    ],
  }),
  component: HomePage,
});
