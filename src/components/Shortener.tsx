"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart3, ChevronDown, ExternalLink, Loader2, LockKeyhole, QrCode, ShieldCheck, Wand2 } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { getDb } from "@/lib/firebase";
import { CreateError, createLink } from "@/lib/links-db";
import { formatDate } from "@/lib/format";
import type { CreatedLink, ExpiryOption } from "@/lib/types";
import { ALIAS_MAX, EXPIRY_OPTIONS, normalizeUrl, validateAlias } from "@/lib/validate";
import { useAuth } from "./AuthProvider";
import { CopyButton } from "./CopyButton";
import { QrSheet } from "./QrView";

export function Shortener() {
  const uid = useId();
  const { user, ready, openAuth } = useAuth();
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiry, setExpiry] = useState<ExpiryOption>("never");
  const [showOptions, setShowOptions] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; alias?: string }>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CreatedLink | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function validate() {
    const next: { url?: string; alias?: string } = {};
    const u = normalizeUrl(url, [window.location.host]);
    if (!u.ok) next.url = u.error;
    if (alias.trim()) {
      const a = validateAlias(alias);
      if (!a.ok) next.alias = a.error;
    }
    setErrors(next);
    if (next.alias) setShowOptions(true);
    return !next.url && !next.alias;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !validate()) return;
    if (!user) {
      openAuth("signin");
      return;
    }
    setBusy(true);
    try {
      const created = await createLink(getDb(), user.uid, { url, alias: alias.trim() || undefined, expiry }, [window.location.host]);
      setResult(created);
      setUrl("");
      setAlias("");
      toast.success("Your short link is ready");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (err) {
      const message = err instanceof CreateError ? err.message : "Something went wrong. Please try again.";
      if (err instanceof CreateError && err.field === "alias") {
        setErrors({ alias: message });
        setShowOptions(true);
      } else if (err instanceof CreateError && err.field === "url") {
        setErrors({ url: message });
      }
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  const shortUrl = result ? `${window.location.origin}/${result.code}` : "";

  if (ready && !user) {
    return (
      <div className="glass grad-border rounded-[28px] p-6 text-center sm:p-8" data-testid="auth-gate">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(248,230,188,0.18),rgba(184,105,63,0.22))] text-gold">
          <LockKeyhole size={26} aria-hidden="true" />
        </div>
        <h3 className="font-display mt-4 text-xl font-bold">Sign in to create links</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          A free account keeps your links, QR codes and analytics in sync on every device. No IP addresses are stored.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn btn-gold min-h-12" onClick={() => openAuth("signin")}>
            Sign in
          </button>
          <button type="button" className="btn btn-ghost min-h-12" onClick={() => openAuth("register")}>
            Create account
          </button>
        </div>
      </div>
    );
  }

  if (!ready) return <div className="glass h-64 animate-pulse rounded-[28px]" aria-busy="true" aria-label="Loading" />;

  return (
    <div>
      <form onSubmit={submit} noValidate className="glass grad-border rounded-[28px] p-4 sm:p-6" aria-label="Create a short link">
        <label htmlFor={`${uid}-url`} className="mb-2 block text-sm font-semibold text-muted">
          Paste a long link
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={`${uid}-url`}
            name="url"
            type="text"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="https://example.com/a/very/long/link"
            className="field flex-1"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errors.url) setErrors((p) => ({ ...p, url: undefined }));
            }}
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? `${uid}-url-err` : undefined}
          />
          <button type="submit" className="btn btn-gold min-h-12 sm:min-w-44" disabled={busy}>
            {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Wand2 size={18} aria-hidden="true" />}
            {busy ? "Shortening" : "Shorten link"}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {errors.url && (
            <motion.p
              id={`${uid}-url-err`}
              role="alert"
              className="mt-2 text-sm text-danger"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {errors.url}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="button"
          className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-gold"
          aria-expanded={showOptions}
          aria-controls={`${uid}-opts`}
          onClick={() => setShowOptions((v) => !v)}
        >
          Custom alias and expiry
          <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${showOptions ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {showOptions && (
            <motion.div
              id={`${uid}-opts`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-5 pb-1 pt-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${uid}-alias`} className="mb-2 block text-sm font-semibold text-muted">
                    Custom alias <span className="font-normal text-faint">(optional)</span>
                  </label>
                  <input
                    id={`${uid}-alias`}
                    name="alias"
                    type="text"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={ALIAS_MAX + 8}
                    placeholder="my-launch"
                    className="field"
                    value={alias}
                    onChange={(e) => {
                      setAlias(e.target.value);
                      if (errors.alias) setErrors((p) => ({ ...p, alias: undefined }));
                    }}
                    aria-invalid={Boolean(errors.alias)}
                    aria-describedby={`${uid}-alias-help`}
                  />
                  <p id={`${uid}-alias-help`} role={errors.alias ? "alert" : undefined} className={`mt-2 text-sm ${errors.alias ? "text-danger" : "text-faint"}`}>
                    {errors.alias ?? "3-32 letters, numbers, hyphens or underscores. Leave empty for a random code."}
                  </p>
                </div>
                <fieldset>
                  <legend className="mb-2 block text-sm font-semibold text-muted">Expires</legend>
                  <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-line bg-[rgba(10,7,5,0.6)] p-1.5">
                    {EXPIRY_OPTIONS.map((o) => (
                      <label key={o.value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name={`${uid}-expiry`}
                          value={o.value}
                          checked={expiry === o.value}
                          onChange={() => setExpiry(o.value)}
                          className="peer sr-only"
                        />
                        <span className="flex min-h-10 items-center justify-center rounded-xl text-center text-[13px] font-semibold text-muted transition peer-checked:bg-[linear-gradient(120deg,#f8e6bc,#e8be7a_40%,#e39c8c)] peer-checked:text-[#1a110b] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-champagne">
                          {o.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-4 flex items-center gap-2 text-xs text-faint">
          <ShieldCheck size={14} className="shrink-0 text-gold" aria-hidden="true" />
          Only http and https links. We never store visitor IP addresses.
        </p>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultRef}
            key={result.code}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="glass grad-border mt-5 rounded-[28px] p-5 sm:p-6"
            aria-live="polite"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Your short link</p>
            <p className="font-display text-grad mt-2 break-all text-2xl font-extrabold leading-tight sm:text-3xl" data-testid="short-url">
              {shortUrl}
            </p>
            <p className="mt-1.5 truncate text-sm text-faint">Points to {result.url}</p>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
              <CopyButton text={shortUrl} label="Copy link" message="Short link copied" variant="gold" className="col-span-2 min-h-12 sm:col-auto" />
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-12">
                <ExternalLink size={18} aria-hidden="true" /> Open
              </a>
              <button type="button" className="btn btn-ghost min-h-12" onClick={() => setQrOpen(true)}>
                <QrCode size={18} aria-hidden="true" /> QR code
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <span>{result.expiresAt ? `Expires ${formatDate(result.expiresAt)}` : "Never expires"}</span>
              <Link href="/links" className="inline-flex items-center gap-1.5 font-semibold text-gold">
                <BarChart3 size={16} aria-hidden="true" /> View analytics <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {result && <QrSheet url={shortUrl} code={result.code} open={qrOpen} onClose={() => setQrOpen(false)} />}
    </div>
  );
}
