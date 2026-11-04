import type { Metadata } from "next";
import { LinksList } from "@/components/LinksList";
import { Reveal } from "@/components/Motion";

export const metadata: Metadata = { title: "My links", robots: { index: false } };

export default function LinksPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 md:pt-12">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          My <span className="text-grad">links</span>
        </h1>
        <p className="mb-8 mt-3 max-w-xl text-muted">Every link on your account, with live click counts and analytics, on any device.</p>
      </Reveal>
      <LinksList />
    </main>
  );
}
