import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Check, Globe } from "lucide-react";

export type Language = "en" | "hi" | "hinglish";

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
  badge?: string;
}

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
  },
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    flag: "🇮🇳",
  },
  {
    code: "hinglish",
    label: "Hinglish",
    nativeLabel: "Gen-Z Hinglish",
    badge: "⚡ Trendy",
    flag: "😎",
  },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    announcement: "Trusted optical care in New Delhi for 35+ years",
    "nav.shop": "Shop",
    "nav.services": "Services",
    "nav.lenses": "Lenses",
    "nav.myopia": "Myopia Care",
    "nav.reviews": "Reviews",
    "nav.story": "Our Story",
    "nav.book": "Book an eye check",
    "nav.bag": "Your bag",
    "nav.admin": "Admin",
    "nav.skip": "Skip to content",
    "hero.badge": "Independent Optical Boutique since 1990",
    "hero.titleLine1": "See Life in",
    "hero.titleHighlight": "Perfect Focus.",
    "hero.description":
      "Premium eyewear, precision lenses and 35+ years of trusted optical expertise — fitted with care in Uttam Nagar, New Delhi.",
    "hero.ctaShop": "Shop Eyeglasses",
    "hero.ctaBook": "Book Eye Test",
    "hero.stat1Val": "35+",
    "hero.stat1Label": "Years of optical experience",
    "hero.stat2Val": "3",
    "hero.stat2Label": "Generations of local families",
    "hero.stat3Val": "4.9★",
    "hero.stat3Label": "From 500+ in-store reviews",
    "cat.eyebrow": "Shop by category",
    "cat.title": "Everything your eyes need, under one roof.",
    "cat.description":
      "Frames, lenses, contacts and specialist aids — each with hands-on guidance in store.",
    "cat.eyeglasses": "Eyeglasses",
    "cat.sunglasses": "Sunglasses",
    "cat.contacts": "Contact Lenses",
    "cat.hearing": "Hearing Aids",
    "cat.vision": "Vision Aids",
    "reasons.eyebrow": "Why Nayantara",
    "reasons.title": "Optical care that puts your comfort first.",
    "reasons.1.title": "Unhurried consultations",
    "reasons.1.body":
      "Dedicated appointment slots so your prescription, routine and comfort are all discussed properly.",
    "reasons.2.title": "Fitting is part of the frame",
    "reasons.2.body":
      "Every pair is adjusted on your face — nose pads, temple curve, pantoscopic tilt — before you leave.",
    "reasons.3.title": "Plain-language advice",
    "reasons.3.body":
      "We explain what each lens option actually does, including when you don't need the pricier one.",
    "reasons.4.title": "Care that continues",
    "reasons.4.body":
      "Come back for adjustments and check-ins. Most of our customers were sent by someone they know.",
    "trending.eyebrow": "Trending frames",
    "trending.title": "Considered design, crafted for daily wear.",
    "trending.subtitle":
      "Thoughtfully selected shapes and materials, all on the shelf in Uttam Nagar.",
    "trending.viewAll": "Explore full collection",
    "quiz.badge": "Guided",
    "quiz.title": "Find Your Frame",
    "quiz.desc":
      "Three quick questions on face shape, style and material — we shortlist frames worth trying on your next visit.",
    "quiz.btn": "Take the 30-second quiz",
    "tryon.badge": "Phase 2",
    "tryon.title": "Virtual Try-On",
    "tryon.desc":
      "Live camera try-on is in development for the next release. Until then, every frame on this site is on the shelf in store.",
    "tryon.btn": "Preview what's coming",
    "lensStudio.eyebrow": "Lens studio",
    "lensStudio.title": "Compare lenses without the jargon.",
    "lensStudio.desc":
      "Transparent packages. Final suitability and measurements are always confirmed in store.",
    "lensStudio.action": "Full lens comparison",
    "lensStudio.badge": "Most chosen",
    "bookSlot.eyebrow": "Book an eye check",
    "bookSlot.title": "Pick a time that suits you.",
    "bookSlot.desc":
      "Choose a slot to carry through to the booking page. Zero waiting time guaranteed.",
    "bookSlot.continueBtn": "Continue booking",
    "bookSlot.waBtn": "Ask on WhatsApp",
    "legacy.eyebrow": "A 35-year legacy",
    "legacy.title": "The confidence of being truly looked after.",
    "legacy.desc":
      "Since 1990 we have fitted glasses for families across Uttam Nagar, Dwarka, Janakpuri and West Delhi. We take time to understand your prescription, your routine and how a frame sits — not simply how it looks on a shelf.",
    "legacy.storyBtn": "Our story",
    "visit.eyebrow": "Visit the store",
    "visit.title": "Near Metro Pillar 703, Uttam Nagar.",
    "visit.directionsBtn": "Get directions",
    "visit.contactBtn": "Contact & hours",
    "bookCta.badge": "Zero waiting time",
    "bookCta.title": "Ready for crystal-clear vision?",
    "bookCta.subtitle":
      "Reserve an unhurried 20-minute computerized eye checkup with our senior optometrist at Uttam Nagar.",
    "bookCta.btn": "Reserve Your Slot Now",
    "footer.desc":
      "Independent optical care, considered eyewear and patient fitting in Uttam Nagar since 1990.",
    "footer.visit": "Visit Showroom",
    "footer.explore": "Explore",
    "footer.rights": "© 2026 Nayantara Opticals · New Delhi",
    "chat.btnTitle": "Ask Optical AI",
    "chat.btnSubtitle": "Eyecare, Frames & Clinic",
    "chat.greeting":
      "Namaste! 🙏 I'm **Tara**, your Optical & Eyecare Advisor at **Nayantara Opticals**.",
    "chat.intro":
      "How can I assist you today? You can ask me about **frame selection for your face**, **progressive or blue-cut lenses**, **pediatric myopia management**, or **booking an eye test** in Uttam Nagar!",
    "chat.placeholder": "Ask about frames, lenses, eye tests...",
  },
  hi: {
    announcement: "नई दिल्ली में 35+ वर्षों से विश्वसनीय आँखों की देखभाल",
    "nav.shop": "चश्मे खरीदें",
    "nav.services": "सेवाएँ",
    "nav.lenses": "लेंस",
    "nav.myopia": "मायोपिया केयर",
    "nav.reviews": "समीक्षाएं",
    "nav.story": "हमारी कहानी",
    "nav.book": "जाँच बुक करें",
    "nav.bag": "आपका बैग",
    "nav.admin": "एडमिन",
    "nav.skip": "कंटेंट पर जाएँ",
    "hero.badge": "1990 से आपकी सेवा में स्वतंत्र ऑप्टिकल बुटीक",
    "hero.titleLine1": "ज़िंदगी को देखें बिल्कुल",
    "hero.titleHighlight": "साफ़ और स्पष्ट।",
    "hero.description":
      "प्रीमियम चश्मे, आधुनिक लेंस और 35+ वर्षों का भरोसेमंद अनुभव — उत्तम नगर, नई दिल्ली में पूर्ण संतुष्टि के साथ।",
    "hero.ctaShop": "चश्मे देखें",
    "hero.ctaBook": "जाँच बुक करें",
    "hero.stat1Val": "35+",
    "hero.stat1Label": "वर्षों का ऑप्टिकल अनुभव",
    "hero.stat2Val": "3",
    "hero.stat2Label": "पीढ़ियों का अटूट भरोसा",
    "hero.stat3Val": "4.9★",
    "hero.stat3Label": "500+ संतुष्ट ग्राहकों द्वारा सत्यापित",
    "cat.eyebrow": "श्रेणी अनुसार खरीदें",
    "cat.title": "आपकी आँखों की हर ज़रूरत, एक ही छत के नीचे।",
    "cat.description":
      "फ़्रेम्स, लेंस, कॉन्टैक्ट लेंस और सहायक उपकरण — हर उत्पाद पर विशेषज्ञ मार्गदर्शन।",
    "cat.eyeglasses": "नज़र के चश्मे",
    "cat.sunglasses": "धूप के चश्मे",
    "cat.contacts": "कॉन्टैक्ट लेंस",
    "cat.hearing": "हियरिंग एड्स",
    "cat.vision": "विज़न एड्स",
    "reasons.eyebrow": "नयनतारा ही क्यों?",
    "reasons.title": "ऑप्टिकल देखभाल जो आपके आराम को प्राथमिकता दे।",
    "reasons.1.title": "बिना हड़बड़ी के परामर्श",
    "reasons.1.body":
      "समर्पित समय स्लॉट ताकि आपकी आँखों का नंबर, दिनचर्या और आराम सभी पर खुलकर चर्चा हो सके।",
    "reasons.2.title": "फ़ेस पर सटीक फ़िटिंग",
    "reasons.2.body":
      "हर चश्मा आपके चेहरे के अनुसार पूरी तरह से एडजस्ट किया जाता है — नोज़ पैड और टेम्पल कर्व तक।",
    "reasons.3.title": "सरल और सच्ची सलाह",
    "reasons.3.body":
      "हम साफ़ समझाते हैं कि कौन सा लेंस आपके लिए सही है और कब महँगे लेंस की ज़रूरत नहीं होती।",
    "reasons.4.title": "हमेशा जारी रहने वाली सेवा",
    "reasons.4.body":
      "फ़्री सर्विस, एडजस्टमेंट और क्लीनिंग के लिए कभी भी आएं। हमारे ग्राहक परिवार की तरह हैं।",
    "trending.eyebrow": "लोकप्रिय फ़्रेम्स",
    "trending.title": "आकर्षक डिज़ाइन, दैनिक उपयोग के लिए निर्मित।",
    "trending.subtitle": "उत्तम नगर शोरूम में उपलब्ध सबसे लोकप्रिय और आरामदायक फ़्रेम्स।",
    "trending.viewAll": "पूरा कलेक्शन देखें",
    "quiz.badge": "मार्गदर्शन",
    "quiz.title": "अपना सही फ़्रेम चुनें",
    "quiz.desc":
      "चेहरे के आकार और पसंद के अनुसार तीन आसान सवाल — हम आपके लिए सबसे बेहतरीन फ़्रेम चुनेंगे।",
    "quiz.btn": "30 सेकंड का क्विज़ शुरू करें",
    "tryon.badge": "आगामी",
    "tryon.title": "वर्चुअल ट्राई-ऑन",
    "tryon.desc":
      "लाइव कैमरा ट्राई-ऑन अगले अपडेट में आ रहा है। तब तक सभी फ़्रेम्स हमारे उत्तम नगर स्टोर पर उपलब्ध हैं।",
    "tryon.btn": "देखें क्या नया आ रहा है",
    "lensStudio.eyebrow": "लेंस स्टूडियो",
    "lensStudio.title": "लेंस की तुलना करें, बिना किसी उलझन के।",
    "lensStudio.desc": "पारदर्शी पैकेज। अंतिम माप और पुष्टि हमेशा हमारे स्टोर पर की जाती है।",
    "lensStudio.action": "सभी लेंस देखें",
    "lensStudio.badge": "सबसे पसंदीदा",
    "bookSlot.eyebrow": "आँखों की जाँच बुक करें",
    "bookSlot.title": "अपनी सुविधानुसार समय चुनें।",
    "bookSlot.desc": "बुकिंग पेज पर आगे बढ़ने के लिए समय स्लॉट चुनें। कोई प्रतीक्षा समय नहीं।",
    "bookSlot.continueBtn": "बुकिंग जारी रखें",
    "bookSlot.waBtn": "व्हाट्सएप पर पूछें",
    "legacy.eyebrow": "35 वर्षों की अटूट विरासत",
    "legacy.title": "एक ऐसा विश्वास जहाँ आपकी आँखों की पूरी देखभाल होती है।",
    "legacy.desc":
      "1990 से हम उत्तम नगर, द्वारका, जनकपुरी और पश्चिमी दिल्ली के परिवारों के चश्मों की सटीक फ़िटिंग कर रहे हैं।",
    "legacy.storyBtn": "हमारी कहानी पढ़ें",
    "visit.eyebrow": "हमारे स्टोर पर आएं",
    "visit.title": "मेट्रो पिलर 703 के पास, उत्तम नगर।",
    "visit.directionsBtn": "रास्ता देखें (Google Maps)",
    "visit.contactBtn": "संपर्क और समय",
    "bookCta.badge": "शून्य प्रतीक्षा समय",
    "bookCta.title": "क्या आप साफ़ और सुंदर दृष्टि के लिए तैयार हैं?",
    "bookCta.subtitle":
      "उत्तम नगर में हमारे वरिष्ठ ऑप्टोमेट्रिस्ट के साथ 20 मिनट का कंप्यूटर-assisted आई टेस्ट स्लॉट बुक करें।",
    "bookCta.btn": "अभी स्लॉट रिज़र्व करें",
    "footer.desc":
      "1990 से उत्तम नगर, नई दिल्ली में स्वतंत्र ऑप्टिकल देखभाल, प्रीमियम फ़्रेम्स और विशेषज्ञ फ़िटिंग।",
    "footer.visit": "शोरूम पर पधारें",
    "footer.explore": "एक्सप्लोर करें",
    "footer.rights": "© 2026 नयनतारा ऑप्टिकल्स · नई दिल्ली",
    "chat.btnTitle": "ऑप्टिकल AI से पूछें",
    "chat.btnSubtitle": "आईकेयर, फ़्रेम्स और क्लिनिक",
    "chat.greeting": "नमस्ते! 🙏 मैं **तारा** हूँ, **नयनतारा ऑप्टिकल्स** की आपकी आईकेयर एडवाइज़र।",
    "chat.intro":
      "आज मैं आपकी क्या सहायता कर सकती हूँ? आप मुझसे **चेहरे के अनुसार फ़्रेम**, **ब्लू-कट व प्रोग्रेसिव लेंस**, **बच्चों के मायोपिया की देखभाल** या उत्तम नगर में **आँखों की जाँच का स्लॉट** बुक करने के बारे में पूछ सकते हैं!",
    "chat.placeholder": "चश्मे, लेंस या जाँच के बारे में पूछें...",
  },
  hinglish: {
    announcement: "35+ years of pure trust in Delhi · Sabka eye game sorted! ⚡",
    "nav.shop": "Drip Collection",
    "nav.services": "Eye Care & Services",
    "nav.lenses": "Smart Lenses",
    "nav.myopia": "Kids Eye Care",
    "nav.reviews": "Public Review Check",
    "nav.story": "The OG Legacy",
    "nav.book": "Book Slot in 2 Mins ⚡",
    "nav.bag": "Bag Check",
    "nav.admin": "Admin",
    "nav.skip": "Direct content pe jao",
    "hero.badge": "✨ The OG Optical Boutique · Slaying Since 1990",
    "hero.titleLine1": "See Life in Ultra",
    "hero.titleHighlight": "4K Focus, No Cap.",
    "hero.description":
      "Aesthetic frames, anti-glare blue cut lenses, aur 35+ saal ka trust — Uttam Nagar me aao aur full drip check karwao.",
    "hero.ctaShop": "Explore Slaying Specs 👓",
    "hero.ctaBook": "Book Slot, Fast AF ⚡",
    "hero.stat1Val": "35+",
    "hero.stat1Label": "Years ka solid optical legacy",
    "hero.stat2Val": "3",
    "hero.stat2Label": "Generations ka unconditional trust",
    "hero.stat3Val": "4.9★",
    "hero.stat3Label": "500+ verified customer vibes",
    "cat.eyebrow": "Category pick karo",
    "cat.title": "Aapke aankho ka scene sorted, sab kuch ek hi jagah.",
    "cat.description":
      "Killer frames, blue-cut computer lenses, contacts aur smart vision gear — expert guidance ke sath.",
    "cat.eyeglasses": "Everyday Specs 👓",
    "cat.sunglasses": "Shades & Drip 😎",
    "cat.contacts": "Contact Lenses 👁️",
    "cat.hearing": "Hearing Gear 🦻",
    "cat.vision": "Vision Aids 🔍",
    "reasons.eyebrow": "Kyu Nayantara Best Hai?",
    "reasons.title": "Optical care jo genuinely aapke comfort pe focus kare.",
    "reasons.1.title": "Zero rush, pure chill consultations",
    "reasons.1.body":
      "Dedicated appointment slots taaki aapke number, screen routine aur face shape pe detailed baat ho sake.",
    "reasons.2.title": "Chehre pe custom fit, guaranteed",
    "reasons.2.body":
      "Nose pads se leke ear curve tak — jab tak frame face pe butter smooth na baithe, tab tak we don't let you leave.",
    "reasons.3.title": "No bakwaas, 100% genuine advice",
    "reasons.3.body":
      "Overpriced cheezein zabardasti push nahi karte. Jo lens sach me chahiye, wahi recommend karte hain.",
    "reasons.4.title": "Lifetime free adjustments",
    "reasons.4.body":
      "Specs loose ho gaye ya deep cleaning chahiye? Kabhi bhi showroom me tap in karo, absolutely free!",
    "trending.eyebrow": "Trending drops",
    "trending.title": "Frames that actually hit different on your face.",
    "trending.subtitle":
      "Carefully handpicked shapes and premium lightweight acetates, sab Uttam Nagar showroom me ready.",
    "trending.viewAll": "Explore All Frames →",
    "quiz.badge": "AI Matcher ⚡",
    "quiz.title": "Face Shape Matcher",
    "quiz.desc":
      "Bas 3 quick questions me pata lagao kaunsa frame aapke face pe aesthetic lagega aur full drip dega!",
    "quiz.btn": "Take 30-Sec Quiz 🚀",
    "tryon.badge": "Cooking 🔥",
    "tryon.title": "Virtual AR Try-On",
    "tryon.desc":
      "Live camera se frame try karne ka feature cooking hai! Tab tak Uttam Nagar showroom me aao aur real me try karo.",
    "tryon.btn": "Preview The Feature 👀",
    "lensStudio.eyebrow": "Smart Lens Studio",
    "lensStudio.title": "No medical jargon, bas clear comparison.",
    "lensStudio.desc":
      "Transparent pricing without any hidden charges. Fitting testing clinic me hoti hai.",
    "lensStudio.action": "Compare All Lenses",
    "lensStudio.badge": "Top Pick 🔥",
    "bookSlot.eyebrow": "Instant Eye Checkup ⚡",
    "bookSlot.title": "Aapke schedule ke hisaab se best time.",
    "bookSlot.desc":
      "Preferred slot select karo aur 2 mins me booking done. Zero waiting line, guaranteed!",
    "bookSlot.continueBtn": "Proceed to Book ⚡",
    "bookSlot.waBtn": "WhatsApp pe pucho 💬",
    "legacy.eyebrow": "35+ Years of Pure Vibe & Trust",
    "legacy.title": "Aankhon ki care me no compromise, period.",
    "legacy.desc":
      "1990 se Uttam Nagar, Dwarka aur pure West Delhi ke families ka favorite optical spot. Yahan frame sirf bechte nahi, aapke face aur screen lifestyle ke hisaab se perfection me fit karte hain.",
    "legacy.storyBtn": "Checkout Our Story 📖",
    "visit.eyebrow": "Showroom Visit Karo 📍",
    "visit.title": "Metro Pillar 703 ke bilkul samne, Uttam Nagar.",
    "visit.directionsBtn": "Get Directions (Maps) 🗺️",
    "visit.contactBtn": "Timings & Contact 📞",
    "bookCta.badge": "No queue, no drama ⚡",
    "bookCta.title": "Ready for crystal-clear 4K vision?",
    "bookCta.subtitle":
      "Reserve an unhurried 20-minute computerized eye test with our senior optometrist at Uttam Nagar. Zero waiting time!",
    "bookCta.btn": "Grab Your Slot Now ⚡",
    "footer.desc":
      "Independent optical care, considered eyewear and patient fitting in Uttam Nagar since 1990.",
    "footer.visit": "Showroom Vibe Check",
    "footer.explore": "Quick Explore",
    "footer.rights": "© 2026 Nayantara Opticals · New Delhi",
    "chat.btnTitle": "Ask Optical AI",
    "chat.btnSubtitle": "Frames, Care & Doctor Slot",
    "chat.greeting": "Yo! 👋 I'm **Tara**, your AI Optical Advisor at **Nayantara Opticals**.",
    "chat.intro":
      "Batao bro, kya scene hai? **Chehre pe kaunsa frame suit karega**, **screen strain se kaise bachein**, **blue-cut lenses ka scene**, ya **Uttam Nagar me eye test slot book karna hai**? Sab sorted hai!",
    "chat.placeholder": "Specs, lenses ya doctor appointment ke baare me pucho...",
  },
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nayantara_lang");
      if (saved && (saved === "en" || saved === "hi" || saved === "hinglish")) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("nayantara_lang", lang);
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
      if (currentDict && key in currentDict) {
        const val = currentDict[key];
        if (typeof val === "string") return val;
      }
      const enDict = TRANSLATIONS.en;
      if (enDict && key in enDict) {
        const val = enDict[key];
        if (typeof val === "string") return val;
      }
      if (fallback !== undefined) {
        return fallback;
      }
      return key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

/**
 * Compact and stylish Language Selector dropdown component
 */
export function LanguageSelector({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentOption: LanguageOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) ?? LANGUAGE_OPTIONS[0]!;

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted/80 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Change Website Language"
        aria-expanded={isOpen}
      >
        <span className="text-sm select-none">{currentOption.flag}</span>
        <span className="text-[11px] font-semibold text-foreground/90 group-hover:text-primary transition-colors">
          {currentOption.nativeLabel}
        </span>
        <Globe className="h-3 w-3 text-muted-foreground transition-transform group-hover:rotate-12" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 mb-1">
            Choose Language
          </div>
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted/80"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base select-none">{opt.flag}</span>
                  <div className="truncate">
                    <p className="leading-tight">{opt.nativeLabel}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{opt.label}</p>
                  </div>
                </div>
                {opt.badge && (
                  <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                    {opt.badge}
                  </span>
                )}
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
