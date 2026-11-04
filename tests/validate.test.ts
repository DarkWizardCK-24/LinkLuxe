import { describe, expect, it } from "vitest";
import {
  MAX_URL_LENGTH,
  expiryToTimestamp,
  isExpired,
  normalizeUrl,
  parseExpiry,
  validateAlias,
} from "@/lib/validate";

describe("normalizeUrl", () => {
  it("adds https:// when the scheme is missing", () => {
    expect(normalizeUrl("example.com/path?q=1")).toEqual({ ok: true, value: "https://example.com/path?q=1" });
  });
  it("keeps http and https", () => {
    expect(normalizeUrl("http://example.com")).toEqual({ ok: true, value: "http://example.com/" });
    expect(normalizeUrl("HTTPS://Example.com/A")).toEqual({ ok: true, value: "https://example.com/A" });
  });
  it("trims whitespace", () => {
    expect(normalizeUrl("  https://example.com  ").ok).toBe(true);
  });
  it.each(["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>1</script>", "file:///etc/passwd", "ftp://example.com", "mailto:a@b.co", "vbscript:x"])(
    "rejects %s",
    (input) => {
      expect(normalizeUrl(input).ok).toBe(false);
    },
  );
  it("rejects empty, spaced and malformed input", () => {
    expect(normalizeUrl("").ok).toBe(false);
    expect(normalizeUrl("   ").ok).toBe(false);
    expect(normalizeUrl("exa mple.com").ok).toBe(false);
    expect(normalizeUrl("http://").ok).toBe(false);
    expect(normalizeUrl("localhost").ok).toBe(false);
  });
  it("rejects credentials in the URL", () => {
    expect(normalizeUrl("https://user:pass@example.com").ok).toBe(false);
  });
  it("enforces the 2048 character limit", () => {
    const long = "https://example.com/" + "a".repeat(MAX_URL_LENGTH);
    expect(normalizeUrl(long).ok).toBe(false);
    const ok = "https://example.com/" + "a".repeat(MAX_URL_LENGTH - 30);
    expect(normalizeUrl(ok).ok).toBe(true);
  });
  it("rejects links to the app's own host", () => {
    expect(normalizeUrl("https://linkluxe.app/abc", ["linkluxe.app"]).ok).toBe(false);
    expect(normalizeUrl("localhost.dev/x", ["localhost.dev"]).ok).toBe(false);
    expect(normalizeUrl("http://127.0.0.1:3300/abc", ["127.0.0.1:3300"]).ok).toBe(false);
    expect(normalizeUrl("http://127.0.0.1:4000/abc", ["127.0.0.1:3300"]).ok).toBe(true);
  });
  it("treats host:port as a host, not a scheme", () => {
    expect(normalizeUrl("example.com:8080/x")).toEqual({ ok: true, value: "https://example.com:8080/x" });
  });
});

describe("validateAlias", () => {
  it("accepts valid aliases", () => {
    for (const a of ["abc", "My-Link_1", "a".repeat(32)]) expect(validateAlias(a).ok).toBe(true);
  });
  it("rejects bad length and characters", () => {
    for (const a of ["ab", "a".repeat(33), "has space", "emoji-😀", "dot.dot", "slash/x", ""]) {
      expect(validateAlias(a).ok).toBe(false);
    }
  });
  it("rejects reserved words in any case", () => {
    for (const a of ["api", "About", "SHORTEN", "links", "stats", "_next", "robots", "status"]) {
      expect(validateAlias(a).ok).toBe(false);
    }
  });
});

describe("expiry", () => {
  const now = 1_700_000_000_000;
  it("parses options", () => {
    expect(parseExpiry(undefined)).toBe("never");
    expect(parseExpiry("7d")).toBe("7d");
    expect(parseExpiry("2d")).toBeNull();
    expect(parseExpiry(7)).toBeNull();
  });
  it("computes timestamps", () => {
    expect(expiryToTimestamp("never", now)).toBeNull();
    expect(expiryToTimestamp("1d", now)).toBe(now + 86_400_000);
    expect(expiryToTimestamp("30d", now)).toBe(now + 30 * 86_400_000);
  });
  it("detects expiry", () => {
    expect(isExpired({ expiresAt: null }, now)).toBe(false);
    expect(isExpired({ expiresAt: now + 1 }, now)).toBe(false);
    expect(isExpired({ expiresAt: now }, now)).toBe(true);
    expect(isExpired({ expiresAt: now - 1 }, now)).toBe(true);
  });
});
