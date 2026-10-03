import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  MapPin,
  Calendar,
  Glasses,
  Eye,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE, waLink } from "@/lib/site";
import { apiRequest } from "@/lib/api";

export interface ChatAction {
  label: string;
  href?: string | undefined;
  isExternal?: boolean | undefined;
  isWhatsApp?: boolean | undefined;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actions?: ChatAction[] | undefined;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-welcome-1",
    sender: "bot",
    text: "Arre hello! Namaste! 👋 Main hoon **Tara** — aapki personal eyewear stylist aur optical buddy at **Nayantara Opticals**! 👓✨",
    timestamp: "Just now",
  },
  {
    id: "m-welcome-2",
    sender: "bot",
    text: "Batao yaar, aaj kya plan hai? Naya stylish frame dekhna hai, screen strain / headaches se bachna hai, ya hamare Uttam Nagar clinic me **Free Computer Eye Test** book karna hai? Main hoon na, batao!",
    timestamp: "Just now",
    actions: [
      { label: "👓 Frame for my face shape", href: "/shop" },
      { label: "💻 Blue-cut screen glasses", href: "/lenses" },
      { label: "📅 Book Free Eye Test", href: "/book" },
      { label: "📍 Store Opp. Pillar 703", href: "/contact" },
      { label: "💬 Chat on WhatsApp", isWhatsApp: true },
    ],
  },
];

function FormattedMessageText({ text }: { text: string }) {
  const parseInlineBold = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-xs uppercase tracking-wider text-primary pt-2 pb-0.5">
              {parseInlineBold(trimmed.substring(4))}
            </h4>
          );
        }
        if (trimmed === "---") {
          return <hr key={idx} className="my-2 border-border/50" />;
        }
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5 py-0.5">
              <span className="text-primary font-bold select-none">•</span>
              <p className="flex-1">{parseInlineBold(trimmed.substring(2))}</p>
            </div>
          );
        }
        if (trimmed === "") {
          return <div key={idx} className="h-1" />;
        }
        return <p key={idx}>{parseInlineBold(line)}</p>;
      })}
    </div>
  );
}

