"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 640px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 640px)").matches,
    () => false,
  );
}

/** Bottom sheet on phones, centred modal from 640px up. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  full = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Full-screen on phones. */
  full?: boolean;
}) {
  const desktop = useIsDesktop();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
          <motion.div
            className="absolute inset-0 bg-[rgba(8,5,3,0.72)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`glass grad-border safe-pb relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[#17110d] outline-none sm:max-w-xl sm:rounded-[28px] ${full ? "max-sm:h-[100dvh] max-sm:max-h-none max-sm:rounded-none" : ""}`}
            style={{ backgroundColor: "#17110d" }}
            initial={desktop ? { opacity: 0, y: 24, scale: 0.97 } : { y: "100%" }}
            animate={desktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
            exit={desktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-3 sm:pt-5">
              <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-[rgba(232,190,122,0.3)] sm:hidden" aria-hidden="true" />
              <h2 className="font-display mt-2 truncate text-lg font-bold sm:mt-0">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost mt-2 !min-h-10 !w-10 !px-0 sm:mt-0">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-6 pt-2">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
