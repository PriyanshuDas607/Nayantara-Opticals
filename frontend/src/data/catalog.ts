import frame01 from "@/assets/frame-01.jpg";
import frame02 from "@/assets/frame-02.jpg";
import frame03 from "@/assets/frame-03.jpg";
import sun01 from "@/assets/sun-01.jpg";
import sun02 from "@/assets/sun-02.jpg";
import lens01 from "@/assets/lens-01.jpg";
import hearing01 from "@/assets/hearing-01.jpg";
import vision01 from "@/assets/vision-01.jpg";

export const CATEGORIES = [
  { id: "eyeglasses", label: "Eyeglasses", blurb: "Everyday frames, precision fitted" },
  { id: "sunglasses", label: "Sunglasses", blurb: "UV protection with presence" },
  { id: "contact-lenses", label: "Contact Lenses", blurb: "Daily, monthly & toric" },
  { id: "hearing-aids", label: "Hearing Aids", blurb: "Discreet listening support" },
  { id: "vision-aids", label: "Vision Aids", blurb: "Low-vision magnification" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  price: number;
  compareAt?: number;
  image: string;
  badges: string[];
  style: string;
  material: string;
  colors: { name: string; token: string }[];
  sizes: string[];
  faceShapes: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  dimensions: { lensWidth: number; bridge: number; templeLength: number; weight: number };
  description: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "nt-aurelia",
    name: "Aurelia Round",
    brand: "Nayantara Atelier",
    category: "eyeglasses",
    price: 3499,
    compareAt: 4299,
    image: frame01,
    badges: ["Bestseller"],
    style: "Round",
    material: "Acetate",
    colors: [
      { name: "Tortoise", token: "oklch(0.48 0.09 55)" },
      { name: "Ink", token: "oklch(0.28 0.03 250)" },
      { name: "Champagne", token: "oklch(0.83 0.062 84)" },
    ],
    sizes: ["Small", "Medium"],
    faceShapes: ["Square", "Heart", "Diamond"],
    inStock: true,
    rating: 4.8,
    reviews: 126,
    dimensions: { lensWidth: 48, bridge: 21, templeLength: 145, weight: 24 },
    description:
      "Hand-polished Italian acetate with a warm tortoise depth. A softly rounded silhouette that balances angular features and sits light on the bridge.",
  },
  {
    id: "nt-meridian",
    name: "Meridian Gold",
    brand: "Nayantara Atelier",
    category: "eyeglasses",
    price: 4899,
    image: frame02,
    badges: ["New"],
    style: "Rectangle",
    material: "Metal",
    colors: [
      { name: "Gold", token: "oklch(0.83 0.09 88)" },
      { name: "Silver", token: "oklch(0.85 0.01 250)" },
    ],
    sizes: ["Medium", "Large"],
    faceShapes: ["Round", "Oval"],
    inStock: true,
    rating: 4.7,
    reviews: 84,
    dimensions: { lensWidth: 52, bridge: 18, templeLength: 145, weight: 17 },
    description:
      "A whisper-thin metal rim with adjustable nose pads. Understated, boardroom-ready, and barely there at 17 grams.",
  },
  {
    id: "nt-graphite",
    name: "Graphite Squareline",
    brand: "Vireo",
    category: "eyeglasses",
    price: 5699,
    image: frame03,
    badges: ["Titanium"],
    style: "Square",
    material: "Titanium",
    colors: [
      { name: "Matte Black", token: "oklch(0.25 0.01 250)" },
      { name: "Gunmetal", token: "oklch(0.5 0.01 250)" },
    ],
    sizes: ["Medium", "Large"],
    faceShapes: ["Round", "Oval", "Heart"],
    inStock: true,
    rating: 4.9,
    reviews: 61,
    dimensions: { lensWidth: 54, bridge: 17, templeLength: 148, weight: 15 },
    description:
      "Flex-hinge titanium with a matte finish that resists fingerprints. Built for long screen days and long commutes.",
  },
  {
    id: "nt-solstice",
    name: "Solstice Aviator",
    brand: "Vireo",
    category: "sunglasses",
    price: 4299,
    compareAt: 5199,
    image: sun01,
    badges: ["Polarised", "UV400"],
    style: "Aviator",
    material: "Metal",
    colors: [
      { name: "Emerald", token: "oklch(0.5 0.11 165)" },
      { name: "Gold", token: "oklch(0.83 0.09 88)" },
    ],
    sizes: ["Medium", "Large"],
    faceShapes: ["Square", "Oval", "Heart"],
    inStock: true,
    rating: 4.8,
    reviews: 152,
    dimensions: { lensWidth: 58, bridge: 14, templeLength: 140, weight: 26 },
    description:
      "Polarised green gradient lenses cut glare off glass and asphalt. Classic double-bridge aviator in a warm gold finish.",
  },
  {
    id: "nt-amber",
    name: "Amber Cat-Eye",
    brand: "Nayantara Atelier",
    category: "sunglasses",
    price: 3899,
    image: sun02,
    badges: ["Limited"],
    style: "Cat-Eye",
    material: "Acetate",
    colors: [
      { name: "Amber", token: "oklch(0.68 0.13 62)" },
      { name: "Rose Smoke", token: "oklch(0.72 0.06 25)" },
    ],
    sizes: ["Small", "Medium"],
    faceShapes: ["Round", "Square", "Oval"],
    inStock: false,
    rating: 4.6,
    reviews: 47,
    dimensions: { lensWidth: 55, bridge: 18, templeLength: 142, weight: 28 },
    description:
      "An oversized cat-eye in translucent amber acetate. Sculpted uplift at the temples with full UV400 tinted lenses.",
  },
  {
    id: "nt-daily30",
    name: "ClearDay Daily 30",
    brand: "OptiCare",
    category: "contact-lenses",
    price: 1299,
    image: lens01,
    badges: ["Daily", "30 pack"],
    style: "Daily disposable",
    material: "Silicone Hydrogel",
    colors: [{ name: "Clear", token: "oklch(0.9 0.02 200)" }],
    sizes: ["8.6 BC"],
    faceShapes: ["Any"],
    inStock: true,
    rating: 4.7,
    reviews: 213,
    dimensions: { lensWidth: 14, bridge: 0, templeLength: 0, weight: 0 },
    description:
      "Breathable silicone hydrogel daily lenses with high water content. Fresh pair each morning, nothing to clean at night. Fitting consultation recommended.",
  },
  {
    id: "nt-monthly6",
    name: "AquaMonth Toric 6",
    brand: "OptiCare",
    category: "contact-lenses",
    price: 2199,
    image: lens01,
    badges: ["For astigmatism"],
    style: "Monthly toric",
    material: "Silicone Hydrogel",
    colors: [{ name: "Clear", token: "oklch(0.9 0.02 200)" }],
    sizes: ["8.7 BC"],
    faceShapes: ["Any"],
    inStock: true,
    rating: 4.5,
    reviews: 88,
    dimensions: { lensWidth: 14, bridge: 0, templeLength: 0, weight: 0 },
    description:
      "Stabilised toric design for cylindrical prescriptions. Six monthly lenses per box. Requires an in-store fitting.",
  },
  {
    id: "nt-echo",
    name: "Echo BTE Mini",
    brand: "Sonare",
    category: "hearing-aids",
    price: 18999,
    compareAt: 21999,
    image: hearing01,
    badges: ["Rechargeable"],
    style: "Behind-the-ear",
    material: "Polymer",
    colors: [
      { name: "Beige", token: "oklch(0.82 0.05 70)" },
      { name: "Graphite", token: "oklch(0.4 0.01 250)" },
    ],
    sizes: ["One size"],
    faceShapes: ["Any"],
    inStock: true,
    rating: 4.6,
    reviews: 39,
    dimensions: { lensWidth: 0, bridge: 0, templeLength: 0, weight: 3 },
    description:
      "Discreet rechargeable behind-the-ear aid with directional microphones and a full-day battery. Fitted and tuned in store.",
  },
  {
    id: "nt-lumen",
    name: "Lumen Handheld Magnifier",
    brand: "Vista Aid",
    category: "vision-aids",
    price: 2499,
    image: vision01,
    badges: ["Low vision"],
    style: "Handheld",
    material: "Polymer",
    colors: [{ name: "Graphite", token: "oklch(0.35 0.01 250)" }],
    sizes: ["5x"],
    faceShapes: ["Any"],
    inStock: true,
    rating: 4.4,
    reviews: 26,
    dimensions: { lensWidth: 65, bridge: 0, templeLength: 0, weight: 120 },
    description:
      "LED-illuminated 5x magnifier with a distortion-free aspheric lens. Helpful for reading fine print, labels and documents.",
  },
];

