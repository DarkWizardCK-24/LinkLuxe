"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export async function copyText(text: string, message = "Copied to clipboard"): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      if (!ok) throw new Error("copy failed");
    } catch {
      toast.error("Could not copy automatically. Select the text and copy it manually.");
      return false;
    }
  }
  toast.success(message);
  return true;
}

export function CopyButton({
  text,
  label = "Copy",
  message,
  variant = "ghost",
  iconOnly = false,
  ariaLabel,
  className = "",
}: {
  text: string;
  label?: string;
  message?: string;
  variant?: "ghost" | "gold";
  iconOnly?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? (iconOnly ? label : undefined)}
      className={`btn ${variant === "gold" ? "btn-gold" : "btn-ghost"} ${iconOnly ? "!w-11 !px-0" : ""} ${className}`}
      onClick={async () => {
        if (await copyText(text, message)) {
          setDone(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setDone(false), 1800);
        }
      }}
    >
      {done ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
      {!iconOnly && <span>{done ? "Copied" : label}</span>}
    </button>
  );
}
