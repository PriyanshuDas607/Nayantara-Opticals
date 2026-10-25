import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
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
import heroFrames from "@/assets/hero-frames.jpg";
import heroNavy from "@/assets/hero-navy.jpg";
import showroomImage from "@/assets/showroom.jpg";
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
  { value: "1990", label: "Established in Uttam Nagar" },
  { value: "In-Store", label: "Computerized eye testing" },
  { value: "Custom", label: "Hand-fitted frame alignment" },
];

const SHOWCASE_SLIDES = [
  {
    id: "bespoke-acetate",
    tabLabel: "Acetate",
    badge: "Bespoke Collection",
    tag: "Italian Acetate",
    title: "Tortoiseshell Precision Frames",
    caption: "Sculpted organic acetate adjusted to your bridge width & facial contours.",
    image: heroImage,
    alt: "Tortoiseshell acetate optical frame displayed on stand in boutique",
    objectPosition: "object-[48%_68%]",
    chip: "Hand-Fitted Bridge",
  },
  {
    id: "kaleos-optics",
    tabLabel: "Optics",
    badge: "Clinical Optics",
    tag: "Multi-Coat",
    title: "Kaleos Precision Optics",
    caption: "German & Japanese high-index lenses with anti-reflective & blue-cut filters.",
    image: heroFrames,
    alt: "Floating Kaleos handcrafted optical frame with antireflective green coating",
    objectPosition: "object-center",
    chip: "Multi-Coat UV400",
  },
  {
    id: "amber-luxury",
    tabLabel: "Amber",
    badge: "Boutique Edition",
    tag: "Reinforced Core",
    title: "Amber Crystal Spectacles",
    caption: "Warm amber silhouette engineered with five-barrel German hinges.",
    image: heroNavy,
    alt: "Amber crystal optical spectacles with warm studio illumination",
    objectPosition: "object-center",
    chip: "Prescription Ready",
  },
  {
    id: "showroom-clinic",
    tabLabel: "Showroom",
    badge: "Flagship Clinic",
    tag: "Est. 1990",
    title: "Uttam Nagar Optometry Studio",
    caption: "Opp. Metro Pillar 703. Computerized eye testing & 500+ curated frames.",
    image: showroomImage,
    alt: "Nayantara Opticals boutique showroom and consulting suite in New Delhi",
    objectPosition: "object-[48%_50%]",
    chip: "In-Store Fitting",
  },
];

const REASONS = [
  {
    icon: Eye,
    title: "Unhurried consultations",
    body: "Dedicated appointment slots so your prescription, routine, and visual comfort are discussed thoroughly.",
  },
  {
    icon: Glasses,
    title: "Fitting is part of the frame",
    body: "Every pair is adjusted on your face, including nose pads, temple curve, and pantoscopic tilt, before you leave.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent clinical advice",
    body: "We explain what each lens option provides, including honest advice when a standard lens is suitable.",
  },
  {
    icon: Users,
    title: "Long-term aftercare",
    body: "Complimentary frame tune-ups, screw tightening, and ultrasonic cleaning for every patient.",
  },
];

const SLOTS = ["10:30 AM", "12:00 PM", "1:30 PM", "4:00 PM", "6:15 PM", "7:30 PM"];

