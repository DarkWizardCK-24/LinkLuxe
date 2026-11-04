"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Clock, ExternalLink, Link2, Loader2, LockKeyhole, MousePointerClick, QrCode, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { toStats } from "@/lib/analytics";
import { getDb } from "@/lib/firebase";
import { formatDate, hostOf, timeUntil } from "@/lib/format";
import { useOrigin } from "@/lib/hooks";
import { deleteLink, subscribeOwnerLinks } from "@/lib/links-db";
import type { LinkRecord } from "@/lib/types";
import { CountUp, StatsView } from "./Analytics";
import { useAuth } from "./AuthProvider";
import { CopyButton } from "./CopyButton";
import { QrSheet } from "./QrView";
import { Sheet } from "./Sheet";

function LinkCard({
  link,
  origin,
  now,
  onStats,
  onQr,
  onDelete,
}: {
  link: LinkRecord;
  origin: string;
  now: number;
  onStats: () => void;
  onQr: () => void;
  onDelete: () => void;
}) {
  const shortUrl = `${origin}/${link.code}`;
  const expired = link.expiresAt !== null && now > 0 && link.expiresAt <= now;
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 26, stiffness: 280 }}
      whileHover={{ y: -2 }}
      className="glass grad-border min-w-0 rounded-3xl p-4 sm:p-5"
      data-testid="link-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-grad truncate text-lg font-bold sm:text-xl" title={shortUrl}>
            {origin ? hostOf(shortUrl) : ""}/{link.code}
          </p>
          <p className="mt-0.5 truncate text-sm text-muted" title={link.url}>
            {hostOf(link.url)}
            <span className="text-faint"> · {link.url.replace(/^https?:\/\/[^/]+/, "") || "/"}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl font-extrabold leading-none tabular-nums" aria-label={`${link.clicks} clicks`}>
            <CountUp value={link.clicks} />
          </p>
          <p className="mt-1 flex items-center justify-end gap-1 text-xs text-faint">
            <MousePointerClick size={12} aria-hidden="true" /> clicks
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="chip">Created {formatDate(link.createdAt)}</span>
        {expired ? (
          <span className="chip !border-[rgba(240,144,124,0.4)] !text-danger">
            <Clock size={12} aria-hidden="true" /> Expired
          </span>
        ) : link.expiresAt ? (
          <span className="chip">
            <Clock size={12} aria-hidden="true" /> {now > 0 ? `Expires in ${timeUntil(link.expiresAt, now)}` : `Expires ${formatDate(link.expiresAt)}`}
          </span>
        ) : (
          <span className="chip">No expiry</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2">
        <button type="button" onClick={onStats} className="btn btn-gold min-h-11 !px-3 text-sm sm:!px-4">
          <BarChart3 size={18} aria-hidden="true" /> Analytics
        </button>
        <CopyButton text={shortUrl} iconOnly label="Copy link" ariaLabel={`Copy short link ${link.code}`} message="Short link copied" />
        <a href={shortUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open short link ${link.code}`} className="btn btn-ghost !w-11 !px-0">
          <ExternalLink size={18} aria-hidden="true" />
        </a>
        <button type="button" onClick={onQr} aria-label={`Show QR code for ${link.code}`} className="btn btn-ghost !w-11 !px-0">
          <QrCode size={18} aria-hidden="true" />
        </button>
        <button type="button" onClick={onDelete} aria-label={`Delete link ${link.code}`} className="btn btn-danger !w-11 !px-0">
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </motion.li>
  );
}

export function LinksList() {
  const { user, ready, openAuth } = useAuth();
  const origin = useOrigin();
  const [data, setData] = useState<{ uid: string; links: LinkRecord[]; now: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [statsFor, setStatsFor] = useState<string | null>(null);
  const [qrFor, setQrFor] = useState<string | null>(null);
  const [deleteFor, setDeleteFor] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!uid) return;
    return subscribeOwnerLinks(
      getDb(),
      uid,
      (links) => {
        setFailed(false);
        setData({ uid, links, now: Date.now() });
      },
      () => setFailed(true),
    );
  }, [uid]);

  const links = useMemo(() => (data && data.uid === uid ? data.links : null), [data, uid]);
  const now = data?.now ?? 0;
  const byCode = useMemo(() => new Map((links ?? []).map((l) => [l.code, l])), [links]);
  const statsLink = statsFor ? byCode.get(statsFor) : undefined;
  const qrLink = qrFor ? byCode.get(qrFor) : undefined;
  const delLink = deleteFor ? byCode.get(deleteFor) : undefined;

  async function confirmDelete() {
    if (!delLink) return;
    setDeleting(true);
    try {
      await deleteLink(getDb(), delLink.code);
      toast.success("Link deleted");
      setDeleteFor(null);
    } catch {
      toast.error("Could not delete the link. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (!ready || (user && links === null && !failed)) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading your links">
        {[0, 1].map((i) => (
          <div key={i} className="glass h-36 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass grad-border rounded-[28px] px-6 py-12 text-center" data-testid="links-gate">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(248,230,188,0.16),rgba(184,105,63,0.18))] text-gold">
          <LockKeyhole size={28} aria-hidden="true" />
        </div>
        <h2 className="font-display mt-5 text-xl font-bold">Sign in to see your links</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">Your links and their analytics sync to your account, so they follow you to every device.</p>
        <div className="mx-auto mt-6 grid max-w-sm gap-3 sm:grid-cols-2">
          <button type="button" className="btn btn-gold min-h-12" onClick={() => openAuth("signin")}>
            Sign in
          </button>
          <button type="button" className="btn btn-ghost min-h-12" onClick={() => openAuth("register")}>
            Create account
          </button>
        </div>
      </motion.div>
    );
  }

  if (failed) {
    return <p className="glass rounded-3xl p-8 text-center text-muted">We could not load your links right now. Please refresh the page.</p>;
  }

  if (!links || links.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass grad-border rounded-[28px] px-6 py-12 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(248,230,188,0.16),rgba(184,105,63,0.18))] text-gold">
          <Link2 size={28} aria-hidden="true" />
        </div>
        <h2 className="font-display mt-5 text-xl font-bold">No links yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">Links you create appear here, with live click counts and analytics, on every device you sign in on.</p>
        <Link href="/#create" className="btn btn-gold mt-6">
          <Sparkles size={18} aria-hidden="true" /> Create your first link
        </Link>
      </motion.div>
    );
  }

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{links.length}</span> {links.length === 1 ? "link" : "links"} ·{" "}
          <span className="font-semibold text-ink">{totalClicks}</span> total clicks
        </p>
        <span className="chip !text-gold">
          <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-gold" /> Live
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnimatePresence initial={false}>
          {links.map((l) => (
            <LinkCard key={l.code} link={l} origin={origin} now={now} onStats={() => setStatsFor(l.code)} onQr={() => setQrFor(l.code)} onDelete={() => setDeleteFor(l.code)} />
          ))}
        </AnimatePresence>
      </ul>
      <p className="mt-6 text-center text-xs text-faint">Counts update live. Signed in as {user.email}.</p>

      <Sheet open={Boolean(statsLink)} onClose={() => setStatsFor(null)} title={statsLink ? `${origin ? hostOf(origin) : ""}/${statsLink.code}` : "Analytics"}>
        {statsLink ? (
          <StatsView stats={toStats(statsLink, now)} now={now} />
        ) : (
          <p className="py-10 text-center text-muted">
            <Loader2 className="mx-auto animate-spin" aria-hidden="true" />
          </p>
        )}
      </Sheet>

      {qrLink && <QrSheet url={`${origin}/${qrLink.code}`} code={qrLink.code} open onClose={() => setQrFor(null)} />}

      <Sheet open={Boolean(delLink)} onClose={() => setDeleteFor(null)} title="Delete this link?">
        <p className="text-muted">
          <span className="font-semibold text-ink">{delLink ? `/${delLink.code}` : ""}</span> will stop working immediately and its analytics will be erased. This cannot be undone.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" className="btn btn-ghost min-h-12" onClick={() => setDeleteFor(null)}>
            Keep link
          </button>
          <button type="button" className="btn btn-danger min-h-12" onClick={confirmDelete} disabled={deleting}>
            {deleting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Trash2 size={18} aria-hidden="true" />} Delete
          </button>
        </div>
      </Sheet>
    </div>
  );
}
