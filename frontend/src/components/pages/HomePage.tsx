import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ClipboardList,
  Clock,
  Eye,
  Glasses,
  Headphones,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductDialog } from "@/components/shop/ProductDialog";
import { FrameQuiz } from "@/components/shop/FrameQuiz";
import { TryOnDialog } from "@/components/common/TryOnDialog";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { CATEGORIES, LENS_PACKAGES, PRODUCTS, type Product } from "@/data/catalog";
import { REVIEW_SUMMARY } from "@/data/content";
import { SITE, inr, waLink } from "@/lib/site";
import { useShop } from "@/store/shop";
import heroImage from "@/assets/hero-cream.jpg";
import legacyImage from "@/assets/legacy-store.jpg";
import frame01 from "@/assets/frame-01.jpg";
import sun01 from "@/assets/sun-01.jpg";
import lens01 from "@/assets/lens-01.jpg";
import hearing01 from "@/assets/hearing-01.jpg";
import vision01 from "@/assets/vision-01.jpg";

const CATEGORY_IMAGES: Record<string, string> = {
  eyeglasses: frame01,
  sunglasses: sun01,
  "contact-lenses": lens01,
  "hearing-aids": hearing01,
  "vision-aids": vision01,
};

const METRICS = [
  { value: "35+", label: "Years of optical experience" },
  { value: "3", label: "Generations of local families" },
  { value: `${REVIEW_SUMMARY.average}★`, label: `From ${REVIEW_SUMMARY.count}+ in-store reviews` },
];

const REASONS = [
  {
    icon: Eye,
    title: "Unhurried consultations",
    body: "Dedicated appointment slots so your prescription, routine and comfort are all discussed properly.",
  },
  {
    icon: Glasses,
    title: "Fitting is part of the frame",
    body: "Every pair is adjusted on your face — nose pads, temple curve, pantoscopic tilt — before you leave.",
  },
  {
    icon: ShieldCheck,
    title: "Plain-language advice",
    body: "We explain what each lens option actually does, including when you don't need the pricier one.",
  },
  {
    icon: Users,
    title: "Care that continues",
    body: "Come back for adjustments and check-ins. Most of our customers were sent by someone they know.",
  },
];

const SLOTS = ["10:30 AM", "12:00 PM", "1:30 PM", "4:00 PM", "6:15 PM", "7:30 PM"];

