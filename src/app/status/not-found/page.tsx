import type { Metadata } from "next";
import { Suspense } from "react";
import { CodeChip, StatusCard } from "@/components/StatusCard";

export const metadata: Metadata = { title: "Link not found", robots: { index: false } };

async function Code({ searchParams }: { searchParams: Promise<{ code?: string | string[] }> }) {
  const { code } = await searchParams;
  return <CodeChip code={typeof code === "string" ? code : undefined} />;
}

export default function Page(props: PageProps<"/status/not-found">) {
  return (
    <StatusCard kind="not-found">
      <Suspense fallback={null}>
        <Code searchParams={props.searchParams as Promise<{ code?: string | string[] }>} />
      </Suspense>
    </StatusCard>
  );
}
