import {
  FieldPath,
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  collection,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { MAX_REFERRER_KEYS, dayKey, normalizeDevices } from "./analytics";
import { generateCode } from "./code";
import { ROOT } from "./firebase";
import type { ClickInfo, CreatedLink, ExpiryOption, LinkRecord } from "./types";
import { expiryToTimestamp, normalizeUrl, validateAlias } from "./validate";

export const MIN_CREATE_GAP_MS = 3000;
export const DAILY_CREATE_CAP = 100;
const DAY_MS = 86_400_000;

export const linkRef = (db: Firestore, code: string) => doc(db, ROOT[0], ROOT[1], "links", code.toLowerCase());
export const userRef = (db: Firestore, uid: string) => doc(db, ROOT[0], ROOT[1], "users", uid);

const ms = (v: unknown): number | null => (v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : null);

/** Converts a Firestore document into the app's LinkRecord (timestamps become milliseconds). */
export function toLinkRecord(data: DocumentData): LinkRecord {
  return {
    code: String(data.code),
    url: String(data.url),
    ownerUid: String(data.ownerUid),
    createdAt: ms(data.createdAt) ?? 0,
    expiresAt: ms(data.expiresAt),
    clicks: Number(data.clicks ?? 0),
    lastClickedAt: ms(data.lastClickedAt),
    daily: { ...(data.daily ?? {}) },
    referrers: { ...(data.referrers ?? {}) },
    devices: normalizeDevices(data.devices),
  };
}

export async function fetchLink(db: Firestore, code: string): Promise<LinkRecord | null> {
  const snap = await getDoc(linkRef(db, code));
  return snap.exists() ? toLinkRecord(snap.data()) : null;
}

/**
 * Records one click using the only update the security rules allow: clicks + 1 together with at most
 * one new/updated key in each of daily, referrers and devices. Callers should treat failures as non-fatal.
 */
export async function recordClick(db: Firestore, link: LinkRecord, click: ClickInfo): Promise<void> {
  const args: unknown[] = [
    "clicks", increment(1),
    "lastClickedAt", serverTimestamp(),
    new FieldPath("daily", dayKey(click.at)), increment(1),
    new FieldPath("devices", click.device), increment(1),
  ];
  if (click.referrer) {
    const known = click.referrer in link.referrers || Object.keys(link.referrers).length < MAX_REFERRER_KEYS;
    args.push(new FieldPath("referrers", known ? click.referrer : "other"), increment(1));
  }
  const [first, second, ...rest] = args;
  await updateDoc(linkRef(db, link.code), first as string, second, ...(rest as unknown[]));
}

export function subscribeOwnerLinks(
  db: Firestore,
  uid: string,
  onData: (links: LinkRecord[]) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, ROOT[0], ROOT[1], "links"), where("ownerUid", "==", uid));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => toLinkRecord(d.data())).sort((a, b) => b.createdAt - a.createdAt)),
    onError,
  );
}

export async function deleteLink(db: Firestore, code: string): Promise<void> {
  await deleteDoc(linkRef(db, code));
}

export class CreateError extends Error {
  constructor(
    message: string,
    public field: "url" | "alias" | "general" = "general",
  ) {
    super(message);
  }
}

const isDenied = (err: unknown) => (err as { code?: string })?.code === "permission-denied";

export interface CreateInput {
  url: string;
  alias?: string;
  expiry: ExpiryOption;
}

/**
 * Creates a link owned by `uid`. Validation here mirrors (and is enforced again by) the Firestore rules.
 * The document id is the lower-cased code, so create-if-absent gives atomic uniqueness.
 */
export async function createLink(db: Firestore, uid: string, input: CreateInput, ownHosts: string[]): Promise<CreatedLink> {
  const url = normalizeUrl(input.url, ownHosts);
  if (!url.ok) throw new CreateError(url.error, "url");
  const alias = input.alias?.trim() ? validateAlias(input.alias) : null;
  if (alias && !alias.ok) throw new CreateError(alias.error, "alias");

  const now = Date.now();
  const prev = await getDoc(userRef(db, uid)).catch(() => null);
  const prevData = prev?.exists() ? prev.data() : null;
  const last = prevData ? ms(prevData.lastCreatedAt) : null;
  if (last !== null && now - last < MIN_CREATE_GAP_MS) {
    throw new CreateError("You are creating links very quickly. Please wait a few seconds.");
  }
  const today = Math.floor(now / DAY_MS);
  const count = prevData && prevData.day === today ? Number(prevData.count) + 1 : 1;
  if (count > DAILY_CREATE_CAP) throw new CreateError(`Daily limit of ${DAILY_CREATE_CAP} links reached. Try again tomorrow.`);

  const expiresAt = expiryToTimestamp(input.expiry, now);
  const attempts = alias ? 1 : 6;
  for (let i = 0; i < attempts; i++) {
    const code = alias ? alias.value : generateCode();
    const batch = writeBatch(db);
    batch.set(linkRef(db, code), {
      url: url.value,
      code,
      ownerUid: uid,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt === null ? null : Timestamp.fromMillis(expiresAt),
      clicks: 0,
      lastClickedAt: null,
      daily: {},
      referrers: {},
      devices: { mobile: 0, desktop: 0, bot: 0, other: 0 },
    });
    batch.set(userRef(db, uid), { lastCreatedAt: serverTimestamp(), day: today, count });
    try {
      await batch.commit();
      return { code, url: url.value, createdAt: now, expiresAt };
    } catch (err) {
      if (!isDenied(err)) throw new CreateError("Could not create the link. Check your connection and try again.");
      // A create over an existing document is an (illegal) update, so a collision surfaces as permission-denied.
      const exists = await getDoc(linkRef(db, code)).then((s) => s.exists()).catch(() => false);
      if (exists) {
        if (alias) throw new CreateError("That alias is already taken. Try another one.", "alias");
        continue;
      }
      throw new CreateError("The link was rejected by the server. Check the URL and alias, then try again.");
    }
  }
  throw new CreateError("Could not allocate a short code. Please try again.");
}
