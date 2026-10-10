import { useRef, useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Clock3,
  Calendar,
  Eye,
  FileText,
  Glasses,
  HeartPulse,
  HelpCircle,
  Layers,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  SunMedium,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SERVICES } from "@/data/content";
import { LENS_PACKAGES } from "@/data/catalog";
import { SITE, inr, waLink } from "@/lib/site";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/store/auth";

export function PageIntro({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-aurora">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-end md:justify-between lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl font-display text-foreground">
            {title}
          </h1>
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{children}</div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

/* =========================================================================
   1. SERVICES PAGE — Full Optical Clinic & Healthcare Offerings
   ========================================================================= */
export function ServicesPage() {
  return (
    <div className="bg-background text-foreground">
      <PageIntro
        eyebrow="Clinical Care & Precision Optics"
        title="Comprehensive eye care & optical services."
        action={
          <Button asChild variant="hero" size="default" className="rounded-full shadow-gold">
            <Link to="/book">
              <Eye className="mr-1.5 h-4 w-4" /> Book Consultation
            </Link>
          </Button>
        }
      >
        From computer-assisted refractions to bespoke progressive lens fittings, pediatric myopia control, and specialist hearing aids — delivered with unhurried clinical care in New Delhi.
      </PageIntro>

      {/* 6 Comprehensive Service Offerings */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <article
              key={service.id}
              className="card-3d flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {service.icon === "eye" ? (
                      <Eye className="h-5 w-5" />
                    ) : service.icon === "glasses" ? (
                      <Glasses className="h-5 w-5" />
                    ) : service.icon === "contact" ? (
                      <Sparkles className="h-5 w-5" />
                    ) : service.icon === "ear" ? (
                      <Users className="h-5 w-5" />
                    ) : service.icon === "scan" ? (
                      <Stethoscope className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    In-Store Care
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-foreground">{service.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground/90">{service.detail}</p>
              </div>

              <div className="mt-5 border-t border-border/70 pt-4">
                <p className="text-xs font-semibold text-foreground tracking-wide uppercase">What's included:</p>
                <ul className="mt-2.5 space-y-2 text-xs text-muted-foreground">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between">
                  {service.id === "myopia-management" ? (
                    <Button asChild variant="link" size="sm" className="px-0 text-xs font-semibold text-primary">
                      <Link to="/myopia-management">Explore Myopia Clinic →</Link>
                    </Button>
                  ) : service.id === "prescriptions" ? (
                    <Button asChild variant="link" size="sm" className="px-0 text-xs font-semibold text-primary">
                      <Link to="/prescription">Upload Prescription →</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="link" size="sm" className="px-0 text-xs font-semibold text-primary">
                      <Link to="/book">Reserve Slot →</Link>
                    </Button>
                  )}

                  <a
                    href={waLink(`Hi Nayantara Opticals, I want to enquire about ${service.title}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    title="Enquire on WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Clinical Standards & Why Choose Nayantara */}
      <section className="border-t border-border bg-aurora/40 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <p className="eyebrow">The Nayantara Standard</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold font-display">
                Precision optical dispensing, zero sales pressure.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Unlike corporate chain stores focused on quick volume, Nayantara Opticals has spent 35+ years building trust through unhurried examinations, anatomical frame adjustments, and lifelong aftercare.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="mt-2 text-sm font-semibold">100% Adaptation Guarantee</h3>
                  <p className="mt-1 text-xs text-muted-foreground">If you cannot adapt to your progressive lenses within 30 days, we refit or replace free of charge.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="mt-2 text-sm font-semibold">Japanese Auto-Refraction</h3>
                  <p className="mt-1 text-xs text-muted-foreground">High-precision digital eye testing equipment with binocular balancing for effortless visual comfort.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-6 sm:p-8 shadow-soft">
              <h3 className="font-display text-xl font-semibold">Our 4-Step Patient Consultation</h3>
              <ol className="mt-5 space-y-4 text-xs sm:text-sm">
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">1</span>
                  <div>
                    <strong className="text-foreground">Lifestyle & Visual Demands Review:</strong>
                    <p className="text-muted-foreground mt-0.5">We analyze your daily routine, screen hours, driving habits, and posture requirements.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">2</span>
                  <div>
                    <strong className="text-foreground">Subjective & Objective Refraction:</strong>
                    <p className="text-muted-foreground mt-0.5">Precise measurement of spherical, cylindrical, and presbyopic powers with cross-cylinder verification.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">3</span>
                  <div>
                    <strong className="text-foreground">Facial Centration & Pantoscopic Fit:</strong>
                    <p className="text-muted-foreground mt-0.5">Digital pupillometry, vertex distance, and pantoscopic tilt adjustment on your chosen frame.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">4</span>
                  <div>
                    <strong className="text-foreground">Lifetime Care & Micro-Adjustments:</strong>
                    <p className="text-muted-foreground mt-0.5">Free ultrasonic cleaning, screw tightening, nose-pad changes, and frame realignment whenever you need.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Quick CTA Banner */}
      <section className="border-t border-border bg-ink text-background py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 sm:flex-row text-center sm:text-left">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold">Have questions about an eye check or prescription?</h3>
            <p className="mt-1 text-sm text-background/70">Connect directly with our master optometrists on WhatsApp or call our store in Uttam Nagar.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="gold" size="default">
              <Link to="/book">Book In-Store Slot</Link>
            </Button>
            <Button asChild variant="quiet" size="default" className="border-background/20 bg-background/10 text-background hover:bg-background/20">
              <a href={waLink("Hi Nayantara Opticals, I want to consult regarding eye test.")} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1.5 h-4 w-4" /> Message on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   2. OUR STORY PAGE — Heritage, 35+ Years Trust, Craftsmanship
   ========================================================================= */
export function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <PageIntro
        eyebrow="Our Story & Heritage"
        title="Neighbourhood trust, refined over 35 years."
        action={
          <Button asChild variant="hero" size="default" className="rounded-full shadow-gold">
            <a href={SITE.directionsUrl} target="_blank" rel="noreferrer">
              <MapPin className="mr-1.5 h-4 w-4" /> Get Store Directions
            </a>
          </Button>
        }
      >
        Nayantara Opticals is an independent optical clinic and bespoke eyewear shop serving three generations of families across Uttam Nagar, Dwarka, Janakpuri, and West Delhi since 1990.
      </PageIntro>

      {/* Story Narrative & Stats */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
            <p className="eyebrow">Established in 1990</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold">
              Clarity without the hard sell.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              When Nayantara Opticals opened its doors in Uttam Nagar in 1990, our philosophy was simple: dispense eyewear that genuinely improves people's lives, explain clinical lens choices in honest everyday language, and never push products a customer does not need.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Over three decades later, while mega-chains have prioritized high-speed sales quotas, we remain family-owned, fiercely independent, and proud to have fitted spectacles for grandparents, parents, and grandchildren from the very same families.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-4 text-center sm:text-left">
                <p className="font-display text-3xl font-semibold text-primary">35+</p>
                <p className="mt-1 text-xs text-muted-foreground">Years in West Delhi</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-center sm:text-left">
                <p className="font-display text-3xl font-semibold text-primary">3</p>
                <p className="mt-1 text-xs text-muted-foreground">Generations Served</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-center sm:text-left">
                <p className="font-display text-3xl font-semibold text-primary">640+</p>
                <p className="mt-1 text-xs text-muted-foreground">4.8★ Verified Reviews</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-6 sm:p-8 shadow-soft">
            <div>
              <p className="eyebrow">Our Foundational Values</p>
              <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold">Why West Delhi chooses us</h3>
              <ul className="mt-5 space-y-4 text-xs sm:text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <strong className="text-foreground font-semibold">Transparent Pricing:</strong>
                    <p className="mt-0.5">Zero hidden fees on lens coatings, indices, or fittings. Every option is clearly priced and explained.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Users className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <strong className="text-foreground font-semibold">Unhurried Examinations:</strong>
                    <p className="mt-0.5">Dedicated 20-30 minute consultation windows so you never feel rushed during your eye test.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Glasses className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <strong className="text-foreground font-semibold">Bespoke Anatomical Fitting:</strong>
                    <p className="mt-0.5">Frames are curved, temple-shaped, and aligned on your actual facial structure before you walk out.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-background p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Visit our showroom</p>
                <p className="text-[11px] text-muted-foreground">{SITE.address}</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <a href={SITE.directionsUrl} target="_blank" rel="noreferrer">
                  Map View
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Store Technology & Equipment Highlights */}
      <section className="border-t border-border bg-aurora/40 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">State-of-the-Art Optical Laboratory</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold font-display">
              Where traditional craft meets modern diagnostic precision.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Every pair of glasses is custom edged and quality inspected in our in-house optical workshop using automated Japanese machinery.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">Diagnostic Tech</span>
              <h3 className="mt-2 text-base font-semibold">Automated Digital Refractor</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Japanese auto-keratometer for instantaneous, accurate corneal curvature and refractive power mapping.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">Measurement</span>
              <h3 className="mt-2 text-base font-semibold">Digital Pupillometry & Heights</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Exact optical center alignment down to 0.5mm precision for zero-distortion progressive corridors.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">Lab Edging</span>
              <h3 className="mt-2 text-base font-semibold">CNC Lens Pattern Edger</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Computerized 3D bevel edging that ensures flawless lens seating in acetate, titanium, and rimless frames.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase">Maintenance</span>
              <h3 className="mt-2 text-base font-semibold">Ultrasonic Clean & Alignment</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Deep acoustic cavitation cleaning and precision heating bath for bespoke acetate temple contouring.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   3. MYOPIA MANAGEMENT PAGE — Specialized Pediatric & Youth Eye Clinic
   ========================================================================= */
export function MyopiaPage() {
  const steps = [
    {
      num: "01",
      title: "Comprehensive Baseline & Biometry",
      copy: "We record axial length trends, corneal topography, family ocular history, screen habits, and current refractive error to establish a reliable benchmark.",
    },
    {
      num: "02",
      title: "Specialized Optical Defocus Dispensing",
      copy: "We fit clinically proven myopia control spectacle lenses (DIMS / HALT optical technology) or dual-focus daily lenses engineered to slow axial eye elongation.",
    },
    {
      num: "03",
      title: "Quarterly 3-Month Monitoring",
      copy: "Regular reviews every 3 to 6 months to compare progression velocity, verify lens centration, and tweak strategies before vision deteriorates.",
    },
  ];

  const interventions = [
    {
      title: "Defocus Spectacle Lenses",
      badge: "Non-Invasive",
      desc: "Lenses with a central clear vision zone surrounded by therapeutic defocus rings (e.g. Stellest / MiYOSMART style) that signal the eyeball to stop elongating.",
    },
    {
      title: "Dual-Focus Soft Contact Lenses",
      badge: "Active Kids",
      desc: "Daily disposable soft lenses with alternating correction and treatment zones. Ideal for children active in sports and outdoor activities.",
    },
    {
      title: "Orthokeratology (Ortho-K) Night Lenses",
      badge: "Overnight",
      desc: "Rigid gas-permeable lenses worn during sleep to gently reshape the cornea, giving crisp 20/20 daytime vision without daytime spectacles.",
    },
    {
      title: "Pediatric Lifestyle Guidance",
      badge: "Prevention",
      desc: "Personalized recommendations on the 20-20-20 rule, working distance, ambient lighting, and mandatory 90+ minutes of daily outdoor sunlight exposure.",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <PageIntro
        eyebrow="Pediatric & Youth Eye Care"
        title="Clinically structured myopia control for children."
        action={
          <Button asChild variant="hero" size="default" className="rounded-full shadow-gold">
            <Link to="/book">
              <HeartPulse className="mr-1.5 h-4 w-4" /> Book Myopia Consultation
            </Link>
          </Button>
        }
      >
        A clearer, scientifically proven clinical pathway to slow down progressive minus power in school-age children and teenagers, with documentation parents can understand and share with pediatricians.
      </PageIntro>

      {/* 3 Step Protocol */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="eyebrow">Our Clinical Protocol</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold font-display">
            How we protect your child's future eye health
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Higher myopia increases long-term risks of retinal tears, glaucoma, and macular degeneration. Early intervention makes all the difference.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/50">
              <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">{item.num}</span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Clinical Strategies */}
      <section className="border-t border-border bg-aurora/40 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="eyebrow">Evidence-Based Treatment Options</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold font-display">
                Four therapeutic strategies for changing prescriptions
              </h2>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary w-fit">
              Clinical Grade
            </Badge>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {interventions.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <Badge variant="secondary" className="text-[10px] font-semibold tracking-wider uppercase mb-3">
                  {item.badge}
                </Badge>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-semibold">Has your child's glass power changed recently?</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Book a specialized 30-minute pediatric refraction and myopia assessment at our Uttam Nagar clinic.</p>
            </div>
            <Button asChild variant="hero" size="default" className="shrink-0">
              <Link to="/book">Schedule Myopia Check</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   4. LENS STUDIO PAGE — Comprehensive Lens Portfolio, Coatings & Indices
   ========================================================================= */
export function LensesPage() {
  const lensPortfolios = [
    {
      id: "single-vision",
      name: "Single Vision HD",
      price: "Included with Frame",
      badge: "Everyday Standard",
      ideal: "Distance-only or reading-only users",
      features: ["Crisp edge-to-edge spherical correction", "Hard scratch-resistant coating", "Lightweight impact-resistant resin"],
    },
    {
      id: "blue-cut",
      name: "Digital Blue Shield 420",
      price: "+ ₹1,200",
      badge: "Screen Workers",
      ideal: "IT professionals, students, 6+ hrs screen time",
      features: ["Blocks 420nm high-energy blue-violet light", "Anti-fatigue contrast enhancement", "Super-hydrophobic smudge repellent"],
    },
    {
      id: "drive-safe",
      name: "DriveSafe Night Anti-Glare",
      price: "+ ₹1,800",
      badge: "Night Driving",
      ideal: "Commuters, night drivers, glare sensitivity",
      features: ["Reduces oncoming LED headlight reflections by 64%", "Optimized luminance transmission", "Water and dust repellent oleophobic coat"],
    },
    {
      id: "progressive-hd",
      name: "Freeform HD Progressive",
      price: "+ ₹3,500",
      badge: "Top Recommendation",
      ideal: "Presbyopes (40+ yrs) needing reading + distance",
      features: ["No visible divider line across lens", "Wide digital reading and intermediate corridors", "Instant adaptation guarantee within 30 days"],
    },
    {
      id: "photochromic",
      name: "Smart-Sun Photochromic",
      price: "+ ₹2,400",
      badge: "2-in-1 Adaptive",
      ideal: "Indoor-outdoor active lifestyles",
      features: ["Crystal clear indoors, deep tint in sunlight", "100% UV400 full-spectrum protection", "Rapid transition reaction within 30 seconds"],
    },
    {
      id: "ultra-thin",
      name: "1.67 / 1.74 Ultra-Thin Index",
      price: "+ ₹3,200",
      badge: "High Power Specialist",
      ideal: "Spherical power > -4.00 or high cylindrical power",
      features: ["Up to 45% thinner and lighter than standard 1.50", "Aspheric flatter curve to prevent eye shrinkage look", "High tensile strength for rimless & semi-rimless"],
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <PageIntro
        eyebrow="Lens Studio & Optical Physics"
        title="Precision lenses tailored to your visual lifestyle."
        action={
          <Button asChild variant="hero" size="default" className="rounded-full shadow-gold">
            <Link to="/prescription">
              <Upload className="mr-1.5 h-4 w-4" /> Upload Prescription
            </Link>
          </Button>
        }
      >
        Compare transparent, certified lens packages from world-leading optical labs. Every lens is measured and edged with sub-millimeter digital centration in store.
      </PageIntro>

      {/* 6 Lens Packages Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lensPortfolios.map((lens) => (
            <article
              key={lens.id}
              className="card-3d flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant={lens.badge === "Top Recommendation" ? "default" : "secondary"} className="text-[10.5px]">
                    {lens.badge}
                  </Badge>
                  <span className="font-display text-sm font-semibold text-primary">{lens.price}</span>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-foreground">{lens.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground"><strong>Ideal for:</strong> {lens.ideal}</p>

                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {lens.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-border/70 pt-4 flex items-center justify-between">
                <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                  <Link to="/prescription">Choose this lens</Link>
                </Button>
                <a
                  href={waLink(`Hi Nayantara Opticals, I want details about ${lens.name}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Lens Index & Thickness Guide */}
      <section className="border-t border-border bg-aurora/40 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="eyebrow">Optical Thickness & Index Guide</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold font-display">
              Choosing the right index for your power
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A higher index bends light more efficiently, allowing lenses to be thinner, lighter, and cosmetically more appealing.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="font-display text-xl font-bold text-primary">1.50 Index</span>
              <h3 className="mt-1 text-sm font-semibold">Standard Thickness</h3>
              <p className="mt-1 text-xs text-muted-foreground">Best for powers between 0.00 to -2.00 D. Full-rim acetate frames.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="font-display text-xl font-bold text-primary">1.56 Mid-Index</span>
              <h3 className="mt-1 text-sm font-semibold">Slim & Lightweight</h3>
              <p className="mt-1 text-xs text-muted-foreground">15% thinner than standard. Great for powers from -2.00 to -4.00 D.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="font-display text-xl font-bold text-primary">1.60 Hi-Index</span>
              <h3 className="mt-1 text-sm font-semibold">High Strength Resin</h3>
              <p className="mt-1 text-xs text-muted-foreground">30% thinner. Mandatory for semi-rimless and rimless drill mounts.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="font-display text-xl font-bold text-primary">1.67 / 1.74 Razor</span>
              <h3 className="mt-1 text-sm font-semibold">Ultra Featherweight</h3>
              <p className="mt-1 text-xs text-muted-foreground">Up to 45% thinner. Essential for high minus (-4.50+) and high plus powers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   5. FORM PAGE — Book Eye Check, Upload Prescription, Contact Us
   ========================================================================= */
type BookFields = "name" | "phone" | "email" | "age" | "date" | "note";

export function FormPage({ kind }: { kind: "book" | "prescription" | "contact" }) {
  const { user, isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<BookFields, string>>({
    name: "",
    phone: "",
    email: "",
    age: "",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0] ?? "",
    note: "",
  });

  // Prefill authenticated user contact info
  useEffect(() => {
    if (user) {
      setValues((prev) => ({
        ...prev,
        name: prev.name || user.customerProfile?.fullName || user.ownerProfile?.fullName || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);
  const [errors, setErrors] = useState<Partial<Record<BookFields, string>>>({});
  const [consultationType, setConsultationType] = useState<
    "EYE_TEST" | "LENS_CONSULTATION" | "FRAME_CONSULTATION" | "CONTACT_LENS_CONSULTATION"
  >("EYE_TEST");

  const DEFAULT_SLOTS = [
    "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
    "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM",
    "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
    "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
  ];
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState("11:30 AM");
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookedData, setBookedData] = useState<{
    id: string;
    appointmentDate: string;
    timeSlot: string;
    type: string;
    status: string;
  } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Sync query params (e.g. ?type=myopia)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("type") === "myopia" || window.location.pathname.includes("myopia")) {
        setConsultationType("LENS_CONSULTATION");
        setValues((v) => ({ ...v, note: v.note || "Pediatric Myopia Assessment & Optical Management" }));
      }
    }
  }, []);

  // Fetch available slots when appointment date changes
  useEffect(() => {
    if (kind === "book" && values.date) {
      apiRequest<{ availableSlots: string[] }>(`/appointments/slots?date=${values.date}`).then((res) => {
        if (res.success && res.data?.availableSlots?.length) {
          setAvailableSlots(res.data.availableSlots);
          if (res.data.availableSlots[0] && !res.data.availableSlots.includes(selectedSlot)) {
            setSelectedSlot(res.data.availableSlots[0]);
          }
        }
      });
    }
  }, [values.date, kind]);

  const clearFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) return;

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    const ext = next.name.split(".").pop()?.toLowerCase();
    const isAllowedExt = ext && ["jpg", "jpeg", "png", "pdf"].includes(ext);

    if (!allowedMimeTypes.includes(next.type.toLowerCase()) && !isAllowedExt) {
      toast.error("Invalid file format. Only JPEG (.jpg, .jpeg), PNG (.png), and PDF (.pdf) files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (next.size > 10 * 1024 * 1024) {
      toast.error(`File size (${(next.size / (1024 * 1024)).toFixed(2)} MB) exceeds 10 MB limit. Please choose a smaller file.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(next);
    setFilePreview(next.type.startsWith("image/") ? URL.createObjectURL(next) : null);
    toast.success(`Prescription document attached (${(next.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  const copy =
    kind === "book"
      ? {
          eyebrow: "Appointments & Consultations",
          title: "Book an unhurried eye check.",
          button: "Confirm Appointment Slot",
        }
      : kind === "prescription"
        ? {
            eyebrow: "Optical Prescription Vault",
            title: "Upload or submit your prescription.",
            button: "Submit Prescription Details",
          }
        : {
            eyebrow: "Visit Our Showroom",
            title: "We’re here in Uttam Nagar, New Delhi.",
            button: "Send In-Store Enquiry",
          };

  const set = (field: BookFields, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateBooking = () => {
    const next: Partial<Record<BookFields, string>> = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    const digits = values.phone.replace(/\D/g, "");
    if (!values.phone.trim()) next.phone = "Please enter your mobile number.";
    else if (digits.length < 10) next.phone = "Enter a valid 10-digit mobile number.";
    if (kind === "book") {
      const age = Number(values.age);
      if (!values.age.trim()) next.age = "Please enter patient age.";
      else if (!Number.isFinite(age) || age < 1 || age > 120) next.age = "Enter a valid age.";
      if (!values.date.trim()) next.date = "Please select a preferred date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const fieldError = (field: BookFields) =>
    errors[field] ? (
      <span id={`${field}-error`} role="alert" className="text-xs text-destructive">
        {errors[field]}
      </span>
    ) : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if ((kind === "book" || kind === "prescription") && !isAuthenticated) {
      toast.error("Please sign in or create an account to proceed.");
      return;
    }
    if (!validateBooking()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!consentGiven) {
      toast.error("Please acknowledge the consent checkbox to submit your request.");
      return;
    }

    if (kind === "book") {
      setIsBookingLoading(true);
      try {
        const payload = {
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email?.trim() || undefined,
          patientAge: values.age ? Number(values.age) : undefined,
          appointmentDate: values.date,
          timeSlot: selectedSlot || "11:30 AM",
          type: consultationType,
          notes: values.note.trim() || undefined,
        };

        const res = await apiRequest<{
          id: string;
          appointmentDate: string;
          timeSlot: string;
          type: string;
          status: string;
        }>("/appointments", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (res.success && res.data) {
          setBookedData(res.data);
          setSubmitted(true);
          toast.success("Appointment slot reserved and recorded in clinic database!");
        } else {
          toast.error(res.message || "Failed to book appointment. Please try another slot.");
        }
      } catch {
        toast.error("An error occurred while booking. Please try again.");
      } finally {
        setIsBookingLoading(false);
      }
      return;
    }

    if (kind === "prescription") {
      setIsBookingLoading(true);
      try {
        if (!file) {
          toast.error("Please attach a prescription photo or PDF file (up to 10MB).");
          setIsBookingLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", values.name.trim());
        formData.append("phone", values.phone.trim());
        if (values.email?.trim()) formData.append("email", values.email.trim());
        if (values.note?.trim()) formData.append("notes", values.note.trim());

        const res = await apiRequest<{
          id: string;
          appointmentDate?: string;
          timeSlot?: string;
          type: string;
          status?: string;
        }>("/prescriptions/upload", {
          method: "POST",
          body: formData,
        });

        if (res.success && res.data) {
          setBookedData(res.data as any);
          setSubmitted(true);
          toast.success("Prescription securely saved to clinic database & Supabase vault!");
        } else {
          toast.error(res.message || "Failed to upload prescription. Please try again.");
        }
      } catch {
        toast.error("An error occurred while uploading. Please check your network and try again.");
      } finally {
        setIsBookingLoading(false);
      }
      return;
    }

    setSubmitted(true);
    toast.success("Consultation request recorded! We will confirm via WhatsApp.");
  };

  return (
    <div className="bg-background text-foreground">
      <PageIntro eyebrow={copy.eyebrow} title={copy.title}>
        {kind === "prescription"
          ? "Upload your optical prescription photo or enter OD/OS values manually. Our optometrists will verify your lens parameters before dispensing."
          : "Reserve an unhurried 20-30 minute consultation slot with our certified optometrists in Uttam Nagar, New Delhi."}
      </PageIntro>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Main Form Area */}
          <div>
            {submitted ? (
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-8 text-center sm:text-left space-y-5 animate-in fade-in-50 duration-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                      {kind === "prescription" ? "Saved in Supabase Vault" : "Confirmed in Database"}
                    </Badge>
                    <h2 className="font-display text-2xl font-bold mt-0.5">
                      {kind === "prescription" ? "Prescription Successfully Saved!" : "Appointment Confirmed!"}
                    </h2>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 space-y-3 text-sm">
                  {bookedData?.id && (
                    <div className="flex justify-between items-center pb-2 border-b border-border/50 text-xs">
                      <span className="text-muted-foreground font-mono">Reference No.</span>
                      <strong className="font-mono text-primary">{bookedData.id.slice(0, 8).toUpperCase()}</strong>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Patient</span>
                      <strong className="text-foreground">{values.name || "Customer"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Mobile</span>
                      <strong className="text-foreground">{values.phone}</strong>
                    </div>
                    {kind === "prescription" ? (
                      file && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground block">Attached Prescription</span>
                          <strong className="text-primary truncate block font-mono">
                            📄 {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </strong>
                        </div>
                      )
                    ) : (
                      <>
                        <div>
                          <span className="text-muted-foreground block">Scheduled Date</span>
                          <strong className="text-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" /> {values.date || "Today"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Time Slot</span>
                          <strong className="text-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" /> {selectedSlot}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                  {kind === "prescription" ? (
                    <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      Your prescription has been securely synced with Nayantara Opticals. Store optometrists and admin can now verify your lens parameters.
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-border/50 text-xs">
                      <span className="text-muted-foreground block">Consultation Type</span>
                      <strong className="text-primary font-medium">
                        {consultationType === "LENS_CONSULTATION"
                          ? "Pediatric Myopia & Specialized Lens Consultation"
                          : consultationType === "FRAME_CONSULTATION"
                            ? "Bespoke Frame Styling & Fitting"
                            : consultationType === "CONTACT_LENS_CONSULTATION"
                              ? "Contact Lens Trial & Fitting"
                              : "Comprehensive Computer-Assisted Eye Test"}
                      </strong>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your appointment has been securely confirmed and recorded in our clinic schedule. Our senior optometrist at Uttam Nagar will have your consultation slot reserved for you.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild variant="hero" size="default">
                    <Link to="/shop">
                      <Glasses className="mr-1.5 h-4 w-4" /> Explore Eyewear Collection
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="default">
                    <Link to="/contact">
                      <MapPin className="mr-1.5 h-4 w-4" /> Store Directions (Pillar 703)
                    </Link>
                  </Button>
                  <Button variant="ghost" size="default" onClick={() => setSubmitted(false)}>
                    Book Another Slot
                  </Button>
                </div>
              </div>
            ) : (kind === "book" || kind === "prescription") && !isAuthenticated ? (
              <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                      Account Required
                    </Badge>
                    <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl text-foreground">
                      {kind === "book" ? "Sign in to book your consultation" : "Sign in to upload your prescription"}
                    </h2>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {kind === "book"
                    ? "To reserve your personalized clinical eye checkup slot and link appointments to your digital patient record, please sign in or create an account."
                    : "Your optical prescription files are encrypted and securely vaulted in Supabase Storage. Please sign in or create an account so our optometrists can verify your prescription and link it to your profile."}
                </p>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Benefits of signing in</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{kind === "book" ? "Direct appointment tracking & live slot management from your personal dashboard." : "Permanent, encrypted cloud vault of your vision test documents & PDFs."}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>Direct prescription verification and lens recommendations from certified optometrists.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>Receive WhatsApp & SMS consultation reminders and ready-for-pickup notifications.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button asChild variant="hero" size="lg" className="rounded-xl shadow-gold w-full sm:w-auto">
                    <a href={`/login?redirect=${kind === "prescription" ? "/prescription" : "/book"}`}>
                      <LogIn className="mr-2 h-4 w-4" /> Sign In to Proceed
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-xl w-full sm:w-auto">
                    <a href={`/login?tab=register&redirect=${kind === "prescription" ? "/prescription" : "/book"}`}>
                      <UserPlus className="mr-2 h-4 w-4" /> Create New Account
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
                {/* Authenticated User Status */}
                {(kind === "book" || kind === "prescription") && (
                  <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary shrink-0" />
                      <span>Logged in as <strong className="text-foreground">{user?.customerProfile?.fullName || user?.ownerProfile?.fullName || user?.email || user?.phone || "Customer"}</strong></span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">Verified Patient</Badge>
                  </div>
                )}
                
                {/* Consultation Type Selector */}
                {kind === "book" && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground">Select Consultation Type <span className="text-xs text-primary">*</span></span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setConsultationType("EYE_TEST")}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          consultationType === "EYE_TEST"
                            ? "border-primary bg-primary/10 ring-1 ring-primary font-medium"
                            : "border-border hover:border-primary/40 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Stethoscope className="h-3.5 w-3.5 text-primary" /> Comprehensive Eye Test
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Computer autorefraction & vision testing</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsultationType("LENS_CONSULTATION")}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          consultationType === "LENS_CONSULTATION"
                            ? "border-primary bg-primary/10 ring-1 ring-primary font-medium"
                            : "border-border hover:border-primary/40 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-foreground">
                          <span className="flex items-center gap-1.5">
                            <HeartPulse className="h-3.5 w-3.5 text-primary" /> Myopia Care & Lenses
                          </span>
                          <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                            Child Care
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Pediatric myopia & control lenses (HALT/DIMS)</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsultationType("FRAME_CONSULTATION")}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          consultationType === "FRAME_CONSULTATION"
                            ? "border-primary bg-primary/10 ring-1 ring-primary font-medium"
                            : "border-border hover:border-primary/40 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Glasses className="h-3.5 w-3.5 text-primary" /> Frame Styling & Fit
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Face shape analysis & titanium/acetate frames</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsultationType("CONTACT_LENS_CONSULTATION")}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          consultationType === "CONTACT_LENS_CONSULTATION"
                            ? "border-primary bg-primary/10 ring-1 ring-primary font-medium"
                            : "border-border hover:border-primary/40 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Eye className="h-3.5 w-3.5 text-primary" /> Contact Lens Trial
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Trial lenses, corneal fitting & hygiene advice</p>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium">
                    <span>Full Name <span className="text-xs text-primary">*</span></span>
                    <Input
                      value={values.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Priyanshu Sharma"
                      aria-invalid={!!errors.name}
                    />
                    {fieldError("name")}
                  </label>

                  <label className="grid gap-1.5 text-sm font-medium">
                    <span>Mobile Number <span className="text-xs text-primary">*</span></span>
                    <Input
                      value={values.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      type="tel"
                      placeholder="10-digit mobile number"
                      aria-invalid={!!errors.phone}
                    />
                    {fieldError("phone")}
                  </label>
                </div>

                {kind === "book" ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-sm font-medium">
                        <span>Patient Age <span className="text-xs text-primary">*</span></span>
                        <Input
                          value={values.age}
                          onChange={(e) => set("age", e.target.value)}
                          type="number"
                          placeholder="Age in years"
                          min={1}
                          max={120}
                        />
                        {fieldError("age")}
                      </label>

                      <label className="grid gap-1.5 text-sm font-medium">
                        <span>Email Address (Optional)</span>
                        <Input
                          value={values.email}
                          onChange={(e) => set("email", e.target.value)}
                          type="email"
                          placeholder="For appointment calendar reminder"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="grid gap-1.5 text-sm font-medium">
                        <span>Preferred Appointment Date <span className="text-xs text-primary">*</span></span>
                        <Input
                          value={values.date}
                          onChange={(e) => set("date", e.target.value)}
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                        />
                        {fieldError("date")}
                      </label>
                    </div>

                    {/* Interactive Slot Picker */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" /> Choose Time Slot <span className="text-xs text-primary">*</span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">30-minute dedicated consultation</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-1 text-center rounded-lg text-xs transition-all border ${
                              selectedSlot === slot
                                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                                : "bg-muted/30 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {kind === "prescription" ? (
                  <div className="space-y-4 border-y border-border py-4">
                    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
                      <Upload className="h-6 w-6 text-primary mx-auto" />
                      <p className="mt-2 text-sm font-semibold">Upload Prescription Photo / PDF</p>
                      <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, PDF up to 10 MB</p>
                      {file ? (
                        <div className="mt-3 flex items-center justify-center gap-3">
                          <span className="text-xs font-semibold text-primary">{file.name}</span>
                          <Button type="button" size="sm" variant="ghost" onClick={clearFile}>
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => fileInputRef.current?.click()}>
                          Choose File
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={"image/*,application/pdf"}
                        className="sr-only"
                        onChange={onFileChange}
                      />
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground uppercase">Or enter optical powers manually (Optional):</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="grid gap-1 text-xs font-medium">
                        Right Eye (OD) SPH / CYL / AXIS
                        <Input placeholder="e.g. -2.50 / -0.75 x 90" className="h-8 text-xs" />
                      </label>
                      <label className="grid gap-1 text-xs font-medium">
                        Left Eye (OS) SPH / CYL / AXIS
                        <Input placeholder="e.g. -2.25 / -0.50 x 85" className="h-8 text-xs" />
                      </label>
                    </div>
                  </div>
                ) : null}

                <label className="grid gap-1.5 text-sm font-medium">
                  <span>Additional Notes or Specific Eye Concerns</span>
                  <Textarea
                    rows={3}
                    value={values.note}
                    onChange={(e) => set("note", e.target.value)}
                    placeholder="e.g. Frequent screen eye strain, previous progressive wearer, frame repair request..."
                  />
                </label>

                <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    id="formConsent"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="formConsent" className="leading-relaxed cursor-pointer select-none">
                    I consent to Nayantara Opticals storing my contact details and optical parameters to confirm my appointment, maintain clinical records, and send updates via WhatsApp/SMS in accordance with the{" "}
                    <Link to="/privacy" target="_blank" className="font-semibold text-primary underline hover:text-primary/80">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link to="/terms" target="_blank" className="font-semibold text-primary underline hover:text-primary/80">
                      Terms
                    </Link>
                    .
                  </label>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full shadow-gold" disabled={isBookingLoading}>
                  {isBookingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reserving Slot in Clinic Database...
                    </>
                  ) : (
                    copy.button
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Store Location & Hours Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Store Location</h3>
                  <p className="text-xs text-muted-foreground">Uttam Nagar, New Delhi</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{SITE.address}</p>

              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Clinic & Store Timings</p>
                <div className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
                  {SITE.hours.map((row) => (
                    <div key={row.day} className="flex justify-between">
                      <strong className="text-foreground">{row.day}:</strong>
                      <span>{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <a href={SITE.directionsUrl} target="_blank" rel="noreferrer">
                    <MapPin className="mr-1.5 h-3.5 w-3.5" /> Directions
                  </a>
                </Button>
                <Button asChild variant="quiet" size="sm" className="rounded-full border-border">
                  <a href={`tel:${SITE.phone}`}>
                    <Phone className="mr-1.5 h-3.5 w-3.5" /> Call Store
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <ShieldCheck className="h-4 w-4" /> 100% Privacy Protection
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Your medical prescription and phone number are strictly used for your optical appointment and lens dispensing. We never share patient records with third parties.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. CART PAGE — Bag & Reservation Summary
   ========================================================================= */
export function CartPage() {
  return (
    <div className="bg-background text-foreground">
      <PageIntro
        eyebrow="Your Shopping Bag & In-Store Reservations"
        title="Reserve frames for expert fitting."
      >
        Your selected frames and optical packages are stored on your device. Review your choices and reserve them for a dedicated fitting session in store.
      </PageIntro>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <Glasses className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Explore our curated catalog</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
            Browse our latest handcrafted acetate frames, ultra-light titanium glasses, and precision lens packages.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="hero" size="default">
              <Link to="/shop">Browse Eyewear Catalog</Link>
            </Button>
            <Button asChild variant="outline" size="default">
              <Link to="/book">Book In-Store Eye Test</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}