// Comprehensive list of known disposable and temporary email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "fakemailgenerator.com",
  "maildrop.cc",
  "mohmal.com",
  "generator.email",
  "crazymailing.com",
  "emailondeck.com",
  "inboxbear.com",
  "burnermail.io",
  "tempail.com",
  "mytemp.email",
  "minutemail.com",
  "tempinbox.com",
  "disposablemail.com",
  "tmailor.com",
  "internxt.com",
  "privaterelay.appleid.com", // unless accepted
  "dropmail.me",
]);

export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