const KNOWLEDGE_BASE: {
  keywords: string[];
  reply: string;
  actions?: ChatAction[] | undefined;
}[] = [
  // 0A. How to Buy Lenses ("Lens kaise kharidein" / "How to buy lenses")
  {
    keywords: ["lens kaise", "how to buy lens", "how to buy lenses", "lens kharid", "buy lens", "order lens", "lens buy"],
    reply: `🛒 **Nayantara Opticals Website par Lenses Kharidne ka Step-by-Step Guide:**

Aap hamari website se aasaani se customized prescription lenses order kar sakte hain:

---

### 🔹 Step 1: Apna Lens Package Select Karein
Aap hamare [/lenses](/lenses) ya [/services](/services) page par jakar apni zaroorat ke anusaar lens technology chun sakte hain:
• **Single Vision**: Door (distance) ya paas (reading) ke liye. Yeh har frame ke sath included hote hain.
• **Blue Filter + Anti-Glare (+₹1,200)**: Phone, laptop screens aur night driving ke liye best (glare-free, scratch-resistant, hydrophobic).
• **Progressive Lenses (+₹3,500)**: 40+ age ke liye no-line multifocal — distance, computer aur reading teeno zones ka seamless blend.
• **Photochromic / Transitions**: Dhoop mein dark sunglasses ban jaate hain aur indoor transparent rehte hain.

---

### 🔹 Step 2: Apna Pasandida Frame Chunein
Lenses frame ke size aur shape ke anusaar laboratory mein custom-cut hote hain:
• [/shop](/shop) par jakar Titanium, Acetate ya TR90 frames browse karein.
• Chehre ke anusaar frame janne ke liye hamara **Frame Shape Quiz** try karein!

---

### 🔹 Step 3: Prescription (Doctor ka Parcha) Attach Karein
• [/prescription](/prescription) page par jakar doctor ke parche ki photo ya PDF upload karein.
• Ya manual power (Right Eye OD aur Left Eye OS: SPH, CYL, AXIS, PD) enter karein.
• *Note:* Agar updated number nahi hai, toh [/book](/book) par jakar hamare Uttam Nagar clinic mein **Free 20-Point Computerized Eye Test** book kar sakte hain!

---

### 🔹 Step 4: Bag mein Add karein & Checkout
• Frame aur lens configure karke **"Add to bag"** dabayein.
• [/cart](/cart) par jayein aur Home Delivery ya Showroom Pickup (Metro Pillar 703, Uttam Nagar) select karein.`,
    actions: [
      { label: "🔍 View Lens Packages", href: "/lenses" },
      { label: "👓 Browse Frames", href: "/shop" },
      { label: "📄 Upload Prescription", href: "/prescription" },
    ],
  },

  // 0B. How to Buy Frames / Eyeglasses ("Chashma kaise order karein")
  {
    keywords: ["chashma kaise", "frame kaise", "how to order glasses", "how to buy glasses", "how to buy frame", "chashma kharid", "frame kharid"],
    reply: `👓 **Nayantara Opticals par Chashma (Frame) Order Karne ka Tarika:**

Website par frame chunna aur order karna behad aasan hai:

---

### 1️⃣ Frame Browse Karein ([/shop](/shop)):
• [/shop](/shop) page open karein.
• Shape select karein (Round, Rectangle, Square, Aviator, Cat-Eye, Rimless).
• Material filter karein: **Pure Japanese Titanium** (<10g ultra-light), **Italian Handcrafted Acetate**, ya **Flexible Swiss TR90**.

---

### 2️⃣ Smart Face-Shape Quiz & Virtual Try-On:
• Samajh na aaye kaun sa frame suit karega? Shop page par **"Frame Shape Quiz"** lein — yeh aapke face shape (Round, Square, Oval, Heart) ke anusaar best frames recommend karta hai!
• Virtual Try-On use karke dekhein frame kaisa lagta hai.

---

### 3️⃣ Lens & Prescription Attach Karein:
• Frame par click karein, colour select karein aur **"Add to bag"** karein.
• Lens package choose karein aur [/prescription](/prescription) par doctor ka parcha upload karein.

---

### 4️⃣ Cart & Instant Checkout ([/cart](/cart)):
• [/cart](/cart) par jakar order review karein. Home delivery ya hamare Uttam Nagar showroom se free pickup ka option chunein.`,
    actions: [
      { label: "👓 Explore Frame Catalog", href: "/shop" },
      { label: "🔍 Lens Packages", href: "/lenses" },
      { label: "📅 Book Eye Test", href: "/book" },
    ],
  },

  // 0C. How to Book Eye Test / Appointment
  {
    keywords: ["appointment kaise", "eye test kaise", "checkup kaise", "how to book appointment", "how to book eye test"],
    reply: `🩺 **Nayantara Opticals Clinic mein Eye Test Kaise Book Karein:**

Aap hamare certified optometrists ke sath online appointment sirf 1 minute mein book kar sakte hain:

---

### 📌 Step-by-Step Booking Guide:
1. **/book** page par jayein ([Direct Booking Link](/book)).
2. **Consultation Type Chunein**:
   • **Comprehensive Eye Exam**: 20-point digital zero-error computerized autorefraction aur vision health check.
   • **Pediatric Myopia Management**: Baccho ke badhte eyesight number ko rokne ke liye clinical consultation.
   • **Frame Styling Session**: Face geometry ke hisab se personalized frame selection.
   • **Contact Lens Trial**: Contact lens fitting aur demo.
3. **Date aur Time Slot Select Karein**:
   • Monday to Saturday: 10:00 AM – 8:30 PM | Sunday: 11:00 AM – 6:00 PM.
4. **Apni Details Bharein**:
   • Apna naam aur phone number dalein aur Confirm karein.
   • Aapka slot turant online confirm ho jayega aur reference number ke sath clinic database me schedule ho jayega!

📍 **Clinic Address**: WZ-27, Shop No.1, Om Vihar Phase-1, Metro Pillar 703 ke samne, Uttam Nagar, New Delhi.`,
    actions: [
      { label: "📅 Book Eye Test Slot", href: "/book" },
      { label: "📍 Store Directions", href: "/contact" },
      { label: "💬 WhatsApp Us", isWhatsApp: true },
    ],
  },

  // 0D. How to Upload Prescription
  {
    keywords: ["prescription kaise", "parcha kaise", "upload kaise", "how to upload prescription"],
    reply: `📄 **Doctor ka Prescription (Parcha) Kaise Upload Karein:**

Aapka prescription hamare cloud vault mein 100% securely store hota hai:

---

### 📋 Prescription Upload Steps:
1. **/prescription** page par jayein ([Prescription Vault](/prescription)).
2. **Do Options Available Hain**:
   • **Upload Photo/PDF**: Apne doctor ke original prescription slip ki clear photo click karke upload karein.
   • **Manual Entry**: Right Eye (OD) aur Left Eye (OS) ke Spherical (SPH), Cylindrical (CYL), Axis, Addition (ADD) aur Pupillary Distance (PD) type karein.
3. **Optometrist Verification**:
   • Hamare senior optometrists har prescription ko verify karte hain taaki zero-error accuracy ke sath lenses cut ho sakein.
4. **No Prescription?**:
   • Agar aapke paas prescription nahi hai, toh [/book](/book) par jakar hamare clinic mein **Free Eye Test** book karein!`,
    actions: [
      { label: "📄 Prescription Vault", href: "/prescription" },
      { label: "📅 Book Eye Test", href: "/book" },
      { label: "👓 Explore Frames", href: "/shop" },
    ],
  },

  // 0E. Website Tour & Guide
  {
    keywords: ["website tour", "website guide", "tour guide", "tour", "website par kya", "website kaise", "how to use website", "website features", "website explain", "website ka tour"],
    reply: `🗺️ **Nayantara Opticals Website Tour & Complete Guide:**

Namaste! Main **Tara** hoon — aapki personal website guide. Aaiye main aapko hamari website ke sabhi sections aur features samjhati hoon:

---

### 🌐 Website par Kya-Kya Available Hai:
1. 🏠 **Home Page ([/](file:///))**:
   • Latest eyewear collections, Virtual Try-on preview, clinic credentials, verified customer reviews aur direct WhatsApp support.
2. 👓 **Shop & Frames ([/shop](/shop))**:
   • Men, Women aur Unisex frames. Filter by Material (Titanium, Acetate, TR90), Shape aur Price.
   • **Smart Frame Quiz**: Apne chehre ke shape (Round, Square, Oval, Heart) ke anusaar best frame recommend karta hai.
3. 🔍 **Prescription Lenses ([/lenses](/lenses) & [/services](/services))**:
   • Complete lens technology guide — Single Vision, Blue-Cut computer lenses, Progressive multifocals aur Transitions photochromic.
4. 🩺 **Book Clinic Eye Test ([/book](/book))**:
   • Computerized 20-point digital eye test slot online book karne ke liye.
5. 👶 **Pediatric Myopia Clinic ([/myopia-management](/myopia-management))**:
   • Baccho ke eyesight number ko badhne se 50-60% rokne wale HALT & DIMS clinical lenses ki puri jankari.
6. 📄 **Prescription Vault ([/prescription](/prescription))**:
   • Doctor ka parcha upload karein ya optical power save karein.
7. 📍 **Store Location & Contact ([/contact](/contact))**:
   • Uttam Nagar showroom ka address (Pillar 703 ke samne), timings, contact number (+91 98765 43210) aur Google Maps directions.

Aap kis feature ke baare mein aur vistaar se jaanna chahte hain?`,
    actions: [
      { label: "👓 Shop Catalog", href: "/shop" },
      { label: "🔍 Lens Guide", href: "/lenses" },
      { label: "📅 Book Clinic Slot", href: "/book" },
    ],
  },

  // 1. Burning Eyes / Dry Eyes / Jalan / Irritation
  {
    keywords: ["burn", "burning", "jalan", "chubhan", "dry eye", "dry", "irritat", "gritty", "stinging", "itch", "scratchy", "sand in eye"],
    reply: `🔥 **Why Your Eyes Are Burning & Immediate Relief Steps:**

A burning sensation is most frequently caused by **Dry Eye Syndrome (DES)** or **Digital Eye Strain (Computer Vision Syndrome)**. When focusing on phones or laptops, your natural blinking rate drops by over 60%, allowing the protective tear film on your cornea to evaporate rapidly.

---

### 💡 Common Causes:
• **Tear Film Evaporation**: Prolonged screen time without blinking dries out the delicate ocular surface.
• **Meibomian Gland Dysfunction (MGD)**: The tiny oil glands along your eyelids get clogged, causing tears to lack the lipid layer that prevents evaporation.
• **Environmental Irritants**: Dry air conditioning, ceiling fan breeze, smoke, or Delhi NCR particulate dust (PM2.5).
• **Allergic Response**: Seasonal pollen or cosmetic sensitivity (often accompanied by itching).

---

### 🌿 Immediate Steps for Fast Relief:
• **Use Lubricating Eye Drops (Artificial Tears)**: Preservative-free **Carboxymethylcellulose (0.5% or 1%)** or **Sodium Hyaluronate** eye drops 3–4 times daily to instantly re-moisturize and protect the cornea.
• **The 20-20-20 Rule**: Every 20 minutes of screen work, look at an object 20 feet away for at least 20 seconds.
• **Conscious Blinking**: Close your eyelids fully and pause for 2 seconds before reopening. Repeat 10 times.
• **Clean Cool Compress**: Place a clean cloth soaked in cool water over closed eyes for 5–10 minutes to soothe active burning and inflammation.
• **Adjust Screen & Airflow**: Lower your monitor so you gaze slightly downward (reduces exposed eye surface), and keep direct AC or fan air away from your face.
• **Wear Blue-Cut AR Glasses**: If you work on screens >4 hours daily, Blue-Cut lenses filter high-energy blue-violet glare that aggravates burning.

---

⚠️ **Red Flag Warning**: If burning is accompanied by severe deep throbbing pain, sudden blurred vision, extreme sensitivity to light (photophobia), or thick yellowish discharge, please visit an eye specialist immediately.

At **Nayantara Opticals (Uttam Nagar, Pillar 703)**, we offer tear-film quality checks and zero-error digital refractions. Would you like to reserve a consultation?`,
    actions: [
      { label: "📅 Book Eye Checkup Slot", href: "/book" },
      { label: "🔍 Blue-Cut Digital Lenses", href: "/services" },
      { label: "💬 Chat on WhatsApp", isWhatsApp: true },
    ],
  },

  // 2. Headache / Eye Strain / Fatigue / Sir Dard
  {
    keywords: ["headache", "sir dard", "sar dard", "strain", "fatigue", "tired", "heavy eyes", "aankh bhari"],
    reply: `⚡ **Relieving Eye Strain & Screen-Induced Headaches:**

Headaches centered around your temples, brow bone, or behind the eyeballs are classic signs of **Asthenopia (Digital Eye Fatigue)** or an **uncorrected refractive error** (such as low astigmatism or early reading power).

---

### 🔬 What Causes This?
• **Ciliary Muscle Fatigue**: The focusing muscle inside your eye stays constantly contracted to focus at near distances (30–50 cm).
• **High-Energy Blue Light (HEV)**: Displays emit short-wavelength blue light (400–450 nm) which scatters easily, causing the eye to struggle to maintain sharp focus.
• **Uncorrected Cylindrical Power**: Even a minor 0.25D or 0.50D astigmatism forces the eye into continuous micro-accommodation, triggering tension headaches.

---

### 🛡️ Recommended Solutions:
• **Blue-Cut Anti-Reflective Lenses**: Block harmful digital glare and eliminate reflections from computer screens.
• **Proper Screen Distance**: Keep screens at least 20–24 inches (arm's length) away and roughly 15 degrees below eye level.
• **Computer Progressive / Anti-Fatigue Lenses**: For professionals working long hours, dedicated digital lenses provide a slight accommodative boost at the bottom.
• **Get a Computerized Vision Test**: An updated prescription often eliminates screen headaches entirely within 48 hours of wearing new glasses!`,
    actions: [
      { label: "📅 Book Eye Test (Uttam Nagar)", href: "/book" },
      { label: "🔍 Explore Blue-Cut Lenses", href: "/services" },
      { label: "📍 Store Directions", href: "/contact" },
    ],
  },

  // 3. Watery Eyes / Reflex Tearing / Pani Aana
  {
    keywords: ["water", "pani", "tearing", "overflow", "epiphora"],
    reply: `💧 **Why Are Your Eyes Watery? (Paradoxical Reflex Tearing):**

Believe it or not, the #1 cause of excessively watery eyes is **dry eye**! When your eyes become dry or irritated, your nervous system triggers an emergency reflex mechanism that floods the eye with aqueous tears. However, these tears lack natural oils, so they run down your cheeks without lubricating the cornea.

---

### 📋 Other Potential Causes:
• **Allergies & Pollution**: High dust, smoke, or pollen causing histamine release.
• **Blocked Tear Duct (Nasolacrimal Duct)**: Normal tears cannot drain into the nose.
• **Trichiasis / Misdirected Eyelashes**: An inward-turning eyelash scratching the eyeball.
• **Eye Strain**: Overworked eye muscles tearing up during prolonged phone or laptop use.

---

### 🩹 Actionable Tips:
• Use preservative-free lubricating artificial tear drops — counterintuitively, keeping the eye moisturized stops reflex over-tearing!
• Do not rub your eyes (rubbing releases more histamines and can scratch the cornea).
• Wear protective UV & wind-shielding glasses when outdoors in Delhi traffic.`,
    actions: [
      { label: "📅 Book Eye Test", href: "/book" },
      { label: "💬 Consult Optometrist on WhatsApp", isWhatsApp: true },
    ],
  },

  // 4. Red Eyes / Pink Eye / Conjunctivitis
  {
    keywords: ["red", "lal", "pink eye", "conjunctivitis", "bloodshot"],
    reply: `👁️ **Red / Bloodshot Eyes: Clinical Evaluation & Care:**

Redness occurs when tiny blood vessels in the conjunctiva (the clear membrane over the white sclera) become dilated or irritated.

---

### 🔍 Differentiating the Causes:
• **Digital Strain / Dryness**: Mild diffuse pinkish tint, worse at night or after screen use. Responds quickly to rest and lubricating drops.
• **Allergic Conjunctivitis**: Itchy, watery, pink eyes in both eyes, often triggered by dust or weather changes.
• **Viral / Bacterial Infection (Pink Eye)**: Sticky yellowish or green discharge, crusty eyelids upon waking, highly contagious.
• **Subconjunctival Hemorrhage**: A bright red localized blood patch (looks alarming, but usually harmless and resolves in 1–2 weeks).

---

### ⚠️ Immediate Self-Care:
• **Wash Hands Frequently**: Do not touch or rub the eyes.
• **Stop Wearing Contact Lenses** immediately until redness completely resolves.
• **Clean Cool Compress**: Relieves itching and swelling.
• **Avoid Over-The-Counter Steroid Drops**: Never use antibiotic or steroid drops without an eye doctor's direct prescription, as they can elevate intraocular pressure.`,
    actions: [
      { label: "📅 Reserve In-Store Eye Checkup", href: "/book" },
      { label: "📍 Visit Showroom (Pillar 703)", href: "/contact" },
      { label: "💬 WhatsApp Assistance", isWhatsApp: true },
    ],
  },

  // 5. Blurry Vision / Myopia / Power
  {
    keywords: ["blur", "dhundhla", "power", "number", "vision", "nazar", "cannot see", "cant see", "door ka", "pass ka"],
    reply: `🔍 **Understanding Blurry Vision & Optical Prescriptions:**

Blurry vision occurs when incoming light rays do not focus precisely onto your retina.

---

### 👓 Common Optical Conditions:
• **Myopia (Nearsightedness)**: Clear vision up close, but distant objects (road signs, TV, blackboard) appear blurry.
• **Hyperopia (Farsightedness)**: Close objects require extra focusing effort; causes strain during reading.
• **Astigmatism (Cylindrical Power)**: The cornea is shaped like a rugby ball instead of a basketball, causing distorted vision, shadows around letters, and night glare.
• **Presbyopia (Age 40+ Reading Difficulty)**: The natural crystalline lens loses flexibility, making reading phone texts difficult without +reading glasses or **Progressive Lenses**.

---

### 🌟 How Nayantara Opticals Helps:
• 100% computerized, unhurried 20-point autorefraction and trial frame balancing.
• Precision pupillary distance (PD) and fitting height measurement for zero adaptation issues.
• German digital lens surfacing for edge-to-edge optical clarity.`,
    actions: [
      { label: "📅 Book Accurate Eye Exam", href: "/book" },
      { label: "🔍 Progressive vs Single Vision", href: "/services" },
      { label: "👓 Explore Eyewear", href: "/shop" },
    ],
  },

  // 6. Myopia in Children
  {
    keywords: ["myopia", "child", "kid", "nearsighted", "power increase", "eyesight increase", "halt", "dims", "bacche", "bache"],
    reply: `👓 **Pediatric Myopia Management at Nayantara Opticals:**

Myopia (nearsightedness) causes distance vision to blur due to rapid elongation of the eyeball. Without early intervention, it can lead to higher optical power and retinal strain.

---

### 🚀 Clinically Proven Solutions We Provide:
• **HALT & DIMS Optical Technology Lenses**: Specialty spectacle lenses engineered to create peripheral myopic defocus, slowing myopia progression in kids by 50–60%.
• **Dual-Focus Contact Lenses**: Daily disposable soft lenses for active youth.
• **The 20-20-20 Rule**: Look at an object 20 feet away for 20 seconds every 20 minutes of screen work.
• **Natural Outdoor Light**: At least 90–120 minutes of outdoor play daily significantly protects growing eyes.

Would you like to reserve a dedicated 30-minute pediatric refraction slot?`,
    actions: [
      { label: "📅 Book Myopia Slot", href: "/book?type=myopia" },
      { label: "Explore Myopia Clinic", href: "/myopia-management" },
      { label: "💬 Chat on WhatsApp", isWhatsApp: true },
    ],
  },

  // 7. Face shape & Frames
  {
    keywords: ["face shape", "frame", "frames", "glass", "glasses", "specs", "shape", "look", "suit", "stylish", "chehra"],
    reply: `🕶️ **Finding the Perfect Frame for Your Face Geometry:**

• **Round Face**: Angular, **rectangular**, or geometric frames add contrast and make your face look slimmer.
• **Square Face**: **Round**, oval, or thin aviator frames soften strong jawlines beautifully.
• **Oval Face**: You're lucky! Almost any style fits — especially **Wayfarer**, **Aviator**, and bold acetate squares.
• **Heart-shaped Face**: **Rimless**, semi-rimless, or lightweight cat-eye frames balance a wider forehead.

---

### 🛠️ Frame Materials Available at Nayantara:
• **Pure Titanium**: Featherlight (<10g), hypoallergenic, rust-proof.
• **Handcrafted Acetate**: Deep rich tortoise/matte finishes, German spring hinges.
• **TR90 Swiss Memory**: Highly flexible, indestructible for active lifestyles.`,
    actions: [
      { label: "Try Frame Quiz", href: "/shop" },
      { label: "View Frame Collection", href: "/shop" },
    ],
  },

  // 8. Lenses
  {
    keywords: ["lens", "lenses", "progressive", "bifocal", "single vision", "blue cut", "anti glare", "computer", "photochromic", "transitions"],
    reply: `🔍 **Optical Lens Guide & Treatments:**

• **Single Vision**: One optical power throughout — ideal for everyday distance vision or dedicated reading glasses.
• **Progressive Lenses (No-line Multifocal)**: Seamless visual transition from distance (driving) to intermediate (computers) to near (reading) without any ugly lines.
• **Bifocal Lenses**: Classic two-part lenses with a visible dividing line between distance and reading.
• **Blue-Cut Filter (Computer Glasses)**: Blocks 400–450nm harmful blue-violet light from phones and monitors to eliminate eye fatigue, dry eyes, and headaches.
• **Anti-Reflective Coating (ARC)**: Reduces night glare from car headlights and eliminates screen reflections.
• **Photochromic / Transitions**: Clear transparent indoors, rapidly turn dark sunglasses under UV sunlight.`,
    actions: [
      { label: "View Lens Packages", href: "/services" },
      { label: "Book Lens Consultation", href: "/book" },
    ],
  },

  // 9. Eye Checkup / Appointments
  {
    keywords: ["appointment", "book", "slot", "eye test", "checkup", "exam", "doctor", "optometrist", "fees", "cost"],
    reply: `🩺 **Eye Examination & Doctor Appointments:**

Our store clinic features state-of-the-art computer-assisted autorefractors, subjective trial sets, and ocular health screening.

---

### ⏱️ Appointment Highlights:
• 20–30 minute unhurried, patient consultation.
• Pediatric and geriatric optical assessments.
• Digital prescription stored safely in our cloud database for easy re-orders.
• Available Monday to Saturday (10:30 AM – 8:00 PM) & Sunday (11:00 AM – 6:00 PM).`,
    actions: [
      { label: "📅 Book Eye Checkup Slot", href: "/book" },
      { label: "Store Timings & Directions", href: "/contact" },
    ],
  },

  // 10. Store Address & Timings
  {
    keywords: ["address", "location", "timing", "hours", "where", "store", "shop", "uttam nagar", "metro", "om vihar", "directions", "pillar"],
    reply: `📍 **Nayantara Opticals Showroom & Clinic Location:**

**Store Address:**
WZ-27, Shop No.1, Om Vihar, Phase-1, Near Metro Pillar 703, Uttam Nagar, New Delhi - 110059

**Landmark:** Opposite Metro Pillar 703 (Uttam Nagar West Metro Station).

**Operating Hours:**
• **Monday – Saturday:** 10:00 AM – 8:30 PM
• **Sunday:** 11:00 AM – 6:00 PM
• **Public Holidays:** Hours may vary — contact before visiting!

📞 **Phone:** ${SITE.phone}
💬 **WhatsApp:** Instant support available!`,
    actions: [
      { label: "🗺️ Get Google Maps Directions", href: SITE.directionsUrl, isExternal: true },
      { label: "Contact & Phone", href: "/contact" },
    ],
  },

  // 11. Contact Lenses
  {
    keywords: ["contact lens", "contact lenses", "contacts", "disposable", "toric", "solution"],
    reply: `👁️ **Contact Lenses at Nayantara Opticals:**

We dispense top global brands (Acuvue, Bausch & Lomb, Alcon):
• **Daily Disposables**: Ultimate hygiene, no cleaning solution needed. Great for sports and weddings.
• **Monthly Disposables**: High moisture silicone hydrogel for all-day comfort.
• **Toric Lenses**: Specially customized for cylindrical astigmatism power.

**Golden Safety Rule:** Never sleep wearing contact lenses, wash hands before insertion, and never clean lenses with tap water!`,
    actions: [
      { label: "Book Contact Lens Trial", href: "/book" },
      { label: "Explore Contact Lenses", href: "/shop" },
    ],
  },

  // 12. General Greetings & Buddy Chit-Chat
  {
    keywords: ["hi", "hello", "hey", "namaste", "good morning", "good evening", "kaise ho", "kaisa hai", "kya haal", "sunao", "tara"],
    reply: `Arre hello! Namaste! 👋 Main ekdum mast hoon, aap batao kaise ho? 😊

Nayantara Opticals par aapka swagat hai! Main aapki personal eyewear stylist aur optical buddy **Tara** hoon.

Batao yaar, aaj kya plan hai?
• Apne face shape ke hisab se mast sexy frame dekhna hai?
• Screen time ki wajah se aankhon me jalan ya sir me dard ho raha hai?
• Uttam Nagar clinic me **Free Computer Eye Test** book karna hai?`,
    actions: [
      { label: "👓 Frames by Face Shape", href: "/shop" },
      { label: "💻 Blue-Cut Screen Lenses", href: "/lenses" },
      { label: "📅 Book Free Eye Test", href: "/book" },
      { label: "📍 Store Near Pillar 703", href: "/contact" },
      { label: "💬 Chat on WhatsApp", isWhatsApp: true },
    ],
  },
];