export function HomePage() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { markViewed } = useShop();

  // Auto-advance showcase slides every 5s unless paused by user interaction
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const openProduct = (product: Product) => {
    markViewed(product);
    setSelected(product);
  };

  const trending = PRODUCTS.filter((p) => p.category === "eyeglasses" || p.category === "sunglasses").slice(0, 6);
  const currentSlide = SHOWCASE_SLIDES[activeSlide]!;

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background border-b border-border text-foreground">
        <div className="relative mx-auto max-w-7xl px-4 pt-5 pb-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
            
            {/* Content Column */}
            <div className="flex flex-col lg:col-span-7">
              {/* Trust & Location Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/40 bg-card px-3 py-1 text-[11px] font-semibold text-foreground shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Independent Boutique · Est. 1990
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3 text-primary" aria-hidden="true" /> Uttam Nagar, New Delhi
                </span>
              </div>

              {/* Headline */}
              <h1 className="mt-3.5 sm:mt-5 font-display text-[2.2rem] sm:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight">
                See Life in
                <br />
                <span className="text-primary italic font-serif">Perfect Focus.</span>
              </h1>

              {/* Direct Subtitle */}
              <p className="mt-3 sm:mt-4 max-w-xl text-xs sm:text-base leading-relaxed text-muted-foreground">
                Comprehensive computerized eye tests, German and Japanese precision lenses, and anatomical frame adjustment. Fitted with care in West Delhi since 1990.
              </p>

              {/* Mobile Hero Interactive Showcase Deck (< lg) */}
              <div
                className="mt-4 mb-2 lg:hidden relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
              >
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.alt}
                    width={1200}
                    height={825}
                    fetchPriority="high"
                    className={`h-full w-full object-cover transition-all duration-700 ease-out ${currentSlide.objectPosition}`}
                  />
                  {/* Subtle Top & Bottom Vignettes for Text Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

                  {/* Top Floating Glass Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-semibold text-white border border-white/20">
                      <Sparkles className="h-3 w-3 text-amber-300" aria-hidden="true" />
                      {currentSlide.badge}
                    </span>
                    <span className="rounded-md bg-white/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-white border border-white/20">
                      {currentSlide.chip}
                    </span>
                  </div>

                  {/* Left / Right Nav Chevrons */}
                  <button
                    type="button"
                    aria-label="Previous frame showcase"
                    onClick={() => setActiveSlide((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md border border-white/20 active:scale-90 transition-transform"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next frame showcase"
                    onClick={() => setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md border border-white/20 active:scale-90 transition-transform"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Bottom Glass Caption */}
                  <div className="absolute bottom-2.5 inset-x-2.5 text-white">
                    <div className="rounded-xl bg-black/60 backdrop-blur-md p-2.5 border border-white/15">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold leading-tight">{currentSlide.title}</p>
                        <span className="text-[10px] text-amber-300 font-medium">{activeSlide + 1} / {SHOWCASE_SLIDES.length}</span>
                      </div>
                      <p className="mt-0.5 text-[10.5px] text-white/80 line-clamp-1 leading-snug">
                        {currentSlide.caption}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Interactive Tab Pills */}
                <div className="mt-2 flex items-center justify-between gap-1 px-0.5">
                  {SHOWCASE_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`flex-1 py-1 px-1 text-center text-[10.5px] font-medium rounded-md transition-all ${
                        activeSlide === idx
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {slide.tabLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Button
                  type="button"
                  variant="hero"
                  size="lg"
                  onClick={() => {
                    setTryOnProduct(PRODUCTS[0]);
                    setTryOnOpen(true);
                  }}
                  className="flex-1 sm:flex-initial h-11 text-xs sm:text-sm font-semibold rounded-md bg-amber-500 hover:bg-amber-400 text-black border-none gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  <span>3D Virtual Try-On</span>
                </Button>
                <Button asChild variant="gold" size="lg" className="flex-1 sm:flex-initial h-11 text-xs sm:text-sm font-semibold rounded-md shadow-xs">
                  <Link to="/shop">
                    Browse Frames <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="quiet"
                  size="lg"
                  className="flex-1 sm:flex-initial h-11 text-xs sm:text-sm font-semibold border-border bg-card text-foreground hover:bg-muted rounded-md"
                >
                  <Link to="/book">
                    <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-primary" aria-hidden="true" /> Book Eye Test
                  </Link>
                </Button>
              </div>

              {/* Factual Information Strip */}
              <dl className="mt-5 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-6 border-t border-border pt-4 sm:pt-5">
                {METRICS.map((metric) => (
                  <div key={metric.label} className="min-w-0 rounded-lg bg-muted/30 p-2 sm:bg-transparent sm:p-0 text-center sm:text-left border border-border/40 sm:border-0">
                    <dt className="sr-only">{metric.label}</dt>
                    <dd>
                      <span className="font-display block text-base sm:text-2xl font-bold text-primary leading-tight">
                        {metric.value}
                      </span>
                      <span className="mt-0.5 block text-[10px] sm:text-xs leading-tight text-muted-foreground line-clamp-2">
                        {metric.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Desktop Eyewear Showcase Column (lg:block) */}
            <div
              className="hidden lg:block lg:col-span-5 relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  width={1200}
                  height={1500}
                  className={`h-full w-full object-cover transition-all duration-700 ease-out ${currentSlide.objectPosition}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/20">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    {currentSlide.badge}
                  </span>
                  <span className="rounded-md bg-white/20 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white border border-white/20">
                    {currentSlide.chip}
                  </span>
                </div>

                {/* Left/Right Controls */}
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() => setActiveSlide((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Bottom Content Card */}
                <div className="absolute bottom-5 inset-x-5 text-white">
                  <div className="bg-black/65 backdrop-blur-md p-4 rounded-xl border border-white/15">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{currentSlide.title}</p>
                      <span className="text-xs text-amber-300 font-medium">{activeSlide + 1} / {SHOWCASE_SLIDES.length}</span>
                    </div>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      {currentSlide.caption}
                    </p>

                    {/* Interactive Tab Dots */}
                    <div className="mt-3 flex gap-1.5 pt-2 border-t border-white/10">
                      {SHOWCASE_SLIDES.map((slide, idx) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setActiveSlide(idx)}
                          className={`flex-1 py-1 text-[11px] font-medium rounded transition-all ${
                            activeSlide === idx
                              ? "bg-white text-black font-semibold"
                              : "bg-white/20 text-white/80 hover:bg-white/30"
                          }`}
                        >
                          {slide.tabLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Shop by category"
            title="Everything your eyes need, under one roof."
            description="Frames, lenses, contacts and specialist aids, each with hands-on guidance in store."
            align="center"
          />
        </Reveal>
        
        {/* Mobile Horizontal Snap Carousel + Desktop Grid */}
        <div className="mt-6 sm:mt-12 flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-5 sm:gap-x-4 sm:gap-y-9">
          {CATEGORIES.map((category, index) => (
            <Reveal key={category.id} delay={index * 60} className="shrink-0 snap-start w-[7.25rem] sm:w-auto">
              <Link
                to="/shop"
                search={{ category: category.id } as never}
                className="group flex flex-col items-center text-center focus-visible:outline-none active:scale-[0.98] transition-transform"
              >
                <span className="relative block aspect-square w-24 sm:w-full sm:max-w-[9.5rem] overflow-hidden rounded-2xl sm:rounded-full border border-border/80 bg-muted shadow-soft transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-primary/50 group-hover:shadow-lift group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <img
                    src={CATEGORY_IMAGES[category.id]}
                    alt={category.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:hidden" />
                </span>
                <span className="mt-2 sm:mt-4 text-xs sm:text-sm font-semibold group-hover:text-primary transition-colors">{category.label}</span>
                <span className="mt-0.5 text-[10px] sm:text-xs leading-snug text-muted-foreground line-clamp-2">{category.blurb}</span>
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
                <Button asChild variant="outline" size="default">
                  <Link to="/shop">
                    View all frames <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard
                  product={product}
                  onQuickView={openProduct}
                  onTryOn={(p) => {
                    setSelected(p);
                    setTryOnOpen(true);
                  }}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LEGACY */}
      <section className="bg-ink text-background overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-2">
          <div className="relative min-h-[16rem] sm:min-h-[22rem] lg:min-h-full w-full overflow-hidden">
            <img
              src={legacyImage}
              alt="The Nayantara Opticals showroom with backlit eyewear displays"
              loading="lazy"
              width={1408}
              height={1056}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent lg:hidden" />
            <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-champagne border border-champagne/30">
                <MapPin className="h-3 w-3 text-champagne" /> Opp. Metro Pillar 703
              </span>
            </div>
          </div>
          <div className="px-5 py-8 sm:px-8 sm:py-14 lg:px-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-champagne uppercase">
              A 35-year legacy
            </p>
            <h2 className="mt-3 text-2xl leading-[1.08] font-semibold sm:text-4xl">
              The confidence of being truly looked after.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-sm sm:text-base text-background/70">
              Since 1990 we have fitted glasses for families across Uttam Nagar, Dwarka, Janakpuri
              and West Delhi. We take time to understand your prescription, your routine and how a
              frame sits, not simply how it looks on a shelf.
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
            <Button asChild variant="gold" size="lg" className="mt-7 rounded-md">
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
                <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10">
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
                <Badge variant="secondary" className="gap-1 rounded-md">
                  Guided Selection
                </Badge>
                <h3 className="mt-4 text-xl font-semibold sm:text-2xl">Find Your Frame</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Three straightforward questions on face shape, style, and material to shortlist frames worth
                  trying on your next visit.
                </p>
              </div>
              <Button variant="hero" size="default" className="w-fit rounded-md" onClick={() => setQuizOpen(true)}>
                Take the frame questionnaire <ArrowRight aria-hidden="true" />
              </Button>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <div>
                <Badge variant="outline" className="gap-1 rounded-md text-amber-500 border-amber-500/30 bg-amber-500/10">
                  <Camera className="h-3 w-3" aria-hidden="true" /> Live 3D WebAR
                </Badge>
                <h3 className="mt-4 text-xl font-semibold sm:text-2xl">3D Virtual Try-On</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Try our in-stock eyeglasses and UV400 sunglasses directly on your face with real-time 468-point AI face mesh tracking.
                </p>
              </div>
              <Button variant="hero" size="default" className="w-fit rounded-md bg-amber-500 hover:bg-amber-400 text-black border-none gap-2" onClick={() => setTryOnOpen(true)}>
                <Camera className="h-4 w-4" /> Launch 3D Try-On
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
              title="Compare lenses without jargon."
              description="Clear lens packages. Final measurements and parameters are confirmed in person."
              action={
                <Button asChild variant="outline" size="default">
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
                      <Badge className="rounded-md text-[11px]">Recommended</Badge>
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
                    className={`rounded-md border px-4 py-2 text-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none ${
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

      <ProductDialog
        product={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onTryOn={(p) => {
          const chosen = p || selected;
          setSelected(null);
          setTryOnProduct(chosen);
          setTryOnOpen(true);
        }}
      />
      <FrameQuiz open={quizOpen} onOpenChange={setQuizOpen} onSelect={openProduct} />
      <TryOnDialog
        open={tryOnOpen}
        onOpenChange={(open) => {
          setTryOnOpen(open);
          if (!open) setTryOnProduct(null);
        }}
        product={tryOnProduct}
      />
    </>
  );
}
