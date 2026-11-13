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

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  return cleaned;
}

export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  // Match standard 10-digit Indian mobile numbers prefixed with +91 (starts with 6, 7, 8, or 9)
  return /^\+91[6-9]\d{9}$/.test(normalized);
}
