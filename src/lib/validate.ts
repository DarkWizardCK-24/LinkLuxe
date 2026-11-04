import type { ExpiryOption } from "./types";

export const MAX_URL_LENGTH = 2048;
export const ALIAS_MIN = 3;
export const ALIAS_MAX = 32;

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

/** Words that would collide with app routes or static files. Compared lower-case. */
export const RESERVED_ALIASES: ReadonlySet<string> = new Set([
  "api", "about", "shorten", "links", "link", "stats", "status", "_next", "favicon", "favicon.ico",
  "robots", "robots.txt", "sitemap", "sitemap.xml", "manifest", "manifest.webmanifest", "icon", "icons",
  "logo", "og", "admin", "login", "logout", "signup", "register", "dashboard", "settings", "static",
  "public", "assets", "new", "create", "help", "terms", "privacy", "contact", "www", "app", "null",
  "undefined", "expired", "not-found", "404", "500",
]);

function hasScheme(value: string): boolean {
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  // "localhost:3000/x" and "example.com:8080" are host:port, not a scheme.
  return !/^[a-z0-9.-]+:\d+(?:[/?#]|$)/i.test(value);
}

// Only http/https. A missing scheme becomes https://. Links to `ownHosts` are rejected (redirect loops).
export function normalizeUrl(input: string, ownHosts: readonly string[] = []): Result<string> {
  const raw = (input ?? "").trim();
  if (!raw) return fail("Enter a URL to shorten.");
  if (raw.length > MAX_URL_LENGTH) return fail(`That URL is too long (max ${MAX_URL_LENGTH} characters).`);
  if (/[\u0000- \u007f]/.test(raw)) return fail("A URL cannot contain spaces or control characters.");

  let candidate = raw;
  if (candidate.startsWith("//")) candidate = `https:${candidate}`;
  else if (!hasScheme(candidate)) candidate = `https://${candidate}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return fail("That does not look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return fail("Only http:// and https:// links can be shortened.");
  }
  if (url.username || url.password) return fail("URLs containing a username or password are not allowed.");
  const hostname = url.hostname;
  if (!hostname || (!hostname.includes(".") && !hostname.includes(":"))) {
    return fail("That does not look like a valid URL.");
  }
  const own = ownHosts.map((h) => h.trim().toLowerCase()).filter(Boolean);
  if (own.includes(url.host.toLowerCase())) {
    return fail("That link already points to LinkLuxe, so it cannot be shortened again.");
  }
  if (url.href.length > MAX_URL_LENGTH) return fail(`That URL is too long (max ${MAX_URL_LENGTH} characters).`);
  return { ok: true, value: url.href };
}

const ALIAS_RE = /^[A-Za-z0-9_-]+$/;

/** Validates an optional custom alias. Returns the trimmed alias. */
export function validateAlias(input: string): Result<string> {
  const alias = (input ?? "").trim();
  if (alias.length < ALIAS_MIN || alias.length > ALIAS_MAX) {
    return fail(`Aliases must be ${ALIAS_MIN}-${ALIAS_MAX} characters long.`);
  }
  if (!ALIAS_RE.test(alias)) return fail("Use only letters, numbers, hyphens and underscores.");
  if (RESERVED_ALIASES.has(alias.toLowerCase())) return fail("That alias is reserved. Please pick another.");
  return { ok: true, value: alias };
}

export const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "1d", label: "1 day" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

const DAY = 24 * 60 * 60 * 1000;
const EXPIRY_MS: Record<Exclude<ExpiryOption, "never">, number> = { "1d": DAY, "7d": 7 * DAY, "30d": 30 * DAY };

export function parseExpiry(value: unknown): ExpiryOption | null {
  if (value === undefined || value === null || value === "") return "never";
  return value === "never" || value === "1d" || value === "7d" || value === "30d" ? value : null;
}

export function expiryToTimestamp(option: ExpiryOption, now: number): number | null {
  return option === "never" ? null : now + EXPIRY_MS[option];
}

export function isExpired(link: { expiresAt: number | null }, now: number): boolean {
  return link.expiresAt !== null && link.expiresAt <= now;
}
