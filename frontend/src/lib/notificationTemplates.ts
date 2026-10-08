export type NotificationCategory =
  | "NEW_COLLECTION"
  | "PROMOTION"
  | "EYE_HEALTH"
  | "STORE_UPDATE"
  | "ANNOUNCEMENT";

export type NotificationPriority = "NORMAL" | "HIGH" | "URGENT";

export type NotificationTarget = "ALL" | "SPECIFIC_USERS" | "WITH_APPOINTMENTS" | "WITH_ORDERS";

export interface NotificationTemplate {
  id: string;
  name: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  iconName: string;
  badgeLabel: string;
  badgeColor: string;
  defaultTitle: string;
  defaultBody: string;
  defaultLinkUrl: string;
  defaultCtaText: string;
  defaultImageUrl?: string;
  description: string;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "new-collection-drop",
    name: "New Eyewear Collection Drop",
    category: "NEW_COLLECTION",
    priority: "HIGH",
    iconName: "Glasses",
    badgeLabel: "New Arrival",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    defaultTitle: "👓 Fresh Italian Titanium & Acetate Frames Just Dropped!",
    defaultBody:
      "Hello {name}, discover our latest ultra-lightweight titanium and handcrafted acetate frames designed for all-day comfort. Visit Nayantara Opticals at Uttam Nagar or browse online to get an exclusive 15% introductory discount on your complete frame & lens pair!",
    defaultLinkUrl: "/shop",
    defaultCtaText: "Explore Collection",
    defaultImageUrl: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80",
    description: "Promote new arrivals, designer sunglass launches, and fashionable frame restocks.",
  },
  {
    id: "festive-mega-sale",
    name: "Festive Eyewear Gala & Discounts",
    category: "PROMOTION",
    priority: "HIGH",
    iconName: "Tag",
    badgeLabel: "Limited Offer",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    defaultTitle: "🎉 Festive Special: Flat 20% Off + Free Blue-Cut Lens Coating!",
    defaultBody:
      "Upgrade your vision this season! Enjoy flat 20% savings across our entire designer optical frame range and receive complimentary anti-reflective digital screen protection coatings on all Zeiss & Essilor prescription lenses. Limited period offer.",
    defaultLinkUrl: "/shop",
    defaultCtaText: "Claim Festive Offer",
    defaultImageUrl: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80",
    description: "Announce seasonal festive sales, flat discounts, coupons, and bundled eyewear promotions.",
  },
  {
    id: "annual-eye-checkup",
    name: "Annual Eye Exam & Vision Health Reminder",
    category: "EYE_HEALTH",
    priority: "NORMAL",
    iconName: "Eye",
    badgeLabel: "Eye Health",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    defaultTitle: "👁️ Time for Your Computerized Vision Checkup, {name}?",
    defaultBody:
      "Regular eye exams keep your vision sharp and catch refractive shifts early. Reserve your computerized 15-minute eye evaluation and autorefraction with our certified optometrist at Nayantara Opticals, Pillar 703, Uttam Nagar. Zero wait time when booked in advance!",
    defaultLinkUrl: "/book-appointment",
    defaultCtaText: "Book Free Checkup",
    defaultImageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80",
    description: "Encourage periodic refractive exams, vision wellness, and clinic consultation bookings.",
  },
  {
    id: "pediatric-myopia",
    name: "Pediatric Eye Care & Student Glasses",
    category: "EYE_HEALTH",
    priority: "NORMAL",
    iconName: "Sparkles",
    badgeLabel: "Child Wellness",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    defaultTitle: "👶 Children's Vision Care: Myopia Management & Study Glasses",
    defaultBody:
      "Increasing digital screen time can trigger student myopia. Our clinic now features specialized pediatric myopia assessment, lightweight flexible frames, and impact-resistant blue-shield lenses for school children and teenagers.",
    defaultLinkUrl: "/book-appointment?type=myopia",
    defaultCtaText: "Book Pediatric Exam",
    defaultImageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    description: "Target parents and students with children's eyewear and myopia management consultations.",
  },
  {
    id: "store-update-express",
    name: "Store Announcement & 30-Min Lens Lab",
    category: "STORE_UPDATE",
    priority: "NORMAL",
    iconName: "Megaphone",
    badgeLabel: "Store Update",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    defaultTitle: "📢 In-Store Update: Robotic Lens Edging & 30-Min Express Fitting!",
    defaultBody:
      "We have upgraded our clinic with a high-precision digital patternless edger! Enjoy express 30-minute fitting on popular single-vision prescription lenses. We are open all 7 days from 10:30 AM to 9:00 PM near Metro Pillar 703, Uttam Nagar.",
    defaultLinkUrl: "/contact",
    defaultCtaText: "Store Directions & Hours",
    defaultImageUrl: "https://images.unsplash.com/photo-1587502537147-2ba64a62e3d3?w=800&auto=format&fit=crop&q=80",
    description: "Share store hours updates, new clinic machinery, express lens services, and holiday schedules.",
  },
  {
    id: "contact-lens-trial",
    name: "Contact Lens Trial & Solution Combo",
    category: "NEW_COLLECTION",
    priority: "NORMAL",
    iconName: "CheckCircle",
    badgeLabel: "Special Deal",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
    defaultTitle: "✨ Soft Contact Lens Trial & Free 120ml Solution Kit",
    defaultBody:
      "Switching to lenses or need fresh daily/monthly disposables? Book a complimentary contact lens trial session with our contact lens specialist and receive a 120ml lens disinfectant solution bottle with any 2-box purchase.",
    defaultLinkUrl: "/book-appointment",
    defaultCtaText: "Book Lens Trial",
    defaultImageUrl: "https://images.unsplash.com/photo-1587502537147-2ba64a62e3d3?w=800&auto=format&fit=crop&q=80",
    description: "Drive contact lens fitting bookings and disinfectant solution sales.",
  },
  {
    id: "custom-template",
    name: "Custom Blank Notification",
    category: "ANNOUNCEMENT",
    priority: "NORMAL",
    iconName: "Bell",
    badgeLabel: "Custom Notice",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    defaultTitle: "",
    defaultBody: "",
    defaultLinkUrl: "/shop",
    defaultCtaText: "Learn More",
    defaultImageUrl: "",
    description: "Write completely custom notifications with your own headline, body, link, and banner image.",
  },
];
