"use client";

import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet } from "./Sheet";

// Dark modules on a champagne background: warm, and still high-contrast enough for any scanner.
const DARK = "#1a110b";
const LIGHT = "#f8efe0";

function QrBody({ url, code }: { url: string; code: string }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: DARK, light: LIGHT } })
      .then((s) => !cancelled && setSvg(s))
      .catch(() => !cancelled && toast.error("Could not generate the QR code."));
    return () => {
      cancelled = true;
    };
  }, [url]);

  async function download() {
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: { dark: DARK, light: LIGHT } });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `linkluxe-${code}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("QR code downloaded");
    } catch {
      toast.error("Could not download the QR code.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 pb-2">
      <div className="rounded-3xl bg-[linear-gradient(135deg,#f8e6bc,#e39c8c,#c9774b)] p-[3px] shadow-[0_20px_60px_-20px_rgba(227,156,140,0.5)]">
        <div className="size-60 overflow-hidden rounded-[21px] bg-[#f8efe0] sm:size-64" role="img" aria-label={`QR code for ${url}`}>
          {svg ? <div className="size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} /> : null}
        </div>
      </div>
      <p className="max-w-full truncate text-center text-sm text-muted">{url}</p>
      <button type="button" className="btn btn-gold w-full sm:w-auto" onClick={download} disabled={!svg}>
        <Download size={18} aria-hidden="true" /> Download PNG
      </button>
    </div>
  );
}

export function QrSheet({ url, code, open, onClose }: { url: string; code: string; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="QR code">
      <QrBody url={url} code={code} />
    </Sheet>
  );
}
