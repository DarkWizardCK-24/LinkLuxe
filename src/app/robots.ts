import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/about"], disallow: ["/api/", "/links", "/status/"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
