import { useCallback, useEffect, useMemo, useState } from "react";
import { getReceipts, type Receipt } from "../../services/receipts";
import { computeReconciliation } from "./stats";
import ComplementaryInvoiceModal from "./complementary-invoice-modal";

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatKg(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const columns = ["Fornecedor", "Recebido", "NF Original", "Já Complementado", "Diferença Pendente", "Valor Pendente", ""];

export default function ReconciliationPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(currentMonthValue());
  const [activeSupplier, setActiveSupplier] = useState<string | null>(null);

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch {
      setError("Não foi possível carregar os dados de fechamento agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  const monthReceipts = useMemo(() => {
    const [year, monthIndex] = month.split("-").map(Number);
    return receipts.filter((r) => {
      const created = new Date(r.createdAt);
      return created.getFullYear() === year && created.getMonth() + 1 === monthIndex;
    });
  }, [receipts, month]);

  const rows = useMemo(() => computeReconciliation(monthReceipts), [monthReceipts]);

  const activeSupplierReceipts = useMemo(() => {
    if (!activeSupplier) return [];
    return receipts.filter(
      (r) =>
        r.supplier === activeSupplier &&
        !r.complementaryInvoiceId &&
        r.invoiceWeight !== null &&
        r.netWeight > r.invoiceWeight,
    );
  }, [receipts, activeSupplier]);

  function handleLinked() {
    setActiveSupplier(null);
    loadReceipts();
  }

  return (
    <div className="p-8.5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-navy">Fechamento de notas complementares</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">
            Recebido vs. faturado por fornecedor — substitui a planilha de fechamento
          </p>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-ink-soft">
          Período
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-control border border-line bg-paper px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-canopy focus:ring-2 focus:ring-canopy/20"
          />
        </label>
      </div>

      {loading && <p className="text-[13px] text-ink-soft">Carregando…</p>}

      {!loading && error && (
        <div className="flex items-center justify-between gap-4 rounded-control border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] text-danger-text">
          {error}
          <button type="button" onClick={loadReceipts} className="font-bold underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-card border border-line bg-paper-raised px-6 py-12 text-center text-[13px] text-ink-soft shadow-card">
          Nenhuma pesagem com dados de nota fiscal neste período.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line bg-paper-raised shadow-card">
          <table className="w-full min-w-200 border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.supplier} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">{row.supplier}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">{formatKg(row.receivedKg)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">{formatKg(row.invoicedKg)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">{formatKg(row.reconciledDiffKg)}</td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 font-semibold ${
                      row.pendingDiffKg > 0 ? "text-amber-text" : "text-ink"
                    }`}
                  >
                    {formatKg(row.pendingDiffKg)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink">{formatCurrency(row.pendingValue)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {row.pendingReceiptIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveSupplier(row.supplier)}
                        className="rounded-control bg-canopy px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-canopy-dark"
                      >
                        Lançar complementar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSupplier && (
        <ComplementaryInvoiceModal
          supplier={activeSupplier}
          receipts={activeSupplierReceipts}
          onClose={() => setActiveSupplier(null)}
          onCreated={handleLinked}
        />
      )}
    </div>
  );
}
