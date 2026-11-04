import type { Device, LinkRecord, LinkStats } from "./types";
import { isExpired } from "./validate";

const DAY = 24 * 60 * 60 * 1000;
export const KEEP_DAYS = 30;
export const CHART_DAYS = 14;
export const MAX_REFERRER_KEYS = 50;

/** UTC day bucket key, `YYYY-MM-DD`. */
export function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Coarse device class from a User-Agent string. The UA itself is never stored. */
export function classifyDevice(userAgent: string | null | undefined): Device {
  const ua = (userAgent ?? "").toLowerCase();
  if (!ua) return "other";
  if (/bot|crawl|spider|slurp|facebookexternalhit|preview|headless|curl\/|wget|python-requests|httpclient|go-http|node-fetch|axios|monitor|lighthouse/.test(ua)) {
    return "bot";
  }
  if (/mobi|android|iphone|ipad|ipod|windows phone|blackberry|opera mini/.test(ua)) return "mobile";
  if (/mozilla|windows|macintosh|linux|x11|cros/.test(ua)) return "desktop";
  return "other";
}

/** Referrer host (without `www.`), or null when absent, invalid, or from the app itself. */
export function referrerHost(referrer: string | null | undefined, ownHosts: readonly string[] = []): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (ownHosts.map((h) => h.toLowerCase()).includes(url.host.toLowerCase())) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!host || host.length > 100) return null;
    return host;
  } catch {
    return null;
  }
}

export function normalizeDevices(d: Partial<Record<Device, number>> | undefined): Record<Device, number> {
  return { mobile: d?.mobile ?? 0, desktop: d?.desktop ?? 0, bot: d?.bot ?? 0, other: d?.other ?? 0 };
}

/** Drops day buckets older than `keepDays`, returning a new object. */
export function pruneDaily(daily: Record<string, number>, now: number, keepDays: number = KEEP_DAYS): Record<string, number> {
  const oldest = dayKey(now - (keepDays - 1) * DAY);
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(daily)) if (k >= oldest) out[k] = v;
  return out;
}

/** The last `days` day buckets ending today (UTC), oldest first, zero-filled. */
export function lastDays(daily: Record<string, number>, now: number, days: number = CHART_DAYS): { date: string; clicks: number }[] {
  const out: { date: string; clicks: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayKey(now - i * DAY);
    out.push({ date, clicks: daily[date] ?? 0 });
  }
  return out;
}

export function topReferrers(referrers: Record<string, number>, limit = 5): { host: string; clicks: number }[] {
  return Object.entries(referrers)
    .map(([host, clicks]) => ({ host, clicks }))
    .sort((a, b) => b.clicks - a.clicks || a.host.localeCompare(b.host))
    .slice(0, limit);
}

export function toStats(link: LinkRecord, now: number): LinkStats {
  return {
    code: link.code,
    url: link.url,
    createdAt: link.createdAt,
    expiresAt: link.expiresAt,
    expired: isExpired(link, now),
    clicks: link.clicks,
    lastClickedAt: link.lastClickedAt,
    daily: lastDays(link.daily, now),
    referrers: topReferrers(link.referrers),
    devices: normalizeDevices(link.devices),
  };
}
