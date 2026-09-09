import { useEffect, useMemo, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import Modal from "../../components/modal";
import { createComplementaryInvoice } from "../../services/complementary-invoices";
import type { Receipt } from "../../services/receipts";

export interface ComplementaryInvoiceModalProps {
  supplier: string;
  receipts: Receipt[];
  onClose: () => void;
  onCreated: () => void;
}

const inputClass =
  "w-full rounded-control border border-line bg-paper px-3.5 py-2.75 text-[13px] text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-canopy focus:ring-2 focus:ring-canopy/20";

function formatKg(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg`;
}

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return "Não foi possível lançar a nota complementar. Tente novamente.";
}

export default function ComplementaryInvoiceModal({
  supplier,
  receipts,
  onClose,
  onCreated,
}: ComplementaryInvoiceModalProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(receipts.map((r) => r.id)));
  const [number, setNumber] = useState("");
  const [totalWeight, setTotalWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedDiffSum = useMemo(
    () =>
      receipts
        .filter((r) => selected.has(r.id))
        .reduce((total, r) => total + (r.netWeight - (r.invoiceWeight ?? 0)), 0),
    [receipts, selected],
  );

  useEffect(() => {
    setTotalWeight(selectedDiffSum > 0 ? selectedDiffSum.toFixed(2) : "");
  }, [selectedDiffSum]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (selected.size === 0) {
      setError("Selecione ao menos uma pesagem.");
      return;
    }
    if (!number || !totalWeight) {
      setError("Preencha o número e o peso total da nota complementar.");
      return;
    }

    setSubmitting(true);
    try {
      await createComplementaryInvoice({
        number,
        totalWeight: Number(totalWeight.replace(",", ".")),
        receiptIds: Array.from(selected),
      });
      onCreated();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Lançar NF complementar — ${supplier}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            Pesagens pendentes ({receipts.length})
          </p>
          <div className="max-h-64 overflow-y-auto rounded-control border border-line">
            {receipts.map((r) => {
              const diff = r.netWeight - (r.invoiceWeight ?? 0);
              return (
                <label
                  key={r.id}
                  className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2.5 text-[12.5px] last:border-0 hover:bg-paper"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      className="h-4 w-4 accent-canopy"
                    />
                    <span>
                      NF {r.invoiceNumber} · {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </span>
                  <span className="font-semibold text-ink">{formatKg(diff)}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="ci-number"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft"
            >
              Número da NF complementar
            </label>
            <input
              id="ci-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className={inputClass}
              placeholder="Ex: 7890"
            />
          </div>
          <div>
            <label
              htmlFor="ci-weight"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft"
            >
              Peso total da complementar (kg)
            </label>
            <input
              id="ci-weight"
              value={totalWeight}
              onChange={(e) => setTotalWeight(e.target.value)}
              inputMode="decimal"
              className={inputClass}
              placeholder="0,00"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-control bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-text">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-line pt-4.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-control border border-line px-4.5 py-2.5 text-[13px] font-semibold text-ink-soft transition hover:bg-paper"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-control bg-canopy px-4.5 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Salvando…" : "Lançar complementar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
