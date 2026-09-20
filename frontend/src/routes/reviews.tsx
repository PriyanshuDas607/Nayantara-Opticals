import { createFileRoute } from "@tanstack/react-router";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";

export const Route = createFileRoute("/reviews")({
  staticData: { sitemap: true }, head: () => ({
    meta: [
      { title: "Reviews & Feedback — Nayantara Opticals" },
      {
        name: "description",
        content:
          "Read customer ratings for Nayantara Opticals in Uttam Nagar, New Delhi, and share your own star rating and written feedback.",
      },
      { property: "og:title", content: "Reviews & Feedback — Nayantara Opticals" },
      {
        property: "og:description",
        content: "Customer ratings and feedback for Nayantara Opticals, New Delhi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <>
      <section className="bg-ink px-4 py-6 sm:px-6 sm:py-8 lg:px-8 text-background">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-champagne uppercase">
            Ratings & feedback
          </p>
          <h1 className="mt-2 max-w-2xl text-2xl leading-tight font-semibold sm:text-3xl lg:text-4xl">
            What our customers say.
          </h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed text-background/70">
            Honest experiences from families we have fitted glasses for across West Delhi — and space
            for you to add yours.
          </p>
        </div>
      </section>
      <FeedbackSection id="feedback" />
    </>
  );
}
