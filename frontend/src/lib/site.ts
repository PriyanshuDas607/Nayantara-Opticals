export const SITE = {
  name: "Nayantara Opticals",
  tagline: "Clarity, crafted since 1990",
  yearsExperience: "35+",
  address:
    "WZ-27, Shop No.1, Om Vihar, Phase-1, Near Metro Pillar 703, Uttam Nagar, New Delhi-110059",
  addressShort: "Om Vihar, Uttam Nagar, New Delhi",
  // TODO: replace with the shop's real WhatsApp link (https://wa.me/<number>)
  whatsappUrl: "https://wa.me/?text=Hi%20Nayantara%20Opticals%2C%20I%27d%20like%20some%20help",
  // TODO: replace with the shop's real phone number
  phoneLabel: "Call the store",
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Nayantara+Opticals+Om+Vihar+Uttam+Nagar+New+Delhi",
  hours: [
    { day: "Monday – Saturday", time: "10:00 AM – 8:30 PM" },
    { day: "Sunday", time: "11:00 AM – 6:00 PM" },
    { day: "Public holidays", time: "Hours may vary — WhatsApp to confirm" },
  ],
} as const;

export function waLink(message: string) {
  const base = SITE.whatsappUrl.split("?")[0];
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
