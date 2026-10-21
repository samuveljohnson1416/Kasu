import { ChartPie, House, List, Plus, Wallet } from "lucide-react";
import { lazy, Suspense, useCallback, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { AddScreen } from "@/components/spend/add-screen";
import { BudgetScreen } from "@/components/spend/budget-screen";
import { DetailSheet } from "@/components/spend/detail-sheet";
import { HistoryScreen } from "@/components/spend/history-screen";
import { HomeScreen } from "@/components/spend/home-screen";

const ReportsScreen = lazy(() =>
  import("@/components/spend/reports-screen").then((mod) => ({ default: mod.ReportsScreen })),
);

type Tab = "home" | "add" | "history" | "budget" | "reports";

export function SpendApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<"needs-date" | null>(null);
  const clearPreset = useCallback(() => setDatePreset(null), []);

  function openAdd(id: string | null) {
    setEditingId(id);
    setTab("add");
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto min-h-dvh w-full max-w-md pt-[env(safe-area-inset-top)]">
        <main className={tab === "add" ? "" : "pad-nav"}>
          {tab === "home" ? (
            <HomeScreen
              onOpen={setOpenId}
              onReviewDates={() => {
                setDatePreset("needs-date");
                setTab("history");
              }}
            />
          ) : null}
          <div hidden={tab !== "add"}>
            <AddScreen active={tab === "add"} editingId={editingId} onSavedEdit={() => setTab("history")} />
          </div>
          <div hidden={tab !== "history"}>
            <HistoryScreen preset={datePreset} onPresetConsumed={clearPreset} onOpen={setOpenId} />
          </div>
          {tab === "budget" ? <BudgetScreen /> : null}
          {tab === "reports" ? (
            <Suspense fallback={<p className="mono px-4 pt-8 text-xs text-muted">Loading reports…</p>}>
              <ReportsScreen />
            </Suspense>
          ) : null}
        </main>

        {/* ── Bottom nav ─────────────────────────────────────────────── */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]"
          style={{ backgroundImage: "linear-gradient(to top, #141414, #1a1a1a)" }}
        >
          {/* Amber top-edge accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-teal opacity-30" />

          <div className="mx-auto grid h-14 max-w-md grid-cols-5 px-1">
            <NavButton
              label="Home"
              active={tab === "home"}
              onClick={() => setTab("home")}
              icon={<House className="size-[18px]" strokeWidth={1.75} />}
            />
            <NavButton
              label="Log"
              active={tab === "history"}
              onClick={() => setTab("history")}
              icon={<List className="size-[18px]" strokeWidth={1.75} />}
            />

            {/* Centre FAB */}
            <button
              type="button"
              id="add-transaction-btn"
              className="press flex min-w-0 flex-col items-center justify-end pb-1.5"
              onClick={() => openAdd(null)}
            >
              <span className="relative -mt-5 grid size-11 place-items-center rounded-sm bg-teal glow-amber">
                <Plus className="size-5 text-[#0d0d0d]" strokeWidth={2.5} />
              </span>
              <span className="section-tag mt-1" style={{ color: "var(--color-teal)" }}>
                Add
              </span>
            </button>

            <NavButton
              label="Budget"
              active={tab === "budget"}
              onClick={() => setTab("budget")}
              icon={<Wallet className="size-[18px]" strokeWidth={1.75} />}
            />
            <NavButton
              label="Reports"
              active={tab === "reports"}
              onClick={() => setTab("reports")}
              icon={<ChartPie className="size-[18px]" strokeWidth={1.75} />}
            />
          </div>
        </nav>
      </div>

      {openId ? (
        <DetailSheet
          id={openId}
          onClose={() => setOpenId(null)}
          onEdit={(id) => {
            setOpenId(null);
            openAdd(id);
          }}
        />
      ) : null}

      <Toaster
        position="top-center"
        offset={16}
        toastOptions={{
          style: {
            background: "var(--color-card)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-line)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
          },
        }}
      />
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`press flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 transition-colors ${
        active ? "text-teal" : "text-muted hover:text-ink"
      }`}
    >
      {icon}
      <span className="section-tag" style={active ? { color: "var(--color-teal)" } : undefined}>
        {label}
      </span>
    </button>
  );
}
