import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { describeDate } from "@/lib/spend/calc";
import { monthLabel, shiftMonth } from "@/lib/spend/dates";
import { formatINR } from "@/lib/spend/money";
import type { Transaction } from "@/lib/spend/model";
import { useSpend } from "@/lib/spend/store";

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      {...props}
      className={cn(
        "press inline-flex h-11 items-center justify-center rounded-sm px-5 text-sm font-semibold tracking-wide transition-colors",
        variant === "primary" &&
          "bg-teal text-[#0d0d0d] hover:bg-teal/80 glow-amber",
        variant === "secondary" &&
          "border border-line bg-card text-ink hover:bg-card-hover",
        variant === "ghost" &&
          "bg-transparent text-ink hover:bg-subtle",
        variant === "danger" &&
          "border border-bad/40 bg-bad-soft text-bad hover:bg-bad/20",
        className,
      )}
    />
  );
}

// ── TextField ─────────────────────────────────────────────────────────────────
export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "mono h-11 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/60 focus:border-teal focus:bg-card transition-colors",
          className,
        )}
      />
    );
  },
);

// ── TextArea ──────────────────────────────────────────────────────────────────
export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "mono min-h-20 w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-teal focus:bg-card resize-none transition-colors",
        className,
      )}
    />
  );
}

// ── SelectField ───────────────────────────────────────────────────────────────
export function SelectField({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "mono h-11 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink focus:border-teal transition-colors appearance-none",
        className,
      )}
    />
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="section-tag mb-2 block">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        "rounded-sm border border-line bg-card shadow-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

// ── ScreenHeader ──────────────────────────────────────────────────────────────
export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="pt-6 pb-1">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="section-tag">Kasu</span>
        <span className="section-tag opacity-40">/</span>
        <span className="section-tag text-teal">{title.toLowerCase()}</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
      {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
    </header>
  );
}

// ── MonthSwitcher ─────────────────────────────────────────────────────────────
export function MonthSwitcher() {
  const viewMonth = useSpend((state) => state.viewMonth);
  const setViewMonth = useSpend((state) => state.setViewMonth);
  return (
    <div className="flex items-center justify-between rounded-sm border border-line bg-card px-1">
      <button
        type="button"
        aria-label="Previous month"
        className="press grid size-10 place-items-center text-muted hover:text-ink transition-colors"
        onClick={() => setViewMonth(shiftMonth(viewMonth, -1))}
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
      </button>
      <p className="mono min-w-0 truncate px-2 text-xs font-semibold tracking-wider text-ink uppercase">
        {monthLabel(viewMonth)}
      </p>
      <button
        type="button"
        aria-label="Next month"
        className="press grid size-10 place-items-center text-muted hover:text-ink transition-colors"
        onClick={() => setViewMonth(shiftMonth(viewMonth, 1))}
      >
        <ChevronRight className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

// ── Meter ─────────────────────────────────────────────────────────────────────
export function Meter({ percent }: { percent: number }) {
  const tone = percent > 90 ? "bad" : percent >= 70 ? "warn" : "good";
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="relative h-1.5 overflow-hidden rounded-full bg-subtle"
      role="progressbar"
      aria-valuenow={Math.max(0, percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Budget used"
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          tone === "good" && "bg-good",
          tone === "warn" && "bg-warn",
          tone === "bad"  && "bg-bad",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ── TxButton ──────────────────────────────────────────────────────────────────
export function TxButton({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex min-h-12 w-full items-center gap-3 py-2 text-left group"
      aria-label={`Open ${tx.item}`}
    >
      {/* Category dot */}
      <span className="size-1.5 shrink-0 rounded-full bg-teal opacity-60 group-hover:opacity-100 transition-opacity" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{tx.item}</span>
        <span className="mono block truncate text-xs text-muted">
          {tx.category} · {describeDate(tx)}
          {tx.refundable ? " · ↩ refundable" : ""}
        </span>
      </span>
      <span className="mono shrink-0 text-sm font-semibold text-ink tabular-nums">
        {formatINR(tx.amountPaise)}
      </span>
    </button>
  );
}

// ── Money ─────────────────────────────────────────────────────────────────────
export function Money({ paise, className }: { paise: number; className?: string }) {
  return (
    <span className={cn("mono tabular-nums", className)}>
      {formatINR(paise)}
    </span>
  );
}
