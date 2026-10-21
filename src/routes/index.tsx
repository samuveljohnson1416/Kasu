import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SpendApp } from "@/components/spend/app";
import { useSpend } from "@/lib/spend/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ready = useSpendReady();
  if (!ready) return <BootScreen />;
  return <SpendApp />;
}

function useSpendReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useSpend.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return useSpend.persist.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}

function BootScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="text-center">
        <p className="text-3xl font-medium tracking-tight text-ink">Kasu</p>
        <p className="mt-2 text-sm text-muted">Opening your ledger</p>
      </div>
    </main>
  );
}
