"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/** Fades and lifts its children in, optionally when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  inView = false,
  className,
  ...rest
}: { delay?: number; inView?: boolean } & Omit<HTMLMotionProps<"div">, "initial" | "animate" | "whileInView" | "transition">) {
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      {...(inView ? { whileInView: target, viewport: { once: true, margin: "-60px" } } : { animate: target })}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const item = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } } };

export function Stagger({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  const Tag = motion[as];
  return (
    <Tag variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className={className}>
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" }) {
  const Tag = motion[as];
  return (
    <Tag variants={item} whileHover={{ y: -4 }} className={className}>
      {children}
    </Tag>
  );
}
