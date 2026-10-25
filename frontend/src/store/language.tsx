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
}

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
  },
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
  },
  {
    code: "hinglish",
    label: "Hinglish",
    nativeLabel: "Hinglish",
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
      "Premium eyewear, precision lenses and 35+ years of trusted optical expertise, fitted with care in Uttam Nagar, New Delhi.",
    "hero.ctaShop": "Shop Eyeglasses",
    "hero.ctaBook": "Book Eye Test",
    "hero.stat1Val": "1990",
    "hero.stat1Label": "Established in Uttam Nagar",
    "hero.stat2Val": "In-Store",
    "hero.stat2Label": "Computerized eye testing",
    "hero.stat3Val": "Custom",
    "hero.stat3Label": "Hand-fitted frame alignment",
    "cat.eyebrow": "Shop by category",
    "cat.title": "Everything your eyes need, under one roof.",
    "cat.description":
      "Frames, lenses, contacts and specialist aids, each with hands-on guidance in store.",
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
      "Every pair is adjusted on your face (nose pads, temple curve, pantoscopic tilt) before you leave.",
    "reasons.3.title": "Plain-language advice",
    "reasons.3.body":
      "We explain what each lens option actually does, including when you do not need the pricier one.",
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
      "Three quick questions on face shape, style and material to shortlist frames worth trying on your next visit.",
    "quiz.btn": "Take the 30-second quiz",
    "tryon.badge": "Phase 2",
    "tryon.title": "Virtual Try-On",
    "tryon.desc":
      "Live camera try-on is in development for the next release. Until then, every frame on this site is on the shelf in store.",
    "tryon.btn": "Preview what is coming",
    "lensStudio.eyebrow": "Lens studio",
    "lensStudio.title": "Compare lenses without the jargon.",
    "lensStudio.desc":
      "Transparent packages. Final suitability and measurements are always confirmed in store.",
    "lensStudio.action": "Full lens comparison",
    "lensStudio.badge": "Most chosen",
    "bookSlot.eyebrow": "Book an eye check",
    "bookSlot.title": "Pick a time that suits you.",
    "bookSlot.desc":
      "Choose a slot to carry through to the booking page. Dedicated appointment slots.",
    "bookSlot.continueBtn": "Continue booking",
    "bookSlot.waBtn": "Ask on WhatsApp",
    "legacy.eyebrow": "A 35-year legacy",
    "legacy.title": "The confidence of being truly looked after.",
    "legacy.desc":
      "Since 1990 we have fitted glasses for families across Uttam Nagar, Dwarka, Janakpuri and West Delhi. We take time to understand your prescription, your routine and how a frame sits, not simply how it looks on a shelf.",
    "legacy.storyBtn": "Our story",
    "visit.eyebrow": "Visit the store",
    "visit.title": "Near Metro Pillar 703, Uttam Nagar.",
    "visit.directionsBtn": "Get directions",
    "visit.contactBtn": "Contact & hours",
    "bookCta.badge": "Dedicated slots",
    "bookCta.title": "Ready for crystal-clear vision?",
    "bookCta.subtitle":
      "Reserve an unhurried 20-minute computerized eye checkup with our senior optometrist at Uttam Nagar.",
    "bookCta.btn": "Reserve Your Slot Now",
    "footer.desc":
      "Independent optical care, considered eyewear and patient fitting in Uttam Nagar since 1990.",
    "footer.visit": "Visit Showroom",
    "footer.explore": "Explore",
    "footer.rights": "© 2026 Nayantara Opticals · New Delhi",
    "chat.btnTitle": "Optometry Support",
    "chat.btnSubtitle": "Eyecare, Frames & Clinic",
    "chat.greeting":
      "Namaste! I am **Tara**, your Optical & Eyecare Advisor at **Nayantara Opticals**.",
    "chat.intro":
      "How can I assist you today? You can ask me about **frame selection for your face**, **progressive or blue-cut lenses**, **pediatric myopia management**, or **booking an eye test** in Uttam Nagar.",
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
      "प्रीमियम चश्मे, आधुनिक लेंस और 35+ वर्षों का भरोसेमंद अनुभव - उत्तम नगर, नई दिल्ली में पूर्ण संतुष्टि के साथ।",
    "hero.ctaShop": "चश्मे देखें",
    "hero.ctaBook": "जाँच बुक करें",
    "hero.stat1Val": "1990",
    "hero.stat1Label": "उत्तम नगर में स्थापित",
    "hero.stat2Val": "स्टोर में",
    "hero.stat2Label": "कंप्यूटरीकृत आँखों की जाँच",
    "hero.stat3Val": "कस्टम",
    "hero.stat3Label": "हाथ से अनुकूलित फ़्रेम फ़िटिंग",
    "cat.eyebrow": "श्रेणी अनुसार खरीदें",
    "cat.title": "आपकी आँखों की हर ज़रूरत, एक ही छत के नीचे।",
    "cat.description":
      "फ़्रेम्स, लेंस, कॉन्टैक्ट लेंस और सहायक उपकरण - हर उत्पाद पर विशेषज्ञ मार्गदर्शन।",
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
      "हर चश्मा आपके चेहरे के अनुसार पूरी तरह से एडजस्ट किया जाता है (नोज़ पैड और टेम्पल कर्व तक)।",
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
      "चेहरे के आकार और पसंद के अनुसार तीन आसान सवाल, हम आपके लिए सबसे बेहतरीन फ़्रेम चुनेंगे।",
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
    "bookSlot.desc": "बुकिंग पेज पर आगे बढ़ने के लिए समय स्लॉट चुनें। समर्पित समय स्लॉट।",
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
    "bookCta.badge": "समर्पित स्लॉट",
    "bookCta.title": "क्या आप साफ़ और सुंदर दृष्टि के लिए तैयार हैं?",
    "bookCta.subtitle":
      "उत्तम नगर में हमारे वरिष्ठ ऑप्टोमेट्रिस्ट के साथ 20 मिनट का कंप्यूटरीकृत आई टेस्ट स्लॉट बुक करें।",
    "bookCta.btn": "अभी स्लॉट रिज़र्व करें",
    "footer.desc":
      "1990 से उत्तम नगर, नई दिल्ली में स्वतंत्र ऑप्टिकल देखभाल, प्रीमियम फ़्रेम्स और विशेषज्ञ फ़िटिंग।",
    "footer.visit": "शोरूम पर पधारें",
    "footer.explore": "एक्सप्लोर करें",
    "footer.rights": "© 2026 नयनतारा ऑप्टिकल्स · नई दिल्ली",
    "chat.btnTitle": "ऑप्टिकल सहायता",
    "chat.btnSubtitle": "आईकेयर, फ़्रेम्स और क्लिनिक",
    "chat.greeting": "नमस्ते! मैं **तारा** हूँ, **नयनतारा ऑप्टिकल्स** की आपकी आईकेयर एडवाइज़र।",
    "chat.intro":
      "आज मैं आपकी क्या सहायता कर सकती हूँ? आप मुझसे **चेहरे के अनुसार फ़्रेम**, **ब्लू-कट व प्रोग्रेसिव लेंस**, **बच्चों के मायोपिया की देखभाल** या उत्तम नगर में **आँखों की जाँच का स्लॉट** बुक करने के बारे में पूछ सकते हैं।",
    "chat.placeholder": "चश्मे, लेंस या जाँच के बारे में पूछें...",
  },
  hinglish: {
    announcement: "35+ years of trusted optical care in Uttam Nagar, New Delhi",
    "nav.shop": "Chashme & Frames",
    "nav.services": "Eye Care & Services",
    "nav.lenses": "Prescription Lenses",
    "nav.myopia": "Bachhon ki Eye Care",
    "nav.reviews": "Customer Feedback",
    "nav.story": "Hamari Kahani",
    "nav.book": "Eye Checkup Book Karein",
    "nav.bag": "Aapka Bag",
    "nav.admin": "Admin",
    "nav.skip": "Content par jayein",
    "hero.badge": "Independent Optical Clinic since 1990",
    "hero.titleLine1": "Clear aur Comfortable",
    "hero.titleHighlight": "Vision Har Din.",
    "hero.description":
      "Premium frames, computer lenses aur 35+ saal ka vishwas, Uttam Nagar Metro Pillar 703 ke samne.",
    "hero.ctaShop": "Frames Dekhein",
    "hero.ctaBook": "Eye Test Book Karein",
    "hero.stat1Val": "1990",
    "hero.stat1Label": "Uttam Nagar me sthapit",
    "hero.stat2Val": "In-Store",
    "hero.stat2Label": "Computerized eye testing",
    "hero.stat3Val": "Custom",
    "hero.stat3Label": "Face ke anusaar fitting",
    "cat.eyebrow": "Category chunein",
    "cat.title": "Aankhon ki har zaroorat ek hi jagah.",
    "cat.description":
      "Frames, lenses, contacts aur audiology aids, in-store guidance ke sath.",
    "cat.eyeglasses": "Nazar ke Chashme",
    "cat.sunglasses": "Sunglasses",
    "cat.contacts": "Contact Lenses",
    "cat.hearing": "Hearing Aids",
    "cat.vision": "Vision Aids",
    "reasons.eyebrow": "Nayantara Opticals kyu?",
    "reasons.title": "Optical care jo aapke comfort ko pehle rakhe.",
    "reasons.1.title": "Unhurried consultations",
    "reasons.1.body":
      "Dedicated appointment slots taaki prescription, screen time aur routine par detail me baat ho sake.",
    "reasons.2.title": "Face par custom fit",
    "reasons.2.body":
      "Nose pads aur temple curve har frame ke liye check karke adjust kiya jata hai.",
    "reasons.3.title": "Clear aur genuine advice",
    "reasons.3.body":
      "Lens options ko simple bhasha me samjhaya jata hai bina kisi unnecessary upsell ke.",
    "reasons.4.title": "Free adjustments aur service",
    "reasons.4.body":
      "Frame loose ho ya cleaning chahiye, kabhi bhi showroom me aakar adjustment karwayein.",
    "trending.eyebrow": "Popular frames",
    "trending.title": "Daily wear ke liye selected designs.",
    "trending.subtitle":
      "Lightweight acetates aur titanium frames Uttam Nagar showroom me ready.",
    "trending.viewAll": "Sare Frames Dekhein",
    "quiz.badge": "Guided",
    "quiz.title": "Face Shape Quiz",
    "quiz.desc":
      "3 simple sawalon ke sath janein aapke chehre par kaunsa frame style sabse achha baithega.",
    "quiz.btn": "Quiz Shuru Karein",
    "tryon.badge": "Phase 2",
    "tryon.title": "Virtual Try-On",
    "tryon.desc":
      "Live camera try-on feature development me hai. Tab tak sabhi frames Uttam Nagar store me try karein.",
    "tryon.btn": "Preview Dekhein",
    "lensStudio.eyebrow": "Lens Studio",
    "lensStudio.title": "Lens comparison bina medical jargon ke.",
    "lensStudio.desc":
      "Transparent packages. Measurement aur fitting in-store hoti hai.",
    "lensStudio.action": "Sare Lenses Dekhein",
    "lensStudio.badge": "Top Choice",
    "bookSlot.eyebrow": "Eye Checkup",
    "bookSlot.title": "Apne schedule ke hisaab se time chunein.",
    "bookSlot.desc":
      "Slot select karein aur consultation reserve karein. Dedicated appointments.",
    "bookSlot.continueBtn": "Booking Continue Karein",
    "bookSlot.waBtn": "WhatsApp par Puchein",
    "legacy.eyebrow": "35+ Years of Trust",
    "legacy.title": "Aankhon ki care me continuous support.",
    "legacy.desc":
      "1990 se Uttam Nagar, Dwarka aur Janakpuri ke parivaron ka vishwas. Hum prescription aur frame dono ko face ke anusaar perfectly fit karte hain.",
    "legacy.storyBtn": "Hamari Kahani",
    "visit.eyebrow": "Showroom Address",
    "visit.title": "Metro Pillar 703 ke samne, Uttam Nagar.",
    "visit.directionsBtn": "Google Maps Directions",
    "visit.contactBtn": "Timings & Contact",
    "bookCta.badge": "Dedicated slots",
    "bookCta.title": "Clear vision ke liye tayyar?",
    "bookCta.subtitle":
      "Senior optometrist ke sath 20-minute computerized eye checkup reserve karein Uttam Nagar me.",
    "bookCta.btn": "Slot Reserve Karein",
    "footer.desc":
      "Independent optical care, considered eyewear aur patient fitting Uttam Nagar me 1990 se.",
    "footer.visit": "Showroom Visit",
    "footer.explore": "Explore",
    "footer.rights": "© 2026 Nayantara Opticals · New Delhi",
    "chat.btnTitle": "Optometry Support",
    "chat.btnSubtitle": "Frames, Care & Clinic",
    "chat.greeting": "Namaste! Main **Tara** hoon, **Nayantara Opticals** ki Advisor.",
    "chat.intro":
      "Aap mujhse **frame selection**, **blue-cut ya progressive lenses**, **pediatric myopia care**, ya **Uttam Nagar me eye test slot booking** ke baare me pooch sakte hain.",
    "chat.placeholder": "Frames, lenses ya appointment ke baare me puchein...",
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
 * Clean and professional Language Selector dropdown component
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
        className="group inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted/80 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Change Website Language"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:rotate-12" />
        <span className="text-[11px] font-semibold text-foreground/90 group-hover:text-primary transition-colors">
          {currentOption.nativeLabel}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-md border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150">
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
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted/80"
                }`}
              >
                <div className="truncate">
                  <p className="leading-tight">{opt.nativeLabel}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{opt.label}</p>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
