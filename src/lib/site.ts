export const SITE_NAME = "LinkLuxe";
export const SITE_TAGLINE = "Short links, beautifully done.";
export const SITE_DESCRIPTION =
  "Elegant short links with custom aliases, QR codes, expiry and private click analytics. No account, no tracking of you.";

/** Public origin of the app. Set NEXT_PUBLIC_HOST in production (e.g. https://linkluxe.app). */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_HOST;
  if (!configured) return "http://localhost:3000";
  return (/^https?:\/\//i.test(configured) ? configured : `https://${configured}`).replace(/\/+$/, "");
}