export function EyecareChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnread(false);
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    // Play subtle audio if enabled
    if (soundEnabled && typeof Audio !== "undefined") {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch {
        // AudioContext silent fail
      }
    }

    try {
      // 1. Attempt to query backend LLM / Clinical Reasoning Endpoint
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text,
      }));

      const res = await apiRequest<{ reply: string; actions?: ChatAction[] | undefined; source?: string }>("/chat", {
        method: "POST",
        body: JSON.stringify({ message: query, history: historyPayload }),
      });

      if (res.success && res.data?.reply) {
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actions: res.data.actions,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        if (!isOpen) setHasUnread(true);
        return;
      }
    } catch (err) {
      console.warn("Backend chat unavailable, using clinical knowledge base:", err);
    }

    // 2. Intelligent Client-Side Fallback Engine
    const lower = query.toLowerCase();
    const match = KNOWLEDGE_BASE.find((k) => k.keywords.some((kw) => lower.includes(kw)));

    let responseText = "";
    let responseActions = match?.actions;

    if (match) {
      responseText = match.reply;
    } else {
      const isHindi =
        /[\u0900-\u097F]/.test(query) ||
        /\b(kya|kaise|kyun|batao|chahiye|nahi|naam|kon|mera|apna|code|python|karo|likho)\b/i.test(query);

      if (isHindi) {
        responseText = `Haha arre yaar! Main aapki **Nayantara Opticals** ki eyewear stylist aur optical buddy **Tara** hoon! 😄

Coding, general trivia ya sports me toh main thodi kacchi hoon, par aapke face shape ke hisab se ekdum mast frame recommend karna, screen strain se bachana aur hamare Uttam Nagar clinic me **Free Computer Eye Test** book karna meri superpower hai! 👓✨

Batao yaar, aaj kya plan hai?
• Apne face shape ke hisab se naya frame dekhna hai?
• Laptop/phone screen pe kaam karke aankhon me strain/headache ho raha hai?
• Hamare clinic par doctor checkup slot book karein?`;
        responseActions = [
          { label: "👓 Explore Frame Catalog", href: "/shop" },
          { label: "📅 Book Free Eye Test", href: "/book" },
          { label: "📍 Store Near Pillar 703", href: "/contact" },
          { label: "💬 Chat on WhatsApp", isWhatsApp: true },
        ];
      } else {
        responseText = `Haha hey there! As your personal optical buddy & eyewear stylist at **Nayantara Opticals**, general trivia or coding isn't my superpower! 😄

But when it comes to finding flattering frames for your face, soothing screen eye fatigue with blue-cut lenses, or setting up a zero-error eye checkup at our Uttam Nagar clinic, I've got your back! 👓✨

What are we shopping or checking out today?
• Finding a flattering frame shape for your face
• Blue-Cut or Progressive lenses for screen comfort
• Booking a free 20-point digital eye test in Uttam Nagar`;
        responseActions = [
          { label: "👓 Explore Frames", href: "/shop" },
          { label: "📅 Book Free Eye Exam", href: "/book" },
          { label: "🔍 Lens Technologies", href: "/services" },
          { label: "💬 WhatsApp Us", isWhatsApp: true },
        ];
      }
    }

    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      sender: "bot",
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actions: responseActions,
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);

    if (!isOpen) {
      setHasUnread(true);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <>
      {/* 1. Floating Chat Bubble Button (Replaces WhatsApp static button) */}
      <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-primary px-4 py-3.5 text-primary-foreground shadow-lift hover:bg-emerald-deep hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Open Optical & Eyecare AI Chatbot"
            title="Ask Tara — Optical & Eyecare Advisor"
          >
            <div className="relative">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-4 w-4 text-white" />
              </span>
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-primary animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold leading-none text-white">Ask Optical AI</p>
              <p className="text-[10px] text-white/80 leading-tight mt-0.5">Eyecare, Frames & Clinic</p>
            </div>
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white shadow-sm">
                1
              </span>
            )}
          </button>
        )}
      </div>

      {/* 2. Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-card sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[440px] sm:h-[650px] sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-border/80 sm:shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-emerald-800 to-ink p-3.5 sm:p-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
                  <Glasses className="h-5 w-5 text-champagne" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-400 ring-2 ring-primary" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-semibold text-sm text-white">Tara</h3>
                  <Badge variant="outline" className="bg-white/15 text-white/90 border-white/20 text-[9px] px-1.5 py-0">
                    Eyecare Buddy
                  </Badge>
                </div>
                <p className="text-[11px] text-white/75 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Nayantara Opticals · Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 sm:p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors"
                title={soundEnabled ? "Mute audio" : "Enable audio"}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={handleResetChat}
                className="p-2 sm:p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors"
                title="Restart conversation"
                aria-label="Restart Conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 sm:p-1.5 rounded-full hover:bg-white/10 text-white transition-colors bg-white/10 sm:bg-transparent"
                aria-label="Close Chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Clinic Info Strip */}
          <div className="bg-primary/5 px-4 py-2 border-b border-border text-[11px] text-muted-foreground flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 text-primary shrink-0" /> Uttam Nagar, Metro Pillar 703
            </span>
            <span className="flex items-center gap-1 text-primary font-medium shrink-0">
              <Clock className="h-3 w-3" /> Open Today
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm leading-relaxed space-y-2.5 ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted/40 border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  <FormattedMessageText text={m.text} />

                  {/* Contextual Action Buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-border/40">
                      {m.actions.map((act, idx) => (
                        act.isWhatsApp ? (
                          <a
                            key={idx}
                            href={waLink("Hi Nayantara Opticals, I was chatting with Tara and have a question.")}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 px-2.5 py-1 rounded-full border border-emerald-500/30 transition-all"
                          >
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </a>
                        ) : act.isExternal ? (
                          <a
                            key={idx}
                            href={act.href || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1 rounded-full border border-primary/20 transition-all"
                          >
                            {act.label}
                          </a>
                        ) : (
                          <Link
                            key={idx}
                            to={act.href || "/"}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1 rounded-full border border-primary/20 transition-all"
                          >
                            {act.label}
                          </Link>
                        )
                      ))}
                    </div>
                  )}

                  <span className={`block text-[9px] text-right mt-1 opacity-60`}>
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === "user" && (
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-xs text-muted-foreground">
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-muted/40 border border-border p-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Tara is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-background/60 border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider shrink-0 mr-1">
              Ask:
            </span>
            <button
              onClick={() => handleSend("Mera face round hai, mere face shape ke liye best frame recommend karo")}
              className="text-[11px] whitespace-nowrap bg-primary/10 text-primary font-medium hover:bg-primary/20 px-2.5 py-1 rounded-full border border-primary/20 transition-colors"
            >
              👓 Frame for my face shape
            </button>
            <button
              onClick={() => handleSend("Laptop aur phone screen pe kaam karke sir me dard hota hai, blue cut lenses batao")}
              className="text-[11px] whitespace-nowrap bg-muted/70 hover:bg-primary/10 hover:text-primary px-2.5 py-1 rounded-full border border-border/80 transition-colors"
            >
              💻 Blue-cut screen glasses
            </button>
            <button
              onClick={() => handleSend("Uttam Nagar clinic me Free Computerized Eye Test kaise book karein?")}
              className="text-[11px] whitespace-nowrap bg-muted/70 hover:bg-primary/10 hover:text-primary px-2.5 py-1 rounded-full border border-border/80 transition-colors"
            >
              📅 Free Eye Test booking
            </button>
            <button
              onClick={() => handleSend("Website se lens kaise kharidein?")}
              className="text-[11px] whitespace-nowrap bg-muted/70 hover:bg-primary/10 hover:text-primary px-2.5 py-1 rounded-full border border-border/80 transition-colors"
            >
              🛒 Lens kaise kharidein?
            </button>
            <button
              onClick={() => handleSend("Doctor ka prescription parcha kaise upload karein?")}
              className="text-[11px] whitespace-nowrap bg-muted/70 hover:bg-primary/10 hover:text-primary px-2.5 py-1 rounded-full border border-border/80 transition-colors"
            >
              📄 Prescription upload
            </button>
            <button
              onClick={() => handleSend("Nayantara Opticals store address aur timings kya hain?")}
              className="text-[11px] whitespace-nowrap bg-muted/70 hover:bg-primary/10 hover:text-primary px-2.5 py-1 rounded-full border border-border/80 transition-colors"
            >
              📍 Metro Pillar 703 address
            </button>
          </div>

          {/* Input Bar with safe-area spacing */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 sm:p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-card border-t border-border flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Tara anything about frames, lenses, eye tests..."
              className="flex-1 bg-muted/50 rounded-full px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            <Button
              type="submit"
              size="icon"
              variant="hero"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full shrink-0 shadow-md"
              disabled={!inputValue.trim()}
              title="Send question"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
