import { config } from "../config/index.js";

export interface ChatAction {
  label: string;
  href?: string;
  isExternal?: boolean;
  isWhatsApp?: boolean;
}

export interface ChatResponse {
  reply: string;
  actions?: ChatAction[];
  source: "llm" | "clinical_engine";
}

export class ChatService {
  /**
   * Main entry point for generating conversational optometry and store responses.
   * Prioritizes Gemini LLM if GEMINI_API_KEY is configured, otherwise utilizes
   * the comprehensive clinical optometry reasoning engine.
   */
  static async reply(message: string, history: { role: "user" | "model"; text: string }[] = []): Promise<ChatResponse> {
    const geminiKey = (config.geminiApiKey || process.env.GEMINI_API_KEY || "").trim();

    if (geminiKey) {
      try {
        const llmResult = await this.queryGemini(message, history, geminiKey);
        if (llmResult) {
          return {
            reply: llmResult,
            actions: this.deriveSmartActions(message),
            source: "llm",
          };
        }
      } catch (err) {
        console.warn("Gemini API call failed, gracefully falling back to clinical engine:", err);
      }
    }

    // Comprehensive Clinical Optometry & Optical Reasoning Engine
    return {
      ...this.clinicalReasoning(message),
      source: "clinical_engine",
    };
  }

  /**
   * Query Google Gemini API with clinical optometrist persona and store context
   */
  /**
   * Check if user query relates to Nayantara Opticals, opticals, eyewear, or vision health.
   */
  public static isOpticalOrStoreRelated(query: string): boolean {
    const q = query.toLowerCase().trim();
    if (!q) return false;

    // Direct greetings and friendly conversation starters are allowed
    const greetings = [
      "hi", "hello", "hey", "namaste", "namaskar", "good morning", "good evening", "good afternoon",
      "tara", "kaise ho", "kaisa hai", "kya haal", "bhai", "yaar", "dost", "buddy", "sunao", "help", "help me"
    ];
    if (greetings.some((g) => q === g || q.startsWith(`${g} `) || q.endsWith(` ${g}`) || q.includes(g))) {
      return true;
    }

    const opticalKeywords = [
      // Eyewear & Optics
      "eye", "eyes", "aankh", "aankhon", "nazar", "vision", "sight", "optometrist", "optical", "opticals",
      "nayantara", "frame", "frames", "glass", "glasses", "chashma", "chashme", "specs", "spectacle", "spectacles",
      "sunglass", "sunglasses", "shades", "lens", "lenses", "contact lens", "contact lenses", "contacts",
      "progressive", "bifocal", "single vision", "blue cut", "bluecut", "blue light", "anti glare", "antiglare",
      "photochromic", "transition", "transitions", "crizal", "zeiss", "essilor", "high index", "1.67", "1.74",
      "titanium", "acetate", "tr90", "rimless", "cat eye", "aviator", "wayfarer", "power", "number",

      // Symptoms & Health
      "burn", "burning", "jalan", "chubhan", "dry eye", "dry eyes", "sookhi aankh", "strain", "fatigue",
      "headache", "sir dard", "sar dard", "blur", "blurry", "dhundhla", "watery", "pani", "tearing",
      "red eye", "redness", "lal aankh", "pink eye", "conjunctivitis", "itch", "itchy", "scratchy",
      "myopia", "hyperopia", "astigmatism", "presbyopia", "pediatric", "child", "kid", "bacche", "bache",
      "halt", "dims", "20-20-20", "drop", "drops", "tear", "retina", "cornea",

      // Store & Website Services / Navigation Guide
      "appointment", "book", "slot", "clinic", "checkup", "test", "exam", "doctor", "consult", "consultation",
      "store", "shop", "address", "location", "timing", "hours", "uttam nagar", "om vihar", "metro", "pillar 703",
      "warranty", "guarantee", "replace", "replacement", "refund", "return", "repair", "service", "price",
      "cost", "fees", "discount", "offer", "order", "prescription", "parcha", "face shape", "face", "try on",
      "quiz", "phone", "contact", "whatsapp",
      "kharid", "kharide", "kharidna", "buy", "purchase", "guide", "tour", "website", "kaise", "steps",
      "process", "features", "explore", "navigate", "kahan se", "cart", "bag", "checkout", "how to buy",
      "how to order", "how to book", "how to upload", "upload"
    ];

    return opticalKeywords.some((keyword) => q.includes(keyword));
  }

