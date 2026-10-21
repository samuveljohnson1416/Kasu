import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/spend/ui";
import { countingNote, describeDate } from "@/lib/spend/calc";
import { formatINR } from "@/lib/spend/money";
import { needLabel, paymentLabel } from "@/lib/spend/model";
import { useSpend } from "@/lib/spend/store";

export function DetailSheet({
  id,
  onClose,
  onEdit,
}: {
  id: string;
  onClose: () => void;
  onEdit: (id: string) => void;
}) {
  const tx = useSpend((state) => state.transactions.find((item) => item.id === id));
  const remove = useSpend((state) => state.deleteTransaction);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!tx) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-detail-title"
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-sm border-t border-line bg-card px-5 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Amber top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-teal opacity-40" />
        <div className="mb-4 flex items-center justify-between">
          <p className="section-tag">Transaction</p>
          <button type="button" aria-label="Close details" className="press grid size-10 place-items-center text-muted hover:text-ink" onClick={onClose}>
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
        <h2 id="tx-detail-title" className="text-2xl font-bold tracking-tight break-words text-ink">
          {tx.item}
        </h2>
        <p className="mono mt-2 text-3xl font-bold text-teal tabular-nums">{formatINR(tx.amountPaise)}</p>
        <dl className="mt-4 space-y-3 rounded-sm border border-line bg-surface p-3">
          <Row label="Category" value={tx.category} />
          <Row label="Date" value={describeDate(tx)} />
          <Row label="Payment" value={paymentLabel(tx.paymentMethod)} />
          <Row label="Need or want" value={needLabel(tx.needWant)} />
          <Row label="Refundable" value={tx.refundable ? "Yes" : "No"} />
          {tx.notes ? <Row label="Notes" value={tx.notes} /> : null}
        </dl>
        <p className="mt-3 text-xs text-muted">{countingNote(tx)}</p>
        {confirming ? (
          <div className="mt-5 rounded-sm border border-bad/30 bg-bad-soft p-4 text-ink">
            <p className="text-sm font-bold text-bad">Delete this expense?</p>
            <p className="mt-1 text-sm">Totals, budgets, and charts will update. This cannot be undone.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={() => setConfirming(false)}>
                Keep
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  remove(tx.id);
                  onClose();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={() => onEdit(tx.id)}>
              Edit
            </Button>
            <Button type="button" variant="danger" onClick={() => setConfirming(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="section-tag pt-0.5">{label}</dt>
      <dd className="mono text-right text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
