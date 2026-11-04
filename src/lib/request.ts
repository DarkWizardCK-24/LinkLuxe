/** Hosts that identify this app: the request host plus the configured public host. */
export function ownHostsFrom(headers: Headers): string[] {
  const hosts = [headers.get("x-forwarded-host"), headers.get("host")]
    .flatMap((h) => (h ? h.split(",") : []))
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  const configured = process.env.NEXT_PUBLIC_HOST;
  if (configured) {
    try {
      hosts.push(new URL(/^https?:\/\//i.test(configured) ? configured : `https://${configured}`).host.toLowerCase());
    } catch {
      /* ignore a malformed value */
    }
  }
  return [...new Set(hosts)];
}

/** Public origin used to build absolute redirects to the status pages. */
export function baseUrlFrom(headers: Headers, fallbackOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_HOST;
  if (configured) return (/^https?:\/\//i.test(configured) ? configured : `https://${configured}`).replace(/\/+$/, "");
  const host = headers.get("x-forwarded-host")?.split(",")[0].trim() || headers.get("host");
  if (!host) return fallbackOrigin;
  const proto = headers.get("x-forwarded-proto")?.split(",")[0].trim() || new URL(fallbackOrigin).protocol.replace(":", "");
  return `${proto}://${host}`;
}
