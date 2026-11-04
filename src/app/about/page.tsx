import type { Metadata } from "next";
import { EyeOff, Fingerprint, KeyRound, Link2, ShieldCheck, Timer } from "lucide-react";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";

export const metadata: Metadata = {
  title: "About",
  description: "What LinkLuxe is, how it works, and exactly what it does and does not store about you.",
};

const PRIVACY = [
  { Icon: Fingerprint, title: "One simple account", text: "Create links with an email and password or Google. Your account only owns your links, so they and their analytics sync to every device you use." },
  { Icon: EyeOff, title: "No IP addresses stored", text: "When someone clicks a link we count the click. We never write the visitor's IP address, cookies or fingerprint anywhere." },
  { Icon: KeyRound, title: "Locked to you", text: "Only the account that created a link can list it or delete it. Passwords are handled by Firebase Authentication and never reach our own code." },
  { Icon: ShieldCheck, title: "Coarse analytics only", text: "Per click we keep a day count, the referring site's host name and a coarse device class (mobile, desktop or bot). Nothing that identifies a person." },
] as const;

export default function About() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-8 pt-8 sm:px-6 md:pt-12">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          About <span className="text-grad">LinkLuxe</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          LinkLuxe is a small URL shortener. It turns long web addresses into short links and shows how each one performs, while storing as little as possible about visitors.
        </p>
      </Reveal>

      <Reveal inView className="glass grad-border mt-10 rounded-[28px] p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">What it does</h2>
        <ul className="mt-4 space-y-3 text-muted">
          <li className="flex gap-3">
            <Link2 size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
            <span>Shortens any http or https link, with an optional custom alias such as <span className="text-champagne">/spring-sale</span>.</span>
          </li>
          <li className="flex gap-3">
            <Timer size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
            <span>Lets links expire after a day, a week or a month. After that, visitors see a friendly &ldquo;link expired&rdquo; page instead of a redirect.</span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
            <span>Refuses anything that is not a web link (such as <code className="text-champagne">javascript:</code> or <code className="text-champagne">data:</code> URLs) and links that point back at LinkLuxe itself.</span>
          </li>
        </ul>
      </Reveal>

      <section aria-labelledby="privacy-h" className="mt-12">
        <Reveal inView>
          <h2 id="privacy-h" className="font-display text-2xl font-bold sm:text-3xl">
            Privacy, <span className="text-grad">plainly</span>
          </h2>
        </Reveal>
        <Stagger as="ul" className="mt-6 grid gap-4 sm:grid-cols-2">
          {PRIVACY.map(({ Icon, title, text }) => (
            <StaggerItem as="li" key={title} className="glass rounded-3xl p-5">
              <div className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(135deg,rgba(248,230,188,0.18),rgba(184,105,63,0.2))] text-gold">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="font-display mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Reveal inView className="glass mt-12 rounded-[28px] p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Good to know</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted marker:text-gold">
          <li>Anyone with a short link can follow it, but only you can see its analytics or delete it.</li>
          <li>Link creation is throttled per account to keep the service fair for everyone.</li>
          <li>Deleting a link erases it and its analytics immediately.</li>
        </ul>
        <Link href="/#create" className="btn btn-gold mt-6">
          Shorten a link
        </Link>
      </Reveal>

      <p className="mt-10 text-center text-sm text-faint">Built by DarkWizardCK</p>
    </main>
  );
}