  /**
   * Query Google Gemini API with strict Nayantara Opticals & eyecare guardrails + Website Tour Guide
   */
  private static async queryGemini(
    message: string,
    history: { role: "user" | "model"; text: string }[],
    apiKey: string
  ): Promise<string | null> {
    const systemPrompt = `You are "Tara" (तारा), an authentic, warm, friendly personal eyewear stylist, optometrist buddy, and vision guide at "Nayantara Opticals" in Uttam Nagar, New Delhi.

✨ YOUR PERSONA & VOICE:
- You are NOT a rigid, robotic automated chatbot. You are a lively, warm, caring, authentic human-like friend and stylist who genuinely loves helping people find great frames and care for their eyes!
- When the user talks in Hindi or Hinglish (e.g., "bhai", "kaisa hai", "konsa frame lu", "aankhon me jalan hoti hai", "chashma chahiye", "kaise ho yaar"): Reply in natural, lively, empathetic Hinglish (the way a warm, friendly Delhiite friend speaks with respect and care, e.g. "Arre hello! Main ekdum badhiya, aap sunao! Chashma dekh rahe ho ya screen time zyada hone se aankhein thak gayi hain?").
- When the user talks in English: Speak in a modern, warm, conversational, friendly and reassuring voice (not corporate or stiff).
- NEVER use stiff robotic clichés like "I am strictly programmed to...", "As an AI language model...", "According to my database...", etc. Speak directly and personally.
- Keep your answers lively, concise, easy to read with neat bullet points, emojis where appropriate, and always end with a caring follow-up question or helpful suggestion!

🏪 NAYANTARA OPTICALS STORE & CLINIC DETAILS:
- Address: WZ-27, Shop No.1, Om Vihar, Phase-1, Directly opposite Metro Pillar 703 (Uttam Nagar West Metro Station), New Delhi - 110059.
- Store Hours: Monday to Saturday 10:00 AM – 8:30 PM | Sunday 11:00 AM – 6:00 PM.
- Phone / WhatsApp: +91 98765 43210.
- Free Perks: 100% Free computerized 20-point digital eye test at our clinic, 1-Year Frame Warranty, 7-Day Hassle-Free Replacement, and Free Lifetime In-Store Nose-Pad Replacements and Frame Alignments!

👓 YOUR OPTICAL & STYLING SUPERPOWERS:
1. Face Shape Styling:
   - Round Face: Angular, rectangular, square, or geometric/hexagonal frames (they add sharp structure and balance the softness).
   - Square Face: Round, oval, or soft cat-eye frames (they soften strong jawlines).
   - Oval Face: Extremely lucky! Almost every frame looks great — Aviators, Wayfarers, Clubmasters, Geometric frames.
   - Heart Face: Light acetate, rimless, or slightly wider bottom frames.
2. Screen Strain, Headaches & Dry Eyes:
   - Explain screen fatigue simply: Screen staring reduces blink rate from 15/min down to 5/min, causing tear evaporation, burning, and headaches.
   - Recommend: Blue-Cut Anti-Reflective Lenses (filter harmful 400-450nm HEV screen glare), 20-20-20 rule (every 20 minutes, look 20 feet away for 20 seconds), and lubricating eye drops (like Carboxymethylcellulose).
   - Red flags (deep severe throbbing eye pain, sudden vision drop, bright flashes): Urgently advise an in-person ophthalmologist checkup!
3. Lens Technologies Made Simple:
   - Single Vision: Everyday distance or reading.
   - Blue-Cut + Anti-Glare (+₹1,200): Must-have for IT pros, students, gamers, heavy phone users.
   - Progressive Lenses (+₹3,500): Seamless multi-focal view (Distance + Computer + Reading) without any line for 40+ age.
   - Photochromic / Transitions: Automatically darkens in sunlight outdoors, clear crystal indoors.
4. Website & Shopping Guidance:
   - Catalog: Explore frames on [/shop](/shop).
   - Lens packages: Compare on [/lenses](/lenses) and [/services](/services).
   - Clinic checkup booking: Select slot on [/book](/book).
   - Prescription upload: Upload doctor's slip safely on [/prescription](/prescription).
   - Cart & Checkout: [/cart](/cart).

💬 HANDLING UNRELATED TOPICS GRACEFULLY:
If someone asks something completely off-topic (e.g., writing python code, cricket scores, politics, or recipes):
Do NOT give a dry refusal or say "I am strictly programmed to...". Instead, smile playfully like a buddy, gently deflect, and bring the conversation back:
- Hinglish Example: "Haha yaar, coding ya cricket toh mera area nahi hai! 😄 Main toh chashmon, cool frames aur aapki aankhon ka khayal rakhne me expert hoon. Chalo batao — naya chashma dekhna hai ya screen pe kaam karke aankhein thak gayi hain?"
- English Example: "Haha, I wish I could help with that, but optics and eyewear styling are my true superpowers! 😄 Tell me — are you looking for a fresh new frame, suffering from screen fatigue, or planning to get your eyes tested?"`;

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Samajh gayi! Main Tara hoon — Nayantara Opticals ki warm, lively eyewear stylist aur optometrist buddy. I will chat naturally, empathetically, and knowledgeably with every customer in Hinglish or English!" }],
      },
      ...history.slice(-6).map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const models = ["gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-flash-latest", "gemini-3.5-flash"];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            return candidateText.trim();
          }
        } else {
          const errText = await response.text().catch(() => "");
          console.warn(`Gemini model ${model} HTTP ${response.status}: ${errText.slice(0, 150)}`);
        }
      } catch (err) {
        console.warn(`Error invoking Gemini model ${model}:`, err);
      }
    }

    return null;
  }

  /**
   * Derive relevant quick-action buttons based on user message content
   */
  private static deriveSmartActions(message: string): ChatAction[] {
    const q = message.toLowerCase();
    const actions: ChatAction[] = [];

    // Website Tour & Purchase Guidance
    if (q.includes("lens kaise") || q.includes("buy lens") || q.includes("lens kharid") || q.includes("how to buy lens") || q.includes("lens order")) {
      return [
        { label: "🔍 View Lens Packages", href: "/lenses" },
        { label: "👓 Browse Frames", href: "/shop" },
        { label: "📄 Upload Prescription", href: "/prescription" },
      ];
    }
    if (q.includes("chashma kaise") || q.includes("frame kaise") || q.includes("how to order") || q.includes("how to buy") || q.includes("frame order") || q.includes("chashma kharid")) {
      return [
        { label: "👓 Explore Frame Catalog", href: "/shop" },
        { label: "🔍 Lens Packages", href: "/lenses" },
        { label: "📅 Book Eye Test", href: "/book" },
      ];
    }
    if (q.includes("prescription") || q.includes("parcha") || q.includes("upload")) {
      return [
        { label: "📄 Prescription Vault", href: "/prescription" },
        { label: "📅 Book Eye Test", href: "/book" },
        { label: "👓 Browse Frames", href: "/shop" },
      ];
    }
    if (q.includes("website") || q.includes("tour") || q.includes("guide") || q.includes("features") || q.includes("kya kya")) {
      return [
        { label: "👓 Shop Catalog", href: "/shop" },
        { label: "🔍 Lens Guide", href: "/lenses" },
        { label: "📅 Book Clinic Slot", href: "/book" },
      ];
    }

    // Health & Clinical Services
    if (q.includes("burn") || q.includes("dry") || q.includes("strain") || q.includes("headache") || q.includes("test") || q.includes("checkup") || q.includes("exam") || q.includes("appointment") || q.includes("book")) {
      actions.push({ label: "📅 Book Eye Checkup Slot", href: "/book" });
    }
    if (q.includes("frame") || q.includes("glass") || q.includes("specs") || q.includes("face") || q.includes("shape")) {
      actions.push({ label: "👓 Explore Frame Catalog", href: "/shop" });
    }
    if (q.includes("lens") || q.includes("blue") || q.includes("progressive") || q.includes("computer")) {
      actions.push({ label: "🔍 Lens Technologies", href: "/services" });
    }
    if (q.includes("myopia") || q.includes("child") || q.includes("kid")) {
      actions.push({ label: "👶 Myopia Management", href: "/myopia-management" });
    }
    if (q.includes("address") || q.includes("location") || q.includes("timing") || q.includes("where") || q.includes("metro")) {
      actions.push({ label: "📍 Store Directions", href: "/contact" });
    }

    // Default actions if none matched
    if (actions.length === 0) {
      actions.push(
        { label: "📅 Book Eye Test", href: "/book" },
        { label: "👓 Explore Frames", href: "/shop" },
        { label: "💬 WhatsApp Us", isWhatsApp: true }
      );
    } else {
      actions.push({ label: "💬 WhatsApp Us", isWhatsApp: true });
    }

    return actions.slice(0, 3);
  }

  /**
   * Comprehensive Clinical Optometry & Eyecare Rule Engine
   */
  private static clinicalReasoning(message: string): { reply: string; actions: ChatAction[] } {
    const q = message.toLowerCase().trim();

    // 0A. LENS PURCHASE GUIDE ("Lens kaise kharidein" / "How to buy lenses")
    if (
      q.includes("lens kaise") ||
      q.includes("how to buy lens") ||
      q.includes("how to buy lenses") ||
      q.includes("lens kharid") ||
      q.includes("buy lens") ||
      q.includes("order lens") ||
      ((q.includes("lens") || q.includes("lenses")) && (q.includes("kharid") || q.includes("buy") || q.includes("order") || q.includes("kaise le") || q.includes("chahiye")))
    ) {
      return {
        reply: `🛒 **Nayantara Opticals Website par Lenses Kharidne ka Step-by-Step Guide:**

Aap hamari website se aasaani se customized prescription lenses order kar sakte hain. Yeh raha pura process:

---

### 🔹 Step 1: Apna Lens Package Select Karein
Aap hamare [/lenses](/lenses) ya [/services](/services) page par jakar apni zaroorat ke anusaar lens technology chun sakte hain:
• **Single Vision**: Door (distance) ya paas (reading) ke liye. Yeh har frame ke sath included hote hain.
• **Blue Filter + Anti-Glare (+₹1,200)**: Phone, laptop screens aur night driving ke liye best (glare-free, scratch-resistant, hydrophobic).
• **Progressive Lenses (+₹3,500)**: 40+ age ke liye no-line multifocal — distance, computer aur reading teeno zones ka seamless blend.
• **Photochromic / Transitions**: Dhoop mein dark sunglasses ban jaate hain aur indoor transparent rehte hain.

---

### 🔹 Step 2: Apna Pasandida Frame Chunein
Lenses aapke frame ke hisab se custom-cut hote hain:
• [/shop](/shop) par jayein aur Acetate, Titanium ya TR90 frames browse karein.
• Agar chehre ke hisab se confuse hain, toh hamara **Frame Shape Quiz** try karein!

---

### 🔹 Step 3: Prescription (Doctor ka Parcha) Attach Karein
• [/prescription](/prescription) page par jakar doctor ke parche ki photo ya PDF upload karein.
• Ya manual power (Right Eye OD aur Left Eye OS: SPH, CYL, AXIS, PD) enter karein.
• *Tip:* Agar updated number nahi hai, toh [/book](/book) par jakar hamare Uttam Nagar clinic mein **Free 20-Point Computerized Eye Test** book kar sakte hain!

---

### 🔹 Step 4: Bag mein Add karein & Checkout Karein
• Frame aur lens configure karke **"Add to bag"** par click karein.
• [/cart](/cart) par jayein aur Home Delivery ya Showroom Pickup (Metro Pillar 703, Uttam Nagar) select karein.`,
        actions: [
          { label: "🔍 View Lens Packages", href: "/lenses" },
          { label: "👓 Browse Frames", href: "/shop" },
          { label: "📄 Upload Prescription", href: "/prescription" },
        ],
      };
    }

    // 0B. FRAME / EYEGLASSES PURCHASE GUIDE ("Chashma kaise order karein" / "How to buy glasses")
    if (
      q.includes("chashma kaise") ||
      q.includes("frame kaise") ||
      q.includes("how to order glasses") ||
      q.includes("how to buy glasses") ||
      q.includes("how to buy frame") ||
      q.includes("chashma kharid") ||
      q.includes("frame kharid") ||
      ((q.includes("frame") || q.includes("chashma") || q.includes("glasses") || q.includes("specs")) && (q.includes("kharid") || q.includes("buy") || q.includes("order") || q.includes("kaise")))
    ) {
      return {
        reply: `👓 **Nayantara Opticals par Chashma (Frame) Order Karne ka Tarika:**

Website par frame chunna aur order karna behad aasan hai:

---

### 1️⃣ Frame Browse Karein ([/shop](/shop)):
• [/shop](/shop) page open karein.
• Left filters se shape select karein (Round, Rectangle, Square, Aviator, Cat-Eye, Rimless).
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
      };
    }

    // 0C. CLINIC APPOINTMENT / EYE TEST BOOKING GUIDE ("Appointment kaise book karein")
    if (
      q.includes("appointment kaise") ||
      q.includes("eye test kaise") ||
      q.includes("checkup kaise") ||
      q.includes("how to book appointment") ||
      q.includes("how to book eye test") ||
      ((q.includes("appointment") || q.includes("eye test") || q.includes("checkup") || q.includes("test")) && (q.includes("kaise") || q.includes("how to") || q.includes("book")))
    ) {
      return {
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
   • Aapko turant WhatsApp aur SMS par booking confirmation mil jayega!

📍 **Clinic Address**: WZ-27, Shop No.1, Om Vihar Phase-1, Metro Pillar 703 ke samne, Uttam Nagar, New Delhi.`,
        actions: [
          { label: "📅 Book Eye Test Slot", href: "/book" },
          { label: "📍 Store Directions", href: "/contact" },
          { label: "💬 WhatsApp Us", isWhatsApp: true },
        ],
      };
    }

    // 0D. PRESCRIPTION UPLOAD GUIDE ("Prescription kaise upload karein")
    if (
      q.includes("prescription kaise") ||
      q.includes("parcha kaise") ||
      q.includes("upload kaise") ||
      q.includes("how to upload prescription") ||
      ((q.includes("prescription") || q.includes("parcha")) && (q.includes("upload") || q.includes("kaise") || q.includes("dale") || q.includes("daale")))
    ) {
      return {
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
      };
    }

    // 0E. WEBSITE TOUR & SITEMAP OVERVIEW ("Website tour" / "Website par kya kya hai")
    if (
      (q.includes("website") && (q.includes("tour") || q.includes("guide") || q.includes("kya") || q.includes("features") || q.includes("batao") || q.includes("samjhao") || q.includes("pages") || q.includes("chalaye") || q.includes("use"))) ||
      q.includes("website tour") ||
      q.includes("website guide") ||
      q.includes("tour guide") ||
      q.includes("website par kya") ||
      q.includes("website kaise") ||
      q.includes("how to use website") ||
      q.includes("website features") ||
      q.includes("website explain")
    ) {
      return {
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
      };
    }

    // 1. BURNING EYES / DRY EYES / IRRITATION / JALAN
    if (
      q.includes("burn") ||
      q.includes("jalan") ||
      q.includes("chubhan") ||
      q.includes("irritat") ||
      q.includes("dry eye") ||
      q.includes("gritty") ||
      q.includes("stinging") ||
      q.includes("itchy") ||
      q.includes("scratchy") ||
      q.includes("sand in eye")
    ) {
      return {
        reply: `🔥 **Why Your Eyes Are Burning & Immediate Relief Steps:**

A burning sensation is most frequently caused by **Dry Eye Syndrome (DES)** or **Digital Eye Strain (Computer Vision Syndrome)**. When focusing on phones or laptops, your natural blinking rate drops by over 60%, allowing the protective tear film on your cornea to evaporate rapidly.

---

### 💡 Common Causes:
1. **Tear Film Evaporation**: Prolonged screen time without blinking dries out the delicate ocular surface.
2. **Meibomian Gland Dysfunction (MGD)**: The tiny oil glands along your eyelids get clogged, causing tears to lack the lipid layer that prevents evaporation.
3. **Environmental Irritants**: Dry air conditioning, ceiling fan breeze, smoke, or Delhi NCR particulate dust (PM2.5).
4. **Allergic Response**: Seasonal pollen or cosmetic sensitivity (often accompanied by itching).

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
      };
    }

    // 2. HEADACHE FROM SCREENS / EYE STRAIN / TIRED EYES / DARD
    if (
      q.includes("headache") ||
      q.includes("sir dard") ||
      q.includes("sar dard") ||
      q.includes("strain") ||
      q.includes("fatigue") ||
      q.includes("tired eyes") ||
      q.includes("heavy eyes") ||
      q.includes("aankh bhari")
    ) {
      return {
        reply: `⚡ **Relieving Eye Strain & Screen-Induced Headaches:**

Headaches centered around your temples, brow bone, or behind the eyeballs are classic signs of **Asthenopia (Digital Eye Fatigue)** or an **uncorrected refractive error** (such as low astigmatism or early reading power).

---

### 🔬 What Causes This?
• **Ciliary Muscle Fatigue**: The focusing muscle inside your eye stays constantly contracted to focus at near distances (30–50 cm).
• **High-Energy Blue Light (HEV)**: Displays emit short-wavelength blue light (400–450 nm) which scatters easily, causing the eye to struggle to maintain sharp focus.
• **Uncorrected Cylindrical Power**: Even a minor 0.25D or 0.50D astigmatism forces the eye into continuous micro-accommodation, triggering tension headaches.

---

### 🛡️ Recommended Solutions:
1. **Blue-Cut Anti-Reflective Lenses**: Block harmful digital glare and eliminate reflections from computer screens.
2. **Proper Screen Distance**: Keep screens at least 20–24 inches (arm's length) away and roughly 15 degrees below eye level.
3. **Computer Progressive / Anti-Fatigue Lenses**: For professionals working long hours, dedicated digital lenses provide a slight accommodative boost at the bottom.
4. **Get a Computerized Vision Test**: An updated prescription often eliminates screen headaches entirely within 48 hours of wearing new glasses!`,
        actions: [
          { label: "📅 Book Eye Test (Uttam Nagar)", href: "/book" },
          { label: "🔍 Explore Blue-Cut Lenses", href: "/services" },
          { label: "📍 Store Directions", href: "/contact" },
        ],
      };
    }

    // 3. WATERY EYES / EPIPHORA / PANI AANA
    if (q.includes("water") || q.includes("pani") || q.includes("tearing") || q.includes("overflow") || q.includes("epiphora")) {
      return {
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
1. Use preservative-free lubricating artificial tear drops — counterintuitively, keeping the eye moisturized stops reflex over-tearing!
2. Do not rub your eyes (rubbing releases more histamines and can scratch the cornea).
3. Wear protective UV & wind-shielding glasses when outdoors in Delhi traffic.`,
        actions: [
          { label: "📅 Book Comprehensive Eye Test", href: "/book" },
          { label: "💬 Consult Optometrist on WhatsApp", isWhatsApp: true },
        ],
      };
    }

    // 4. RED EYES / CONJUNCTIVITIS / PINK EYE / AANKH LAL
    if (q.includes("red") || q.includes("lal") || q.includes("pink eye") || q.includes("conjunctivitis") || q.includes("bloodshot")) {
      return {
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
      };
    }

    // 5. BLURRY VISION / DHUNDHLA / POWER INCREASE / CHASHMA
    if (
      q.includes("blur") ||
      q.includes("dhundhla") ||
      q.includes("power") ||
      q.includes("number") ||
      q.includes("vision") ||
      q.includes("nazar") ||
      q.includes("cannot see") ||
      q.includes("cant see") ||
      q.includes("door ka") ||
      q.includes("pass ka")
    ) {
      return {
        reply: `🔍 **Understanding Blurry Vision & Optical Prescriptions:**

Blurry vision occurs when incoming light rays do not focus precisely onto your retina. Depending on where the blur happens:

---

### 👓 Common Optical Conditions:
1. **Myopia (Nearsightedness)**: Clear vision up close, but distant objects (road signs, TV, classroom blackboard) appear blurry.
2. **Hyperopia (Farsightedness)**: Close objects require extra focusing effort; causes strain during reading.
3. **Astigmatism (Cylindrical Power)**: The cornea is shaped like a rugby ball instead of a basketball, causing distorted vision, shadows around letters, and night glare.
4. **Presbyopia (Age 40+ Reading Difficulty)**: The natural crystalline lens loses flexibility, making reading phone texts or books difficult without +reading glasses or **Progressive Lenses**.

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
      };
    }

    // 6. PEDIATRIC MYOPIA MANAGEMENT / KIDS EYESIGHT
    if (
      q.includes("myopia") ||
      q.includes("child") ||
      q.includes("kid") ||
      q.includes("bacche") ||
      q.includes("bache") ||
      q.includes("halt") ||
      q.includes("dims") ||
      q.includes("power badh")
    ) {
      return {
        reply: `👶 **Pediatric Myopia Control Clinic at Nayantara Opticals:**

If your child's eye power is increasing by -0.50D or -1.00D every year, standard single-vision lenses are not enough. Rapid eyeball elongation (axial length increase) can lead to high myopia and retinal risks later in life.

---

### 🚀 Advanced Clinical Solutions Available:
• **HALT & DIMS Optical Technology Lenses**: Engineered with hundreds of peripheral micro-lenslets that create myopic defocus, signaling the eye to slow its growth. Proven in clinical trials to **slow progression by up to 50–60%**.
• **The 20-20-20 Rule & Outdoor Play**: Clinical studies prove that at least **90–120 minutes of natural outdoor sunlight daily** significantly protects children's vision.
• **Dual-Focus Daily Lenses**: Specialty soft contact lenses for active teenagers.

Reserve a dedicated 30-minute pediatric refraction slot with our chief optometrist today.`,
        actions: [
          { label: "📅 Book Myopia Slot", href: "/book?type=myopia" },
          { label: "Explore Myopia Clinic", href: "/myopia-management" },
          { label: "💬 Chat on WhatsApp", isWhatsApp: true },
        ],
      };
    }

    // 7. LENSES: PROGRESSIVE / BIFOCAL / BLUE CUT / PHOTOCHROMIC
    if (
      q.includes("lens") ||
      q.includes("progressive") ||
      q.includes("bifocal") ||
      q.includes("blue cut") ||
      q.includes("crizal") ||
      q.includes("transition") ||
      q.includes("photochromic") ||
      q.includes("coating") ||
      q.includes("anti glare")
    ) {
      return {
        reply: `🔬 **Optical Lens Guide: Choosing the Right Technology:**

1. **Progressive Lenses (No-Line Multifocal)**:
   • Three focal zones in a seamless lens: Distance (top for driving), Intermediate (middle for laptop), and Near (bottom for mobile/reading).
   • Zero dividing line — looks like normal young glasses!
2. **Blue-Cut Filters**:
   • Blocks 400–450 nm harmful blue light from monitors and mobile screens.
   • Eliminates digital eye strain, reduces burning, and supports natural sleep cycles.
3. **Anti-Reflective Coating (ARC)**:
   • Eliminates ghost reflections and starburst glare during night driving.
4. **Photochromic / Transitions**:
   • Crystal clear indoors, instantly turns into dark sunglasses under UV sunlight outdoors.
5. **High Index (1.60, 1.67, 1.74)**:
   • Up to 40% thinner and lighter for high minus/plus prescriptions.`,
        actions: [
          { label: "🔍 View Lens Packages", href: "/services" },
          { label: "📅 Book Lens Consultation", href: "/book" },
          { label: "👓 Explore Frames", href: "/shop" },
        ],
      };
    }

    // 8. FRAMES & FACE SHAPES
    if (
      q.includes("frame") ||
      q.includes("face shape") ||
      q.includes("chehra") ||
      q.includes("stylish") ||
      q.includes("specs") ||
      q.includes("titanium") ||
      q.includes("acetate")
    ) {
      return {
        reply: `👓 **Find Your Perfect Frame Matching Your Face Shape:**

• **Round Face**: Rectangular, square, or geometric frames add structure and lengthen the face.
• **Square Face**: Round, oval, or thin aviator frames soften bold jawlines and look incredibly chic.
• **Oval Face**: Most versatile shape! Cat-eye, wayfarer, and bold rectangular acetate frames fit naturally.
• **Heart-shaped Face**: Rimless, semi-rimless, or lightweight aviators balance a broader forehead.

---

### 🛠️ Premium Materials at Nayantara:
1. **Pure Japanese Titanium**: Ultra-light (<10g), rust-proof, hypoallergenic.
2. **Italian Mazzucchelli Acetate**: Deep lustrous colors, handmade polish, German 5-barrel hinges.
3. **Swiss TR90 Memory Polymer**: Flexible, featherlight, unbreakable for everyday rough use.`,
        actions: [
          { label: "👓 Explore Frame Catalog", href: "/shop" },
          { label: "📅 Book Free Frame Styling", href: "/book" },
        ],
      };
    }

    // 9. STORE LOCATION, TIMINGS, CONTACT
    if (
      q.includes("address") ||
      q.includes("location") ||
      q.includes("timing") ||
      q.includes("hours") ||
      q.includes("where") ||
      q.includes("shop") ||
      q.includes("store") ||
      q.includes("uttam nagar") ||
      q.includes("om vihar") ||
      q.includes("metro") ||
      q.includes("pillar")
    ) {
      return {
        reply: `📍 **Nayantara Opticals Showroom & Vision Care Clinic:**

**Address:**
WZ-27, Shop No. 1, Om Vihar Phase-1, Near Metro Pillar 703, Uttam Nagar, New Delhi - 110059.
*(Directly opposite Metro Pillar 703, walking distance from Uttam Nagar West Metro Station)*

**Store Hours:**
• **Monday – Saturday:** 10:00 AM – 8:30 PM
• **Sunday:** 11:00 AM – 6:00 PM

📞 **Phone:** +91 98765 43210
💬 **WhatsApp:** Instant one-on-one booking & customer support available!`,
        actions: [
          { label: "📍 View on Google Maps", href: "https://maps.google.com/?q=Nayantara+Opticals+Uttam+Nagar+Delhi", isExternal: true },
          { label: "📅 Book In-Store Slot", href: "/book" },
          { label: "💬 Chat on WhatsApp", isWhatsApp: true },
        ],
      };
    }

    // 10. GREETINGS & CASUAL
    if (
      q === "hi" ||
      q === "hello" ||
      q === "hey" ||
      q === "namaste" ||
      q.includes("kaise ho") ||
      q.includes("good morning") ||
      q.includes("good evening")
    ) {
      return {
        reply: `Namaste! 🙏 I'm **Tara**, your dedicated Optical & Eyecare Advisor at **Nayantara Opticals**.

I can assist you with:
• **Eye Symptoms & Care**: Burning eyes, dry eyes, strain, headaches, red eyes.
• **Lens Options**: Blue-cut computer lenses, progressives, photochromic transitions.
• **Frame Fitting**: Matching frame styles to your face geometry & lightweight materials.
• **Children's Vision**: Pediatric myopia management (HALT/DIMS lenses).
• **Clinic Bookings**: Free eye testing slots in Uttam Nagar, New Delhi.

How can I help you today?`,
        actions: [
          { label: "📅 Book Eye Test", href: "/book" },
          { label: "👓 Explore Frames", href: "/shop" },
          { label: "🔍 Lens Treatments", href: "/services" },
        ],
      };
    }

    // 11. CONVERSATIONAL DEFLECTION FOR OUT-OF-SCOPE / CASUAL CHIT-CHAT
    if (!ChatService.isOpticalOrStoreRelated(message)) {
      const isHindi =
        /[\u0900-\u097F]/.test(message) ||
        /\b(kya|kaise|kyun|batao|chahiye|nahi|naam|kon|mera|apna|code|python|karo|likho|bhai|yaar|dost|haal|chal)\b/i.test(message);

      if (isHindi) {
        return {
          reply: `Haha arre yaar! Main aapki **Nayantara Opticals** ki eyewear stylist aur optical buddy **Tara** hoon! 😄

Coding, general knowledge ya sports me toh main thodi kacchi hoon, par aapke chehre ke hisab se ekdum mast frame recommend karna, screen strain se bachana aur hamare Uttam Nagar clinic me free eye test set karna meri superpower hai! 👓✨

Batao yaar, aaj kya plan hai?
• Apne face shape ke hisab se naya frame dekhna hai?
• Screen pe kaam karke aankhon me strain/headache ho raha hai?
• Free digital computer eye test book karein?`,
          actions: [
            { label: "👓 Explore Frame Catalog", href: "/shop" },
            { label: "📅 Book Free Eye Test", href: "/book" },
            { label: "📍 Store Near Pillar 703", href: "/contact" },
          ],
        };
      }

      return {
        reply: `Haha hey there! As your optical buddy and eyewear stylist at **Nayantara Opticals**, general trivia or coding isn't my superpower! 😄

But when it comes to finding the perfect frames for your face, soothing screen eye fatigue, or setting up a zero-error eye checkup at our Uttam Nagar clinic, I've got your back! 👓✨

What are we shopping or checking out today?
• Finding a flattering frame shape for your face
• Blue-Cut or Progressive lenses for screen comfort
• Booking a free 20-point digital eye test`,
        actions: [
          { label: "👓 Explore Frames", href: "/shop" },
          { label: "📅 Book Free Eye Exam", href: "/book" },
          { label: "🔍 Lens Technologies", href: "/services" },
        ],
      };
    }

    // 12. GENERAL OPTICAL / EYECARE FALLBACK (When question is optical but doesn't match a specific bucket)
    return {
      reply: `Arre bilkul! Nayantara Opticals me aapki aankhon ki health aur styling hamari sabse badi priority hai! 👁️✨

Agar aap confused hain ki kahan se shuru karein, toh yeh meri top recommendations hain:
1. **Face Shape Framing**: Round face par angular frames aur square face par round frames sabse attractive lagte hain. Aap [/shop](/shop) par try kar sakte hain!
2. **Screen Protection**: Agar roz 4+ ghante laptop ya phone use karte hain, toh **Blue-Cut lenses** aur **20-20-20 rule** follow karein taaki aankhein fresh rahein.
3. **Free In-Store Eye Test**: Hamare Uttam Nagar clinic (Opposite Metro Pillar 703) par computerized 20-point digital test bilkul free hota hai.

Aap kis baare me aur detail me baat karna chahenge?`,
      actions: [
        { label: "📅 Book Free Clinic Slot", href: "/book" },
        { label: "👓 Explore Frame Catalog", href: "/shop" },
        { label: "💬 Chat on WhatsApp", isWhatsApp: true },
      ],
    };
  }
}
