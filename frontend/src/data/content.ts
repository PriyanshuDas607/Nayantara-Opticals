export type Service = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  points: string[];
  icon: "eye" | "glasses" | "contact" | "ear" | "scan" | "book";
};

export const SERVICES: Service[] = [
  {
    id: "myopia-management",
    title: "Myopia Management",
    summary: "Structured follow-up programmes for children and young adults with changing distance vision.",
    detail:
      "We track prescription changes over time and discuss the options your eye care professional may recommend — specialised spectacle lenses, soft lens designs, or scheduled reviews. Every plan is documented so parents can see progress at each visit.",
    points: ["Baseline measurement & records", "Scheduled review visits", "Parent-friendly progress reports"],
    icon: "scan",
  },
  {
    id: "eye-care",
    title: "Eye Care & Optical Consultation",
    summary: "Unhurried consultations to understand how you actually use your eyes each day.",
    detail:
      "Screen time, driving, night glare, reading distance — we map your visual routine before recommending anything. Consultations are booked in dedicated slots so nobody feels rushed.",
    points: ["Lifestyle-led recommendations", "Frame fit & comfort assessment", "Written summary you can keep"],
    icon: "eye",
  },
  {
    id: "prescriptions",
    title: "Prescription Support",
    summary: "Bring an existing prescription or record one with us — we handle the interpretation into lenses.",
    detail:
      "Upload a photo of your prescription or type in your OD/OS values. We explain what each field means in plain language and confirm the details with you before any lens is ordered.",
    points: ["Photo or manual entry", "Plain-language explanation", "Double-check before ordering"],
    icon: "book",
  },
  {
    id: "contact-lenses",
    title: "Contact Lenses",
    summary: "Fitting, trials and refills across daily, monthly and toric designs.",
    detail:
      "First-time wearers get a guided handling session so inserting and removing lenses stops feeling intimidating. Refills can be arranged over WhatsApp once your fit is on record.",
    points: ["First-fit handling session", "Trial pairs before you commit", "WhatsApp refill reminders"],
    icon: "contact",
  },
  {
    id: "hearing-aids",
    title: "Hearing Aids",
    summary: "Discreet hearing devices, demonstrated and tuned in store.",
    detail:
      "Try devices in a quiet room and on the street outside before deciding. We handle programming, fitting comfort and follow-up adjustments as you adapt.",
    points: ["In-store demonstration", "Comfort fitting", "Free follow-up tuning"],
    icon: "ear",
  },
  {
    id: "vision-aids",
    title: "Vision Aids Services",
    summary: "Magnification and low-vision support for reading, hobbies and daily independence.",
    detail:
      "Handheld and stand magnifiers, task lighting and high-contrast reading aids — matched to the exact tasks you find hardest, and demonstrated with your own reading material.",
    points: ["Task-based matching", "Lighting recommendations", "Family guidance session"],
    icon: "glasses",
  },
];

export const TESTIMONIALS = [
  {
    name: "R. Sharma",
    location: "Uttam Nagar",
    rating: 5,
    text: "Took my father here for progressive lenses. They explained every option without pushing the most expensive one. The fitting adjustments afterwards were free.",
  },
  {
    name: "Priya K.",
    location: "Dwarka",
    rating: 5,
    text: "I have a strong cylindrical power and had given up on contacts. They arranged a trial pair first, then adjusted the fit. Wearing them daily now.",
  },
  {
    name: "A. Verma",
    location: "Janakpuri",
    rating: 4,
    text: "Good frame selection at genuinely reasonable prices. The blue filter coating made a real difference to my evening screen work.",
  },
  {
    name: "Meenakshi T.",
    location: "Vikaspuri",
    rating: 5,
    text: "My daughter's power was changing every year. The review schedule they set up means we finally have proper records to show the doctor.",
  },
  {
    name: "S. Ahuja",
    location: "Uttam Nagar",
    rating: 5,
    text: "Thirty-five years in the same neighbourhood says everything. Three generations of my family get their glasses here.",
  },
  {
    name: "Nikhil B.",
    location: "Nawada",
    rating: 4,
    text: "Hearing aid demo was patient and thorough. They let me walk outside with the device before I decided anything.",
  },
];

export const REVIEW_SUMMARY = { average: 4.8, count: 640 };

export const FACE_SHAPE_GUIDE = [
  { shape: "Round", advice: "Angular and rectangular frames add definition." },
  { shape: "Oval", advice: "Most shapes work — balance width with your cheekbones." },
  { shape: "Square", advice: "Round and oval frames soften a strong jawline." },
  { shape: "Heart", advice: "Wider bottoms and light rims balance the forehead." },
  { shape: "Diamond", advice: "Cat-eye and oval frames highlight the cheekbones." },
];
