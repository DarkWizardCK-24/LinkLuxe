import { BarChart3, Clock, Fingerprint, Link2, QrCode, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { Shortener } from "@/components/Shortener";

const FEATURES = [
  { Icon: Link2, title: "Custom aliases", text: "Pick a memorable name like /spring-sale, or let us generate a clean 7-character code." },
  { Icon: BarChart3, title: "Private analytics", text: "Clicks, a 14-day chart, top referrers and device split for every link, without tracking visitors." },
  { Icon: QrCode, title: "QR codes", text: "Every link gets a scannable QR code you can download as a crisp PNG in one tap." },
  { Icon: Clock, title: "Optional expiry", text: "Let links lapse after a day, a week or a month. Visitors see a friendly page, never a dead end." },
  { Icon: Fingerprint, title: "Synced to your account", text: "Sign in with email or Google and your links, QR codes and analytics follow you to every device." },
  { Icon: ShieldCheck, title: "Safe by design", text: "Only http and https destinations, loop protection, rate limiting and strict security headers." },
] as const;

const STEPS = [
  { n: "01", title: "Paste your link", text: "Sign in, then drop in any web address. We check it and add https:// if you forgot." },
  { n: "02", title: "Make it yours", text: "Choose a custom alias and an optional expiry, or just keep the defaults." },
  { n: "03", title: "Share and watch", text: "Copy the link or QR code, then watch clicks arrive live on your links page." },
] as const;

export default function Home() {
  return (
    <main>
      <section id="create" className="mx-auto grid max-w-6xl scroll-mt-24 grid-cols-1 items-center gap-8 px-4 pb-10 pt-8 sm:px-6 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <Reveal>
            <span className="chip !border-[rgba(232,190,122,0.3)] !text-gold">
              <Sparkles size={13} aria-hidden="true" /> Free · synced across devices · no IPs stored
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-display mt-4 text-[2.6rem] font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
              Short links, <span className="text-grad">beautifully</span> done.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Turn any long URL into an elegant short link with a custom alias, a QR code, optional expiry and private click analytics.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-6 hidden gap-6 text-sm text-muted sm:flex">
            {["Custom aliases", "QR codes", "Live analytics"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <Wand2 size={15} className="text-gold" aria-hidden="true" /> {t}
              </span>
            ))}
          </Reveal>
        </div>
        <Reveal delay={0.2} className="min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Try it now</p>
          <Shortener />
        </Reveal>
      </section>

      <section aria-label="How a link is transformed" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Reveal inView className="glass grad-border overflow-hidden rounded-[28px] p-3 sm:p-6">
          <Image src="/hero.svg" alt="A long tangled link flows through the LinkLuxe mark and becomes a short elegant link with click analytics" width={960} height={520} unoptimized className="mx-auto h-auto w-full max-w-3xl" />
        </Reveal>
      </section>

      <section aria-labelledby="features-h" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Reveal inView>
          <h2 id="features-h" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a link needs. <span className="text-grad">Nothing it does not.</span>
          </h2>
        </Reveal>
        <Stagger as="ul" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <StaggerItem as="li" key={title} className="glass rounded-3xl p-5 transition-colors hover:border-[rgba(232,190,122,0.4)]">
              <div className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(135deg,rgba(248,230,188,0.18),rgba(184,105,63,0.2))] text-gold">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="font-display mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section aria-labelledby="how-h" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Reveal inView>
          <h2 id="how-h" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
        </Reveal>
        <Stagger as="ol" className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <StaggerItem as="li" key={s.n} className="glass grad-border rounded-3xl p-6">
              <span className="font-display text-grad text-4xl font-extrabold">{s.n}</span>
              <h3 className="font-display mt-3 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </main>
  );
}
