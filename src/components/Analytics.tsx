"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { compact, formatDateTime, shortDay, timeAgo } from "@/lib/format";
import type { Device, LinkStats } from "@/lib/types";

export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => compact(Math.round(v)));
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [value, reduce, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}

function niceMax(n: number): number {
  if (n <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= n) return m * pow;
  return n;
}

// Plain SVG bar chart, no chart library.
export function BarChart({ data }: { data: { date: string; clicks: number }[] }) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 210;
  const pad = { l: 30, r: 6, t: 14, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = niceMax(Math.max(0, ...data.map((d) => d.clicks)));
  const step = iw / data.length;
  const bw = Math.min(28, step * 0.62);
  const total = data.reduce((s, d) => s + d.clicks, 0);
  const ticks = [0, max / 2, max];

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Clicks per day over the last ${data.length} days. ${total} clicks in total.`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`bar-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f8e6bc" />
            <stop offset="0.45" stopColor="#e39c8c" />
            <stop offset="1" stopColor="#b8693f" />
          </linearGradient>
        </defs>
        {ticks.map((t) => {
          const y = pad.t + ih - (t / max) * ih;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="rgba(232,190,122,0.14)" strokeDasharray={t === 0 ? undefined : "3 5"} />
              <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#8a7b6d">
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = Math.max(d.clicks > 0 ? 4 : 0, (d.clicks / max) * ih);
          const x = pad.l + step * i + (step - bw) / 2;
          const y = pad.t + ih - h;
          const active = hover === i;
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${shortDay(d.date)}: ${d.clicks} clicks`}>
              <rect x={pad.l + step * i} y={pad.t} width={step} height={ih} fill="transparent" />
              {d.clicks === 0 && <rect x={x} y={pad.t + ih - 3} width={bw} height={3} rx={1.5} fill="rgba(232,190,122,0.18)" />}
              {d.clicks > 0 && (
                <motion.rect
                  x={x}
                  width={bw}
                  rx={6}
                  fill={`url(#bar-${gid})`}
                  initial={{ y: pad.t + ih, height: 0 }}
                  animate={{ y, height: h, opacity: hover === null || active ? 1 : 0.55 }}
                  transition={{ duration: 0.6, delay: i * 0.03, ease: "easeOut" }}
                />
              )}
              {i % 2 === (data.length % 2 === 0 ? 1 : 0) && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="10.5" fill={active ? "#f8e6bc" : "#8a7b6d"}>
                  {shortDay(d.date)}
                </text>
              )}
              {active && (
                <g pointerEvents="none">
                  <rect x={Math.min(W - 92, Math.max(pad.l, x + bw / 2 - 46))} y={Math.max(0, y - 34)} width="92" height="26" rx="8" fill="#241a14" stroke="rgba(232,190,122,0.45)" />
                  <text x={Math.min(W - 92, Math.max(pad.l, x + bw / 2 - 46)) + 46} y={Math.max(0, y - 34) + 17} textAnchor="middle" fontSize="12" fontWeight="600" fill="#f8e6bc">
                    {shortDay(d.date)} · {d.clicks}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Clicks per day</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <th scope="row">{d.date}</th>
              <td>{d.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DEVICE_META: { key: Device; label: string; color: string }[] = [
  { key: "mobile", label: "Mobile", color: "#e8be7a" },
  { key: "desktop", label: "Desktop", color: "#e39c8c" },
  { key: "bot", label: "Bots", color: "#b8693f" },
  { key: "other", label: "Other", color: "#7a6a5d" },
];

function DeviceSplit({ devices }: { devices: Record<Device, number> }) {
  const total = DEVICE_META.reduce((s, d) => s + devices[d.key], 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[rgba(255,238,215,0.07)]" role="img" aria-label="Device split">
        {total > 0 &&
          DEVICE_META.map((d) =>
            devices[d.key] > 0 ? (
              <motion.div
                key={d.key}
                style={{ background: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(devices[d.key] / total) * 100}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ) : null,
          )}
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-y-2 text-sm">
        {DEVICE_META.map((d) => (
          <li key={d.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="font-semibold tabular-nums">
              {devices[d.key]}
              <span className="ml-1 text-xs font-normal text-faint">{total ? Math.round((devices[d.key] / total) * 100) : 0}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Referrers({ stats }: { stats: LinkStats }) {
  const known = stats.referrers.reduce((s, r) => s + r.clicks, 0);
  const direct = Math.max(0, stats.clicks - known);
  const rows = [...stats.referrers, ...(direct > 0 ? [{ host: "Direct or hidden", clicks: direct }] : [])];
  const max = Math.max(1, ...rows.map((r) => r.clicks));
  if (rows.length === 0) return <p className="text-sm text-faint">No clicks yet. Share your link to see where visitors come from.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.host}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink">{r.host}</span>
            <span className="font-semibold tabular-nums">{r.clicks}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,238,215,0.07)]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f8e6bc,#e39c8c,#c9774b)]"
              initial={{ width: 0 }}
              animate={{ width: `${(r.clicks / max) * 100}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StatsView({ stats, now }: { stats: LinkStats; now: number }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-[rgba(255,238,215,0.04)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-faint">Total clicks</p>
          <p className="font-display mt-1 text-4xl font-extrabold tabular-nums">
            <CountUp value={stats.clicks} className="text-grad" />
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-[rgba(255,238,215,0.04)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-faint">Last clicked</p>
          <p className="mt-2 text-lg font-semibold leading-tight">{stats.lastClickedAt ? timeAgo(stats.lastClickedAt, now) : "Never"}</p>
          {stats.lastClickedAt && <p className="mt-0.5 text-xs text-faint">{formatDateTime(stats.lastClickedAt)}</p>}
        </div>
      </div>
      <section aria-labelledby="chart-h" className="rounded-2xl border border-line bg-[rgba(255,238,215,0.04)] p-4">
        <h3 id="chart-h" className="mb-2 text-sm font-semibold">
          Last 14 days
        </h3>
        <BarChart data={stats.daily} />
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        <section aria-labelledby="ref-h" className="rounded-2xl border border-line bg-[rgba(255,238,215,0.04)] p-4">
          <h3 id="ref-h" className="mb-3 text-sm font-semibold">
            Top referrers
          </h3>
          <Referrers stats={stats} />
        </section>
        <section aria-labelledby="dev-h" className="rounded-2xl border border-line bg-[rgba(255,238,215,0.04)] p-4">
          <h3 id="dev-h" className="mb-3 text-sm font-semibold">
            Devices
          </h3>
          <DeviceSplit devices={stats.devices} />
        </section>
      </div>
    </div>
  );
}
