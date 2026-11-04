import { after, NextResponse } from "next/server";
import { classifyDevice, referrerHost } from "@/lib/analytics";
import { getDb } from "@/lib/firebase";
import { fetchLink, recordClick } from "@/lib/links-db";
import { baseUrlFrom, ownHostsFrom } from "@/lib/request";
import { isExpired } from "@/lib/validate";

// Short codes are 3-32 chars of [A-Za-z0-9_-]; anything else cannot exist, so skip the database.
const CODE_RE = /^[A-Za-z0-9_-]{3,32}$/;

function statusRedirect(request: Request, kind: "expired" | "not-found", code: string) {
  const target = new URL(`/status/${kind}`, baseUrlFrom(request.headers, new URL(request.url).origin));
  target.searchParams.set("code", code.slice(0, 40));
  return NextResponse.redirect(target, { status: 307, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request, ctx: RouteContext<"/[code]">) {
  const { code } = await ctx.params;
  if (!CODE_RE.test(code)) return statusRedirect(request, "not-found", code);

  const db = getDb();
  const link = await fetchLink(db, code).catch((err) => {
    console.error("[linkluxe] lookup failed", err);
    return null;
  });
  if (!link) return statusRedirect(request, "not-found", code);

  const now = Date.now();
  if (isExpired(link, now)) return statusRedirect(request, "expired", link.code);

  const purpose = `${request.headers.get("sec-purpose") ?? ""} ${request.headers.get("purpose") ?? ""}`.toLowerCase();
  if (!purpose.includes("prefetch")) {
    const click = {
      at: now,
      referrer: referrerHost(request.headers.get("referer"), ownHostsFrom(request.headers)),
      device: classifyDevice(request.headers.get("user-agent")),
    };
    // Never block (or fail) the redirect on analytics.
    after(() => recordClick(db, link, click).catch((err) => console.error("[linkluxe] click not recorded", (err as Error).message)));
  }

  return NextResponse.redirect(link.url, { status: 307, headers: { "Cache-Control": "no-store" } });
}
