import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

/** Local emulator ports (pinned in firebase.json). */
export const EMULATOR_HOST = "127.0.0.1";
export const EMULATOR_AUTH_PORT = 9299;
export const EMULATOR_FIRESTORE_PORT = 8280;

export const USE_EMULATOR = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";

/** All LinkLuxe data lives under this path inside the shared Firestore database. */
export const ROOT = ["apps", "linkluxe"] as const;

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const g = globalThis as unknown as { __llDb?: Firestore; __llAuth?: Auth };

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(config);
}

/**
 * Firestore, cached per process. The database id defaults to "(default)" and can be switched with
 * NEXT_PUBLIC_FIRESTORE_DATABASE_ID once the app moves to its own named database.
 */
export function getDb(): Firestore {
  if (!g.__llDb) {
    const databaseId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID || "(default)";
    const db = getFirestore(getFirebaseApp(), databaseId);
    if (USE_EMULATOR) connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_FIRESTORE_PORT);
    g.__llDb = db;
  }
  return g.__llDb;
}

/** Browser-only. */
export function getAuthClient(): Auth {
  if (!g.__llAuth) {
    const auth = getAuth(getFirebaseApp());
    if (USE_EMULATOR) connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_AUTH_PORT}`, { disableWarnings: true });
    g.__llAuth = auth;
  }
  return g.__llAuth;
}
