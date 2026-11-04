import { Clock, SearchX } from "lucide-react";
import Link from "next/link";
import { Reveal } from "./Motion";

export function StatusCard({
  kind,
  children,
}: {
  kind: "expired" | "not-found";
  /** Optional slot for the (dynamic) code chip. */
  children?: React.ReactNode;
}) {
  const expired = kind === "expired";
  const Icon = expired ? Clock : SearchX;
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-14 text-center sm:py-24">
      <Reveal className="glass grad-border w-full rounded-[32px] px-6 py-12 sm:px-10">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-[linear-gradient(135deg,rgba(248,230,188,0.18),rgba(184,105,63,0.22))] text-gold">
          <Icon size={36} aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold">{expired ? "Link expired" : "Error 404"}</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {expired ? "This link has expired" : "We could not find that link"}
        </h1>
        <p className="mt-3 text-muted">
          {expired
            ? "The creator set this short link to stop working after a while. Ask them for a fresh one."
            : "The short link may have been mistyped, deleted by its owner, or never existed."}
        </p>
        {children}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/#create" className="btn btn-gold min-h-12">
            Create a short link
          </Link>
          <Link href="/about" className="btn btn-ghost min-h-12">
            About LinkLuxe
          </Link>
        </div>
      </Reveal>
    </main>
  );
}

export function CodeChip({ code }: { code?: string }) {
  if (!code) return null;
  return <p className="mx-auto mt-5 inline-block max-w-full truncate rounded-xl bg-[rgba(255,238,215,0.06)] px-3 py-1.5 font-mono text-sm text-champagne">/{code}</p>;
}
