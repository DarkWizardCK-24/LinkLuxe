export type Device = "mobile" | "desktop" | "bot" | "other";

export type ExpiryOption = "never" | "1d" | "7d" | "30d";

/** A link as used by the app. Timestamps are epoch milliseconds (UTC). */
export interface LinkRecord {
  /** The code as the creator typed it (display case). The Firestore document id is its lower-case form. */
  code: string;
  url: string;
  ownerUid: string;
  createdAt: number;
  expiresAt: number | null;
  clicks: number;
  lastClickedAt: number | null;
  /** `YYYY-MM-DD` (UTC) -> clicks. */
  daily: Record<string, number>;
  /** Referrer host -> clicks. */
  referrers: Record<string, number>;
  devices: Record<Device, number>;
}

export interface ClickInfo {
  at: number;
  referrer: string | null;
  device: Device;
}

export interface LinkStats {
  code: string;
  url: string;
  createdAt: number;
  expiresAt: number | null;
  expired: boolean;
  clicks: number;
  lastClickedAt: number | null;
  daily: { date: string; clicks: number }[];
  referrers: { host: string; clicks: number }[];
  devices: Record<Device, number>;
}

export interface CreatedLink {
  code: string;
  url: string;
  createdAt: number;
  expiresAt: number | null;
}