export function HomePage() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const { markViewed } = useShop();

  const openProduct = (product: Product) => {
    markViewed(product);
    setSelected(product);
  };

  const trending = PRODUCTS.filter((p) => p.category === "eyeglasses" || p.category === "sunglasses").slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate min-h-[calc(100vh-5.25rem)] flex items-center overflow-hidden bg-[oklch(0.96_0.02_85)] text-foreground">
        <img
          src={heroImage}
          alt="Premium acetate eyeglasses on a dark pedestal against a warm wood backdrop"
          width={1600}
          height={1200}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[88%_50%] md:inset-y-0 md:left-[42%] md:w-[58%] md:object-[60%_50%] md:[mask-image:linear-gradient(90deg,transparent_0%,black_16%,black_100%)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,oklch(0.96_0.02_85)_92%,transparent)_0%,color-mix(in_oklab,oklch(0.96_0.02_85)_58%,transparent)_55%,color-mix(in_oklab,oklch(0.96_0.02_85)_88%,transparent)_100%)] md:bg-[linear-gradient(96deg,oklch(0.96_0.02_85)_6%,color-mix(in_oklab,oklch(0.96_0.02_85)_88%,transparent)_46%,color-mix(in_oklab,oklch(0.96_0.02_85)_12%,transparent)_80%)]" />
        <div
          aria-hidden="true"
          className="animate-float absolute -top-24 right-[-10%] h-[26rem] w-[26rem] rounded-full bg-champagne/20 blur-3xl"
        />
        <div className="relative mx-auto flex w-full max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="animate-rise max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background/60 px-3 py-1 text-[10.5px] font-semibold tracking-[0.16em] text-primary uppercase backdrop-blur-sm">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> Independent since 1990
            </span>
            <h1 className="mt-4 text-3xl leading-[1.04] font-semibold sm:text-5xl lg:text-6xl">
              See Life in
              <br />
              <span className="text-primary">Perfect Focus.</span>
            </h1>
            <p className="text-balance-pretty mt-3 max-w-lg text-sm sm:text-base leading-relaxed text-muted-foreground">
              Premium eyewear, precision lenses and 35+ years of trusted optical expertise — fitted
              with care in Uttam Nagar, New Delhi.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button asChild variant="gold" size="lg">
                <Link to="/shop">
                  Shop Eyeglasses <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="quiet"
                size="lg"
                className="border-foreground/20 bg-background/70 text-foreground hover:bg-background"
              >
                <Link to="/book">
                  <CalendarDays aria-hidden="true" /> Book Eye Test
                </Link>
              </Button>
            </div>
            <dl className="mt-7 grid max-w-lg grid-cols-3 gap-3 border-t border-foreground/15 pt-5">
              {METRICS.map((metric) => (
                <div key={metric.label} className="min-w-0">
                  <dt className="sr-only">{metric.label}</dt>
                  <dd>
                    <span className="font-display block text-xl font-semibold text-primary sm:text-2xl">
                      {metric.value}
                    </span>
                    <span className="mt-0.5 block text-[10.5px] leading-snug text-muted-foreground">
                      {metric.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>


      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Shop by category"
            title="Everything your eyes need, under one roof."
            description="Frames, lenses, contacts and specialist aids — each with hands-on guidance in store."
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category, index) => (
            <Reveal key={category.id} delay={index * 60}>
              <Link
                to="/shop"
                search={{ category: category.id } as never}
                className="group flex flex-col items-center text-center focus-visible:outline-none"
              >
                <span className="relative block aspect-square w-full max-w-[9.5rem] overflow-hidden rounded-full border border-border/70 bg-muted shadow-soft transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-lift group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <img
                    src={CATEGORY_IMAGES[category.id]}
                    alt={category.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                  />
                </span>
                <span className="mt-4 text-sm font-semibold">{category.label}</span>
                <span className="mt-1 text-xs leading-snug text-muted-foreground">{category.blurb}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="border-y border-border bg-aurora">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Trending collection"
              title="Frames with quiet presence."
              description="Thoughtfully selected shapes and materials, all on the shelf in Uttam Nagar."
              action={
                <Button asChild variant="outline" size="pill">
                  <Link to="/shop">
                    View all frames <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} onQuickView={openProduct} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LEGACY */}
      <section className="bg-ink text-background">
        <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-2">
          <img
            src={legacyImage}
            alt="The Nayantara Opticals showroom with backlit eyewear displays"
            loading="lazy"
            width={1408}
            height={1056}
            className="h-full min-h-[18rem] w-full object-cover"
          />
          <div className="px-6 py-10 sm:px-8 sm:py-14 lg:px-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-champagne uppercase">
              A 35-year legacy
            </p>
            <h2 className="mt-3 text-2xl leading-[1.08] font-semibold sm:text-4xl">
              The confidence of being truly looked after.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-sm sm:text-base text-background/70">
              Since 1990 we have fitted glasses for families across Uttam Nagar, Dwarka, Janakpuri
              and West Delhi. We take time to understand your prescription, your routine and how a
              frame sits — not simply how it looks on a shelf.
            </p>
            <ul className="mt-6 grid gap-2.5 text-sm text-background/75">
              {[
                "Independent, family-run since 1990",
                "Frames adjusted on your face before you leave",
                "Follow-up adjustments whenever you need them",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild variant="gold" size="lg" className="mt-7">
              <Link to="/about">
                Our story <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Why choose Nayantara"
            title="Optical care that earns its trust."
            align="center"
          />
        </Reveal>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 60} className="bg-card">
              <article className="h-full bg-card p-6 transition-colors hover:bg-accent/40">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                  <reason.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{reason.title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* QUIZ + TRY-ON */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <article className="bg-lens flex h-full flex-col justify-between gap-6 rounded-2xl border border-border p-6 shadow-soft sm:p-8">
              <div>
                <Badge variant="secondary" className="gap-1 rounded-full">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> Guided
                </Badge>
                <h3 className="mt-4 text-xl font-semibold sm:text-2xl">Find Your Frame</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Three quick questions on face shape, style and material — we shortlist frames worth
                  trying on your next visit.
                </p>
              </div>
              <Button variant="hero" size="default" className="w-fit" onClick={() => setQuizOpen(true)}>
                Take the 30-second quiz <ArrowRight aria-hidden="true" />
              </Button>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <div>
                <Badge variant="outline" className="gap-1 rounded-full">
                  <Camera className="h-3 w-3" aria-hidden="true" /> Phase 2
                </Badge>
                <h3 className="mt-4 text-xl font-semibold sm:text-2xl">Virtual Try-On</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Live camera try-on is in development for the next release. Until then, every frame
                  on this site is on the shelf in store.
                </p>
              </div>
              <Button variant="quiet" size="default" className="w-fit" onClick={() => setTryOnOpen(true)}>
                Preview what's coming
              </Button>
            </article>
          </Reveal>
        </div>
      </section>

      {/* LENS STUDIO */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Lens studio"
              title="Compare lenses without the jargon."
              description="Transparent packages. Final suitability and measurements are always confirmed in store."
              action={
                <Button asChild variant="outline" size="pill">
                  <Link to="/lenses">
                    Full lens comparison <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {LENS_PACKAGES.map((lens, index) => (
              <Reveal key={lens.id} delay={index * 60}>
                <article
                  className={`card-3d h-full rounded-2xl border bg-card p-6 shadow-soft ${lens.recommended ? "border-primary/60" : "border-border"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Glasses className="h-5 w-5 text-primary" aria-hidden="true" />
                    {lens.recommended ? (
                      <Badge className="rounded-full text-[11px]">Most chosen</Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{lens.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{lens.summary}</p>
                  <p className="font-display mt-4 text-base font-semibold">
                    {lens.delta === 0 ? "Included" : `+ ${inr(lens.delta)}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Best for: {lens.bestFor}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* APPOINTMENT + PRESCRIPTION */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <article className="h-full rounded-2xl border border-border bg-card p-8 shadow-soft sm:p-10">
              <p className="eyebrow">Book an eye check</p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Pick a time that suits you.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Choose a slot to carry through to the booking page. Nothing is submitted here.
              </p>
              <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Preferred time slot">
                {SLOTS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    aria-pressed={slot === time}
                    onClick={() => setSlot((prev) => (prev === time ? null : time))}
                    className={`rounded-full border px-4 py-2 text-sm transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                      slot === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <Clock className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                    {time}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
                {slot ? `Selected: ${slot}` : "No slot selected yet."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/book">
                    <CalendarDays aria-hidden="true" /> Continue booking
                  </Link>
                </Button>
                <Button asChild variant="quiet" size="lg">
                  <a
                    href={waLink(
                      slot
                        ? `Hi Nayantara Opticals, I'd like an eye check around ${slot}.`
                        : "Hi Nayantara Opticals, I'd like to book an eye check.",
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle aria-hidden="true" /> Ask on WhatsApp
                  </a>
                </Button>
              </div>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <div className="grid h-full gap-5">
              <article className="rounded-2xl border border-border bg-card p-8 shadow-soft">
                <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold">Prescription centre</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Upload a photo or enter OD/OS sphere, cylinder, axis and PD. Values stay on this
                  device in the current phase.
                </p>
                <Button asChild variant="link" className="mt-3 px-0">
                  <Link to="/prescription">
                    Add your prescription <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </article>
              <article className="rounded-2xl border border-border bg-card p-8 shadow-soft">
                <Headphones className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold">Contact lenses & hearing aids</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  First-fit handling sessions, trial pairs, in-store hearing device demos and
                  follow-up tuning.
                </p>
                <Button asChild variant="link" className="mt-3 px-0">
                  <Link to="/services">
                    Explore services <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </article>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS + FEEDBACK */}
      <FeedbackSection id="feedback" />


      {/* VISIT */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <p className="eyebrow">Visit the store</p>
              <h2 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
                Near Metro Pillar 703, Uttam Nagar.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">{SITE.address}</p>
              <dl className="mt-7 grid gap-3 text-sm">
                {SITE.hours.map((row) => (
                  <div key={row.day} className="flex flex-wrap justify-between gap-2 border-b border-border pb-3">
                    <dt className="font-medium">{row.day}</dt>
                    <dd className="text-muted-foreground">{row.time}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <a href={SITE.directionsUrl} target="_blank" rel="noreferrer">
                    <MapPin aria-hidden="true" /> Get directions
                  </a>
                </Button>
                <Button asChild variant="quiet" size="lg">
                  <Link to="/contact">Contact & hours</Link>
                </Button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
              <iframe
                title="Map showing Nayantara Opticals in Uttam Nagar, New Delhi"
                src="https://www.google.com/maps?q=Om%20Vihar%20Phase%201%20Uttam%20Nagar%20New%20Delhi%20110059&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[22rem] w-full border-0 sm:h-[26rem]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <ProductDialog product={selected} onOpenChange={(open) => !open && setSelected(null)} />
      <FrameQuiz open={quizOpen} onOpenChange={setQuizOpen} onSelect={openProduct} />
      <TryOnDialog open={tryOnOpen} onOpenChange={setTryOnOpen} />
    </>
  );
}
