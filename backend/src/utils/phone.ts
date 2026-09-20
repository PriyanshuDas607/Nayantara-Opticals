/**
 * Normalizes Indian and international phone numbers into standard format.
 * Example: "9876543210" -> "+919876543210"
 * Example: "09876543210" -> "+919876543210"
 * Example: "+919876543210" -> "+919876543210"
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[\s\-().]/g, "").trim();
  if (!cleaned) return "";

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.startsWith("91") && cleaned.length >= 11) {
    return `+${cleaned}`;
  }

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  return `+91${cleaned}`;
}

export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  // Match standard Indian phone numbers (+91 followed by 7-12 digits) or valid international E.164
  return /^\+91[0-9]{7,12}$/.test(normalized) || /^\+[0-9]{7,15}$/.test(normalized);
}
