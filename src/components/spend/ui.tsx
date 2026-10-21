import { ChevronLeft, ChevronRight } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { describeDate } from "@/lib/spend/calc";
import { monthLabel, shiftMonth } from "@/lib/spend/dates";
import { formatINR } from "@/lib/spend/money";
import type { Transaction } from "@/lib/spend/model";
import { useSpend } from "@/lib/spend/store";

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
        "press inline-flex h-12 items-center justify-center rounded-md px-4 text-base font-medium",
        variant === "primary" && "bg-teal text-paper",
        variant === "secondary" && "border border-line bg-card text-ink",
        variant === "ghost" && "bg-transparent text-ink",
        variant === "danger" && "bg-bad text-paper",
        className,
      )}
    />
  );
}

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      {...props}
      className={cn("h-12 w-full rounded-md border border-line bg-card px-3 text-base text-ink", className)}
    />
  );
});

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-md border border-line bg-card px-3 py-3 text-base text-ink",
        className,
      )}
    />
  );
}

export function SelectField({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn("h-12 w-full rounded-md border border-line bg-card px-3 text-base text-ink", className)}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-sm text-muted">{hint}</span> : null}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-2xl border border-line bg-card p-4 shadow-card", className)}>{children}</section>;
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="pt-6">
      <h1 className="text-[clamp(1.75rem,8vw,1.875rem)] font-medium tracking-tight text-ink">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
    </header>
  );
}

export function MonthSwitcher() {
  const viewMonth = useSpend((state) => state.viewMonth);
  const setViewMonth = useSpend((state) => state.setViewMonth);
  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-card px-1">
      <button
        type="button"
        aria-label="Previous month"
        className="press grid size-11 place-items-center rounded-md text-ink"
        onClick={() => setViewMonth(shiftMonth(viewMonth, -1))}
      >
        <ChevronLeft className="size-5" strokeWidth={1.75} />
      </button>
      <p className="min-w-0 truncate px-2 text-sm font-medium text-ink">{monthLabel(viewMonth)}</p>
      <button
        type="button"
        aria-label="Next month"
        className="press grid size-11 place-items-center rounded-md text-ink"
        onClick={() => setViewMonth(shiftMonth(viewMonth, 1))}
      >
        <ChevronRight className="size-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function Meter({ percent }: { percent: number }) {
  const tone = percent > 90 ? "bad" : percent >= 70 ? "warn" : "good";
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-line"
      role="progressbar"
      aria-valuenow={Math.max(0, percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Budget used"
    >
      <div
        className={cn("h-full rounded-full", tone === "good" && "bg-good", tone === "warn" && "bg-warn", tone === "bad" && "bg-bad")}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function TxButton({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex min-h-14 w-full items-center gap-3 py-2 text-left"
      aria-label={`Open ${tx.item}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{tx.item}</span>
        <span className="block truncate text-sm text-muted">
          {tx.category} · {describeDate(tx)}
          {tx.refundable ? " · Refundable" : ""}
        </span>
      </span>
      <span className="shrink-0 font-medium text-ink tabular-nums">{formatINR(tx.amountPaise)}</span>
    </button>
  );
}

export function Money({ paise, className }: { paise: number; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{formatINR(paise)}</span>;
}
