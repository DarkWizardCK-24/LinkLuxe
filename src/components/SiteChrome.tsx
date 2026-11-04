"use client";

import { motion } from "framer-motion";
import { Info, Link2, LogOut, Sparkles, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Wordmark } from "./Logo";

const NAV = [
  { href: "/", label: "Create", Icon: Sparkles },
  { href: "/links", label: "My links", Icon: Link2 },
  { href: "/about", label: "About", Icon: Info },
] as const;

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

function AccountButton() {
  const { user, ready, openAuth, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ready) return <span className="block size-10" aria-hidden="true" />;
  if (!user) {
    return (
      <button type="button" onClick={() => openAuth("signin")} className="btn btn-ghost !min-h-10 !px-4 text-sm">
        <UserIcon size={16} aria-hidden="true" /> Sign in
      </button>
    );
  }
  const label = user.email ?? "Account";
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="font-display grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,#f8e6bc,#e8be7a_45%,#e39c8c)] text-base font-extrabold uppercase text-[#1a110b] shadow-[0_8px_24px_-10px_rgba(227,156,140,0.7)]"
      >
        {label[0]}
      </button>
      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass grad-border absolute right-0 top-12 z-50 w-64 rounded-2xl bg-[#17110d] p-2"
          style={{ backgroundColor: "#17110d" }}
        >
          <p className="truncate px-3 pb-2 pt-2 text-sm text-muted" title={label}>
            Signed in as <span className="block truncate font-semibold text-ink">{label}</span>
          </p>
          <Link role="menuitem" href="/links" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-[rgba(255,238,215,0.06)]">
            <Link2 size={16} aria-hidden="true" /> My links
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-danger hover:bg-[rgba(240,144,124,0.08)]"
          >
            <LogOut size={16} aria-hidden="true" /> Sign out
          </button>
        </motion.div>
      )}
    </div>
  );
}

export function TopBar() {
  const isActive = useActive();
  return (
    <header className="safe-pt sticky top-0 z-40 border-b border-line bg-[rgba(15,11,9,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 md:h-16">
        <Link href="/" aria-label="LinkLuxe home" className="rounded-lg">
          <Wordmark size={34} />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                isActive(href) ? "text-champagne" : "text-muted hover:text-ink"
              }`}
            >
              {isActive(href) && (
                <motion.span layoutId="desk-pill" className="absolute inset-0 -z-10 rounded-xl bg-[rgba(232,190,122,0.1)] ring-1 ring-[rgba(232,190,122,0.25)]" />
              )}
              {label}
            </Link>
          ))}
          <Link href="/#create" className="btn btn-gold ml-3 !min-h-10 !px-4 text-sm">
            Shorten a link
          </Link>
          <div className="ml-2">
            <AccountButton />
          </div>
        </nav>
        <div className="md:hidden">
          <AccountButton />
        </div>
      </div>
    </header>
  );
}

export function TabBar() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Primary"
      className="safe-pb fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[rgba(18,13,10,0.92)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  active ? "text-champagne" : "text-faint"
                }`}
              >
                {active && (
                  <motion.span layoutId="tab-glow" className="absolute inset-x-6 top-0 h-[3px] rounded-b-full bg-[linear-gradient(90deg,#f8e6bc,#e39c8c,#c9774b)]" />
                )}
                <span className="relative">
                  <Icon size={22} aria-hidden="true" strokeWidth={active ? 2.4 : 1.9} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-28 pt-10 text-sm text-faint sm:px-6 md:pb-10">
      <div className="flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
        <p>
          <span className="text-grad font-semibold">LinkLuxe</span> · your links, synced. No IP addresses stored.
        </p>
        <p>
          Built by <span className="text-muted">DarkWizardCK</span>
        </p>
      </div>
    </footer>
  );
}