export const FILTER_OPTIONS = {
  sizes: ["Small", "Medium", "Large", "One size"],
  materials: ["Acetate", "Metal", "Titanium", "Silicone Hydrogel", "Polymer"],
  styles: ["Round", "Rectangle", "Square", "Aviator", "Cat-Eye", "Daily disposable", "Monthly toric", "Handheld", "Behind-the-ear"],
  faceShapes: ["Round", "Oval", "Square", "Heart", "Diamond", "Any"],
  colors: ["Tortoise", "Ink", "Champagne", "Gold", "Silver", "Matte Black", "Gunmetal", "Emerald", "Amber", "Clear", "Beige", "Graphite", "Rose Smoke"],
};

export const LENS_PACKAGES = [
  {
    id: "single-vision",
    name: "Single Vision",
    delta: 0,
    recommended: false,
    summary: "One prescription strength across the whole lens.",
    bestFor: "Distance-only or reading-only prescriptions",
    benefits: [
      "Widest clear field of view",
      "Fastest to adapt to",
      "Included with every frame at no extra cost",
    ],
  },
  {
    id: "progressive",
    name: "Progressive",
    delta: 3500,
    recommended: true,
    summary: "Distance, intermediate and near zones blended into one lens.",
    bestFor: "Wearers who need both distance and reading correction",
    benefits: [
      "No visible line across the lens",
      "One pair instead of two",
      "Digital surfacing for wider corridors",
    ],
  },
  {
    id: "blue-antiglare",
    name: "Blue Filter + Anti-Glare",
    delta: 1200,
    recommended: false,
    summary: "Multi-coat lens that cuts reflections and filters blue-violet light.",
    bestFor: "Long screen hours and night driving",
    benefits: [
      "Reduced reflections in photos and calls",
      "Scratch-resistant hard coat",
      "Easy-clean hydrophobic layer",
    ],
  },
] as const;
