import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "toolkit-61554.firebaseapp.com";

/**
 * Content Security Policy. Next's hydration needs inline scripts, so script-src keeps 'unsafe-inline'
 * ('unsafe-eval' is added in development only). Firebase hosts are pinned exactly; emulator hosts are
 * only allowed in development or when NEXT_PUBLIC_USE_EMULATOR=true.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://firestore.googleapis.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://www.googleapis.com",
    "https://firebaseinstallations.googleapis.com",
    ...(isDev || useEmulator ? ["http://127.0.0.1:9299", "http://127.0.0.1:8280", "ws://localhost:*", "ws://127.0.0.1:*"] : []),
  ].join(" "),
  `frame-src https://${authDomain}${isDev || useEmulator ? " http://127.0.0.1:9299" : ""}`,
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [{ source: "/shorten", destination: "/", permanent: false }];
  },
};

export default nextConfig;
