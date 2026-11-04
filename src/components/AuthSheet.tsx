"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, MailCheck } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { LogoMark } from "./Logo";
import { Sheet } from "./Sheet";

export type AuthMode = "signin" | "register" | "reset";

interface Actions {
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  google: () => Promise<void>;
  reset: (email: string) => Promise<void>;
}

const COPY: Record<AuthMode, { title: string; lead: string; cta: string }> = {
  signin: { title: "Welcome back", lead: "Sign in to create links and see your analytics on every device.", cta: "Sign in" },
  register: { title: "Create your account", lead: "Free forever. Your links and analytics sync across all your devices.", cta: "Create account" },
  reset: { title: "Reset your password", lead: "Enter your email and we will send you a reset link.", cta: "Send reset link" },
};

function message(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-email": "That email address does not look right.",
    "auth/missing-password": "Choose a password with at least 6 characters.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/invalid-login-credentials": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/popup-closed-by-user": "",
    "auth/cancelled-popup-request": "",
    "auth/operation-not-allowed": "Google sign-in is not available yet. Please use email and password.",
    "auth/configuration-not-found": "Google sign-in is not available yet. Please use email and password.",
    "auth/unauthorized-domain": "Google sign-in is not available on this address yet. Please use email and password.",
    "auth/popup-blocked": "Your browser blocked the Google pop-up. Allow pop-ups or use email and password.",
  };
  return code in map ? map[code] : "Something went wrong. Please try again.";
}

function Form({
  mode,
  onModeChange,
  onClose,
  actions,
}: {
  mode: AuthMode;
  onModeChange: (m: AuthMode) => void;
  onClose: () => void;
  actions: Actions;
}) {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<"form" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setError(null);
      setSent(false);
    }, 0);
    return () => clearTimeout(t);
  }, [mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (mode !== "reset" && password.length < 6) return setError("Your password needs at least 6 characters.");
    setBusy("form");
    try {
      if (mode === "signin") await actions.signIn(email.trim(), password);
      else if (mode === "register") await actions.register(email.trim(), password);
      else {
        await actions.reset(email.trim());
        setSent(true);
        return;
      }
      onClose();
    } catch (err) {
      setError(message(err) || "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function google() {
    setBusy("google");
    setError(null);
    try {
      await actions.google();
      onClose();
    } catch (err) {
      const m = message(err);
      if (m) {
        setError(m);
        toast.error(m);
      }
    } finally {
      setBusy(null);
    }
  }

  const copy = COPY[mode];

  return (
    <div className="mx-auto w-full max-w-md pb-4 pt-2">
      <div className="mb-6 flex flex-col items-center text-center">
        <LogoMark size={56} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <h3 className="font-display mt-4 text-2xl font-extrabold tracking-tight">{copy.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{copy.lead}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-line bg-[rgba(255,238,215,0.05)] p-5 text-center" role="status">
          <MailCheck size={32} className="mx-auto text-gold" aria-hidden="true" />
          <p className="mt-3 font-semibold">Check your inbox</p>
          <p className="mt-1 text-sm text-muted">If an account exists for {email.trim()}, a reset link is on its way.</p>
          <button type="button" className="btn btn-ghost mt-5 w-full" onClick={() => onModeChange("signin")}>
            Back to sign in
          </button>
        </motion.div>
      ) : (
        <>
          <form onSubmit={submit} noValidate className="space-y-4" aria-label={copy.title}>
            <div>
              <label htmlFor={`${uid}-email`} className="mb-2 block text-sm font-semibold text-muted">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" aria-hidden="true" />
                <input
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className="field !pl-11"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error) && !email.includes("@")}
                />
              </div>
            </div>
            {mode !== "reset" && (
              <div>
                <label htmlFor={`${uid}-pw`} className="mb-2 block text-sm font-semibold text-muted">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" aria-hidden="true" />
                  <input
                    id={`${uid}-pw`}
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    className="field !pl-11 !pr-12"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-faint hover:text-ink"
                  >
                    {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                {mode === "signin" && (
                  <button type="button" className="mt-2 min-h-9 text-sm font-semibold text-gold" onClick={() => onModeChange("reset")}>
                    Forgot password?
                  </button>
                )}
              </div>
            )}
            <AnimatePresence initial={false}>
              {error && (
                <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden text-sm text-danger">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button type="submit" className="btn btn-gold min-h-12 w-full" disabled={busy !== null}>
              {busy === "form" && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
              {copy.cta}
            </button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-faint" aria-hidden="true">
                <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
              </div>
              <button type="button" className="btn btn-ghost min-h-12 w-full" onClick={google} disabled={busy !== null}>
                {busy === "google" ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true" className="font-display grid size-6 place-items-center rounded-full bg-[linear-gradient(135deg,#f8e6bc,#e39c8c)] text-sm font-extrabold text-[#1a110b]">
                    G
                  </span>
                )}
                Continue with Google
              </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            {mode === "signin" && (
              <>
                New here?{" "}
                <button type="button" className="font-semibold text-gold" onClick={() => onModeChange("register")}>
                  Create an account
                </button>
              </>
            )}
            {mode === "register" && (
              <>
                Already have an account?{" "}
                <button type="button" className="font-semibold text-gold" onClick={() => onModeChange("signin")}>
                  Sign in
                </button>
              </>
            )}
            {mode === "reset" && (
              <button type="button" className="font-semibold text-gold" onClick={() => onModeChange("signin")}>
                Back to sign in
              </button>
            )}
          </p>
        </>
      )}
    </div>
  );
}

export function AuthSheet({
  open,
  mode,
  onModeChange,
  onClose,
  actions,
}: {
  open: boolean;
  mode: AuthMode;
  onModeChange: (m: AuthMode) => void;
  onClose: () => void;
  actions: Actions;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={mode === "register" ? "Create account" : mode === "reset" ? "Reset password" : "Sign in"} full>
      <Form mode={mode} onModeChange={onModeChange} onClose={onClose} actions={actions} />
    </Sheet>
  );
}
