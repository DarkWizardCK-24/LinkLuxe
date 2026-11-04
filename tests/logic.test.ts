import { describe, expect, it } from "vitest";
import { classifyDevice, dayKey, lastDays, pruneDaily, referrerHost, topReferrers } from "@/lib/analytics";
import { generateCode, secureInt } from "@/lib/code";

describe("generateCode", () => {
  it("makes 7 char base62 codes", () => {
    for (let i = 0; i < 200; i++) expect(generateCode()).toMatch(/^[0-9A-Za-z]{7}$/);
  });
  it("is not constant", () => {
    expect(new Set(Array.from({ length: 50 }, () => generateCode())).size).toBeGreaterThan(45);
  });
  it("uses the injected picker", () => {
    expect(generateCode(4, () => 0)).toBe("0000");
    expect(generateCode(2, (max) => max - 1)).toBe("zz");
  });
});

describe("secureInt", () => {
  it("stays in range and covers it", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const n = secureInt(6);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(6);
      seen.add(n);
    }
    expect(seen.size).toBe(6);
  });
});

describe("analytics helpers", () => {
  it("classifies devices", () => {
    expect(classifyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148")).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (Linux; Android 14; Pixel 7) Mobile Safari")).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120")).toBe("desktop");
    expect(classifyDevice("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe("bot");
    expect(classifyDevice("curl/8.0")).toBe("bot");
    expect(classifyDevice("")).toBe("other");
  });
  it("extracts referrer hosts", () => {
    expect(referrerHost("https://www.news.example.com/post/1?x=2")).toBe("news.example.com");
    expect(referrerHost("not a url")).toBeNull();
    expect(referrerHost(null)).toBeNull();
    expect(referrerHost("https://me.app/x", ["me.app"])).toBeNull();
  });
  it("buckets by UTC day, prunes and fills", () => {
    const now = Date.UTC(2026, 5, 15, 12);
    expect(dayKey(now)).toBe("2026-06-15");
    const pruned = pruneDaily({ "2026-06-15": 2, "2026-05-01": 9, "2026-05-17": 1 }, now);
    expect(pruned).toEqual({ "2026-06-15": 2, "2026-05-17": 1 });
    const days = lastDays({ "2026-06-15": 4, "2026-06-13": 1 }, now, 3);
    expect(days).toEqual([
      { date: "2026-06-13", clicks: 1 },
      { date: "2026-06-14", clicks: 0 },
      { date: "2026-06-15", clicks: 4 },
    ]);
  });
  it("ranks referrers", () => {
    expect(topReferrers({ a: 1, b: 5, c: 3 }, 2)).toEqual([{ host: "b", clicks: 5 }, { host: "c", clicks: 3 }]);
  });
});

import { toStats } from "@/lib/analytics";
import { toLinkRecord } from "@/lib/links-db";
import { Timestamp } from "firebase/firestore";

describe("Firestore document mapping", () => {
  it("converts timestamps and fills missing counters", () => {
    const rec = toLinkRecord({
      code: "Promo", url: "https://example.com/", ownerUid: "u1",
      createdAt: Timestamp.fromMillis(1000), expiresAt: null, clicks: 3, lastClickedAt: Timestamp.fromMillis(2000),
      daily: { "2026-06-15": 3 }, referrers: {}, devices: { mobile: 3 },
    });
    expect(rec.createdAt).toBe(1000);
    expect(rec.lastClickedAt).toBe(2000);
    expect(rec.devices).toEqual({ mobile: 3, desktop: 0, bot: 0, other: 0 });
    const stats = toStats(rec, Date.UTC(2026, 5, 15, 12));
    expect(stats.daily).toHaveLength(14);
    expect(stats.daily[13]).toEqual({ date: "2026-06-15", clicks: 3 });
    expect(stats.expired).toBe(false);
  });
});
