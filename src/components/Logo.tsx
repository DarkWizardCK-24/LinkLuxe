import Image from "next/image";

export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return <Image src="/logo.svg" alt="" width={size} height={size} unoptimized priority className={className} aria-hidden="true" />;
}

export function Wordmark({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        Link<span className="text-grad">Luxe</span>
      </span>
    </span>
  );
}
