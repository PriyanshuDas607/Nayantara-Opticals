import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  FileText,
  RefreshCw,
  Cookie,
  Lock,
  Eye,
  Glasses,
  Scale,
  Building,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Clock,
  HelpCircle,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

const LAST_UPDATED = "October 2026";

function LegalHeader({
  badge,
  title,
  subtitle,
  icon: Icon,
}: {
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className="border-b border-border bg-aurora">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Icon className="h-3.5 w-3.5" />
            {badge}
          </span>
          <span className="text-xs font-medium text-muted-foreground">Last updated: {LAST_UPDATED}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3 border-b border-border/60 pb-8 last:border-b-0">
      <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/* =========================================================================
   1. PRIVACY POLICY PAGE
   ========================================================================= */
export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalHeader
        badge="Data Protection & DPDP Act 2023"
        title="Privacy Policy"
        subtitle="How Nayantara Opticals collects, protects, and strictly handles your personal contact details and medical optical prescriptions."
        icon={ShieldCheck}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Our Medical Data Commitment
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Nayantara Opticals is an independent optical clinic and eyewear boutique operating in Uttam Nagar, New Delhi since 1990. We treat your eye test measurements and doctor prescriptions with strict patient confidentiality. We never sell, monetize, or disclose your clinical or personal records to advertising brokers.
              </p>
            </div>

            <LegalSection title="1. Information We Collect">
              <p>
                When you interact with our website, book an eye checkup, or order eyewear, we collect the following categories of information:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-foreground">Identity & Contact Details:</strong> Full name, email address, mobile phone number, delivery address, and state/pincode.
                </li>
                <li>
                  <strong className="text-foreground">Optical & Clinical Prescription Data:</strong> Spherical (SPH), Cylindrical (CYL), Axis, Addition (ADD), Pupillary Distance (PD), lens recommendations, doctor consultation notes, and uploaded prescription files (JPG, PNG, PDF).
                </li>
                <li>
                  <strong className="text-foreground">Transaction & Payment Identifiers:</strong> Item selections, frame specifications, payment method (COD or Razorpay), and payment gateway references (Razorpay Order ID and Payment ID). <em>Note: Sensitive card numbers and UPI MPINs are handled directly by Razorpay and never touch our servers.</em>
                </li>
                <li>
                  <strong className="text-foreground">Technical Telemetry & Session Data:</strong> Aggregated dwell time, browser type, device information, and active visible presence telemetry used exclusively for system health and service optimization.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="2. Purpose & Legal Basis for Processing">
              <p>Under the Digital Personal Data Protection Act, 2023 (DPDP Act), we process your data strictly for legitimate clinical and commercial purposes:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Clinic Consultations
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confirming appointment slots, autorefraction tests, and myopia management consultations.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Custom Lens Surfacing
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Custom manufacturing and precise laboratory edge cutting of lenses matching your prescription.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Order Fulfillment
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Generating invoices, dispatching ready spectacles, and sending status updates via SMS/WhatsApp.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Account & 2FA Security
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Securing your account, administrative access, and verified order history.
                  </p>
                </div>
              </div>
            </LegalSection>

            <LegalSection title="3. Third-Party Service Providers & Embeds">
              <p>We work with trusted third-party service providers solely to deliver platform functionality:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-foreground">Razorpay:</strong> Secure payment processing and webhook notifications. Razorpay is RBI-compliant and PCI-DSS Level 1 certified.
                </li>
                <li>
                  <strong className="text-foreground">Google Identity Services (GSI):</strong> Optional one-click Google Sign-In authentication.
                </li>
                <li>
                  <strong className="text-foreground">Google Maps Embed:</strong> Embedded store locator map on our homepage and contact page. Loaded with lazy execution to protect visitor privacy.
                </li>
                <li>
                  <strong className="text-foreground">WhatsApp Business API:</strong> Used for optional automated appointment alerts and customer support chat when you choose to connect.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="4. Data Retention & Security Measures">
              <p>
                All account and prescription records are stored in encrypted databases with role-based access control. Admin and store owner consoles are protected by mandatory Two-Factor Authentication (2FA). We retain prescription records for a clinical continuity period of up to 5 years, allowing customers to easily re-order or review historical vision changes.
              </p>
            </LegalSection>

            <LegalSection title="5. Your Rights as a Data Principal">
              <p>Under Indian data protection laws, you retain complete authority over your personal information:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Right to access and review your stored optical records and orders.</li>
                <li>Right to request immediate correction or update of incorrect prescription details.</li>
                <li>Right to request account deletion and removal of stored medical uploads.</li>
                <li>Right to withdraw consent for non-essential notifications at any time from your Account Settings.</li>
              </ul>
            </LegalSection>

            <LegalSection title="6. Grievance Redressal Officer">
              <p>
                If you have questions, concerns, or requests regarding your data, contact our designated Grievance Officer:
              </p>
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 text-sm">
                <p className="font-semibold text-foreground">Grievance & Privacy Officer — Nayantara Opticals</p>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {SITE.address}
                </p>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" /> {SITE.phone}
                </p>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> {SITE.email}
                </p>
              </div>
            </LegalSection>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-semibold text-sm text-foreground">Legal Quick Links</h3>
              <div className="mt-3 grid gap-2 text-xs">
                <Link to="/terms" className="text-primary hover:underline">Terms & Conditions →</Link>
                <Link to="/refund" className="text-primary hover:underline">Refund & Replacement →</Link>
                <Link to="/cookies" className="text-primary hover:underline">Cookie Policy →</Link>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact & Support</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-5 text-xs text-muted-foreground">
              <Building className="h-4 w-4 text-primary mb-2" />
              <p className="font-semibold text-foreground">In-Store Verification</p>
              <p className="mt-1">
                You can also request a printed physical copy of your stored optical card by visiting our Uttam Nagar showroom.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. TERMS AND CONDITIONS PAGE
   ========================================================================= */
export function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalHeader
        badge="Legal Agreement"
        title="Terms & Conditions"
        subtitle="Governing your use of the Nayantara Opticals website, clinical appointment bookings, and eyewear purchases."
        icon={FileText}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div className="space-y-8">
            <LegalSection title="1. Agreement to Terms">
              <p>
                By browsing, registering an account, booking an optical appointment, or ordering products on Nayantara Opticals (the &quot;Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </LegalSection>

            <LegalSection title="2. Clinical Consultations & Eye Tests">
              <p>
                Our store provides computerized autorefraction, subjective trial frame testing, and optical consultations performed by qualified optical practitioners:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-foreground">Appointment Confirmations:</strong> Submitting an appointment request reserves a preferred time window. Final clinical confirmation is communicated via WhatsApp/SMS or direct phone call.
                </li>
                <li>
                  <strong className="text-foreground">Non-Emergency Scope:</strong> Optometric eye tests performed in-store assess refractive error, binocular vision, and lens recommendations. They do not substitute comprehensive ophthalmological surgeries or medical triage for ocular trauma.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="3. Prescription Accuracy & Custom Surfacing">
              <p>
                Lenses are customized precision medical devices made according to the optical power values supplied:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  If you upload a prescription or provide manual optical values, you certify that the prescription is current (typically within the last 12 months) and prescribed by a certified ophthalmologist or optometrist.
                </li>
                <li>
                  Nayantara Opticals is not liable for vision fatigue or discomfort resulting from customer-submitted prescription inaccuracies. However, we provide an in-store <strong>Power Adaptation & Accuracy Verification</strong> within 15 days of delivery.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="4. Pricing, Orders & Payments">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>All prices listed on the Platform are in Indian Rupees (₹ INR) and inclusive of applicable GST.</li>
                <li>We accept payments through Cash on Delivery (COD) and online modes via Razorpay (UPI, Credit/Debit Cards, Net Banking).</li>
                <li>We reserve the right to cancel or decline an order in the event of unforeseen inventory shortages, incorrect optical parameters, or non-verifiable delivery addresses.</li>
              </ul>
            </LegalSection>

            <LegalSection title="5. Product Warranty & Care Guidelines">
              <p>
                All designer frames and premium spectacle lenses sold by Nayantara Opticals carry manufacturer warranty against manufacturing defects:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>1-Year manufacturer warranty on frame joints, spring hinges, and solder points.</li>
                <li>Anti-reflective coating (ARC) peeling warranty as per the selected lens brand specification.</li>
                <li>Accidental physical breakage, scratches from abrasive cloth wipes, and thermal damage are excluded from warranty.</li>
              </ul>
            </LegalSection>

            <LegalSection title="6. User Accounts & Platform Security">
              <p>
                You are responsible for maintaining the confidentiality of your login credentials. You agree not to attempt unauthorized access to platform administration, scrape product data, or bypass 2FA authentication controls.
              </p>
            </LegalSection>

            <LegalSection title="7. Governing Law & Jurisdiction">
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
              </p>
            </LegalSection>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-semibold text-sm text-foreground">Need Clarification?</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Our opticians are available 6 days a week to clarify any optical warranty or order terms.
              </p>
              <div className="mt-4">
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. REFUND & RETURN POLICY PAGE
   ========================================================================= */
export function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalHeader
        badge="Consumer Protection & Returns"
        title="Refund & Replacement Policy"
        subtitle="Transparent policies on eyewear returns, optical lens adaptation, cancellations, and Razorpay refunds."
        icon={RefreshCw}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-5 w-5" /> 100% Eyewear Satisfaction Guarantee
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                We take immense pride in precision lens glazing and frame fitting. If your spectacles do not feel comfortable or if you notice any manufacturing discrepancy, we are committed to making it right immediately.
              </p>
            </div>

            <LegalSection title="1. Ready-to-Wear Frames & Sunglasses (Non-Prescription)">
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">7-Day Hassle-Free Exchange & Return</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Eligible</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Frames and non-powered sunglasses can be exchanged or returned within <strong>7 days of delivery</strong>, provided they are in unused condition, accompanied by the original case, micro-fiber cloth, warranty card, and receipt tags.
                </p>
              </div>
            </LegalSection>

            <LegalSection title="2. Custom Prescription Lenses Policy">
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">Custom Glazed Power Lenses</span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">Power Remake Guarantee</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Because optical lenses (single vision, blue-cut, bifocal, and progressive) are custom cut and surfaced to your unique interpupillary distance and optical prescription, they cannot be resold or refunded once cut.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Our Lens Adaptation Guarantee:</strong> If our in-house optometrist tested your eyes and you experience difficulty adapting to progressive or high-index lenses within <strong>15 days</strong>, we will re-examine your vision and remake your lenses free of charge.
                </p>
              </div>
            </LegalSection>

            <LegalSection title="3. Order Cancellations">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-foreground">Before Lens Glazing:</strong> You may cancel frame orders within <strong>12 hours</strong> of placement before the lenses enter the optical edging laboratory. A full 100% refund will be issued.
                </li>
                <li>
                  <strong className="text-foreground">After Lens Glazing:</strong> If cancellation is requested after lenses have been cut, the frame value is refundable, but a nominal lens laboratory cost deduction applies.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="4. Damaged or Defective Items in Transit">
              <p>
                In the rare event that your spectacles arrive with a cracked lens, chipped acetate, or bent temple, please notify us within <strong>48 hours of delivery</strong> via WhatsApp or email with a clear photo. We will arrange a free reverse pickup and courier an expedited replacement.
              </p>
            </LegalSection>

            <LegalSection title="5. Refund Modes & Timelines">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-semibold text-foreground">
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Refund Destination</th>
                      <th className="p-3">Expected Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-muted-foreground">
                    <tr>
                      <td className="p-3 font-medium text-foreground">UPI / Razorpay Online</td>
                      <td className="p-3">Original Bank Account / VPA</td>
                      <td className="p-3">3 to 5 business days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Credit / Debit Card</td>
                      <td className="p-3">Original Card Account</td>
                      <td className="p-3">5 to 7 business days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Cash on Delivery (COD)</td>
                      <td className="p-3">NEFT / UPI Transfer or Store Credit</td>
                      <td className="p-3">2 to 3 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </LegalSection>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-semibold text-sm text-foreground">Initiate a Return</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                To request an exchange or lens review, send your order number to our Uttam Nagar team on WhatsApp.
              </p>
              <div className="mt-4">
                <Button asChild size="sm" variant="hero" className="w-full">
                  <a href={`https://wa.me/919876543210?text=${encodeURIComponent("Hello Nayantara Opticals, I need assistance with an exchange or return.")}`} target="_blank" rel="noreferrer">
                    WhatsApp Return Desk
                  </a>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. COOKIE POLICY PAGE
   ========================================================================= */
export function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalHeader
        badge="Tracking & Storage Transparency"
        title="Cookie & Storage Policy"
        subtitle="Complete details on how Nayantara Opticals uses local browser storage and cookies to maintain your shopping cart, login security, and site functionality."
        icon={Cookie}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div className="space-y-8">
            <LegalSection title="1. What Are Cookies & Local Storage?">
              <p>
                Cookies and local storage are small text files or key-value data stored on your device when you visit websites. They enable the website to remember your preferences (such as your shopping cart, chosen frame colors, and login state) so you do not have to re-enter them on every visit.
              </p>
            </LegalSection>

            <LegalSection title="2. Categories of Storage We Use">
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">A. Strictly Necessary & Functional</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Always Active</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Essential for the site to function properly. Includes session tokens for authenticating your customer or store manager account, 2FA security tokens, the <code className="rounded bg-muted px-1 py-0.5">sidebar_state</code> cookie, and cart state so your chosen eyewear remains in your bag.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">B. User Preferences & Wishlist</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Functional</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Remembers your saved frame bookmarks (wishlist), dark/light mode appearance, and cookie consent choices across page reloads.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">C. Performance & Telemetry</span>
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">Internal Only</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Measures aggregated page dwell time and client error logs. Used solely by our internal system health monitoring to diagnose crashes and optimize page load speeds. <em>Never shared with external advertisers.</em>
                  </p>
                </div>
              </div>
            </LegalSection>

            <LegalSection title="3. Third-Party Embeds & Cookies">
              <p>Certain integrated features may set third-party cookies when interacted with:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-foreground">Google Identity Services:</strong> If you use the &quot;Sign in with Google&quot; button, Google sets authentication cookies to verify your identity.
                </li>
                <li>
                  <strong className="text-foreground">Google Maps:</strong> Used to display our Uttam Nagar showroom map.
                </li>
                <li>
                  <strong className="text-foreground">Razorpay Checkout:</strong> Used to maintain secure session integrity during payment checkout.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="4. How to Manage Your Cookie Settings">
              <p>
                You can change your cookie preferences at any time using our floating cookie preferences banner or through your browser settings:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Google Chrome: Settings → Privacy and security → Third-party cookies</li>
                <li>Mozilla Firefox: Settings → Privacy & Security → Cookies and Site Data</li>
                <li>Safari: Settings → Safari → Advanced → Privacy</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                <em>Note: Disabling essential storage may cause the shopping bag, prescription uploader, or login sessions to malfunction.</em>
              </p>
            </LegalSection>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-semibold text-sm text-foreground">Cookie Consent Status</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                You can reset your consent preference anytime to trigger the selection modal again.
              </p>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    localStorage.removeItem("nayantara_cookie_consent");
                    window.location.reload();
                  }}
                >
                  Reset Cookie Preferences
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
