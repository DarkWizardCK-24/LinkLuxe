"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAuthClient } from "@/lib/firebase";
import { AuthSheet, type AuthMode } from "./AuthSheet";

interface AuthApi {
  user: User | null;
  /** False until Firebase has reported the initial auth state. */
  ready: boolean;
  openAuth: (mode?: AuthMode) => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthApi | null>(null);

export function useAuth(): AuthApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<AuthMode | null>(null);

  useEffect(() => {
    return onAuthStateChanged(getAuthClient(), (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  const openAuth = useCallback((m: AuthMode = "signin") => setMode(m), []);
  const signOut = useCallback(async () => {
    await fbSignOut(getAuthClient());
    toast.success("Signed out");
  }, []);

  const api = useMemo<AuthApi>(() => ({ user, ready, openAuth, signOut }), [user, ready, openAuth, signOut]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <AuthSheet
        open={mode !== null}
        mode={mode ?? "signin"}
        onModeChange={setMode}
        onClose={() => setMode(null)}
        actions={{
          signIn: async (email, password) => {
            await signInWithEmailAndPassword(getAuthClient(), email, password);
            toast.success("Welcome back");
          },
          register: async (email, password) => {
            await createUserWithEmailAndPassword(getAuthClient(), email, password);
            toast.success("Your account is ready");
          },
          google: async () => {
            await signInWithPopup(getAuthClient(), new GoogleAuthProvider());
            toast.success("Signed in with Google");
          },
          reset: async (email) => {
            await sendPasswordResetEmail(getAuthClient(), email);
          },
        }}
      />
    </Ctx.Provider>
  );
}
