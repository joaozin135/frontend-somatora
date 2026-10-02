import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import Modal from "../../components/modal";
import {
  DiameterClass,
  WoodClass,
  diameterClassLabels,
  woodClassLabels,
  type DiameterClass as DiameterClassType,
  type Receipt,
  type WoodClass as WoodClassType,
} from "../../services/receipts";
import { buildStatement, receiptValue, receiptsForSupplierRange, type StatementFilters } from "./statement";
import { exportStatementToPdf, exportStatementToXlsx } from "./export";

export interface StatementPanelProps {
  supplier: string;
  month: string;
  receipts: Receipt[];
  onClose: () => void;
}

const selectClass =
  "w-full rounded-control border border-line bg-paper px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-canopy focus:ring-2 focus:ring-canopy/20";

const dash = <span className="text-ink-placeholder">—</span>;

function formatKg(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusLabel(receipt: Receipt) {
  if (receipt.complementaryInvoice) return `Complementada (NF ${receipt.complementaryInvoice.number})`;
  if (receipt.invoiceWeight !== null && receipt.netWeight > receipt.invoiceWeight) return "Pendente";
  return "—";
}

/** "2026-09" -> {start: "2026-09-01", end: "2026-09-30"} — usado só como ponto de partida do período. */
function monthToDateRange(month: string): { start: string; end: string } {
  const [year, monthIndex] = month.split("-").map(Number);
  const lastDay = new Date(year, monthIndex, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    start: `${year}-${pad(monthIndex)}-01`,
    end: `${year}-${pad(monthIndex)}-${pad(lastDay)}`,
  };
}

export default function StatementPanel({ supplier, month, receipts, onClose }: StatementPanelProps) {
  const [{ start: startDate, end: endDate }, setDateRange] = useState(() => monthToDateRange(month));
  const [driver, setDriver] = useState("");
  const [type, setType] = useState<WoodClassType | "">("");
  const [diameterClass, setDiameterClass] = useState<DiameterClassType | "">("");
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  const invalidRange = startDate > endDate;

  const supplierRangeReceipts = useMemo(
    () => (invalidRange ? [] : receiptsForSupplierRange(receipts, supplier, startDate, endDate)),
    [receipts, supplier, startDate, endDate, invalidRange],
  );

  const driverOptions = useMemo(
    () => Array.from(new Set(supplierRangeReceipts.map((r) => r.driver))).sort(),
    [supplierRangeReceipts],
  );

  const filters: StatementFilters = {
    supplier,
    startDate,
    endDate,
    driver: driver || undefined,
    type: type || undefined,
    diameterClass: diameterClass || undefined,
  };

  const statement = useMemo(() => buildStatement(receipts, filters), [receipts, filters]);

  async function handleExport(format: "pdf" | "xlsx") {
    setExporting(format);
    try {
      if (format === "pdf") {
        await exportStatementToPdf(statement, filters);
      } else {
        await exportStatementToXlsx(statement, filters);
      }
    } finally {
      setExporting(null);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Emitir relatório — ${supplier}`} size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Data inicial
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className={selectClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Data final
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className={selectClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Motorista
            </label>
            <select value={driver} onChange={(e) => setDriver(e.target.value)} className={selectClass}>
              <option value="">Todos</option>
              {driverOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">Classe</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WoodClassType | "")}
              className={selectClass}
            >
              <option value="">Todas</option>
              {Object.values(WoodClass).map((value) => (
                <option key={value} value={value}>
                  {woodClassLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Diâmetro
            </label>
            <select
              value={diameterClass}
              onChange={(e) => setDiameterClass(e.target.value as DiameterClassType | "")}
              className={selectClass}
            >
              <option value="">Todos</option>
              {Object.values(DiameterClass).map((value) => (
                <option key={value} value={value}>
                  {diameterClassLabels[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {invalidRange && (
          <p className="rounded-control bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-text">
            A data inicial não pode ser depois da data final.
          </p>
        )}

        <div className="overflow-x-auto rounded-control border border-line">
          <table className="w-full min-w-220 border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-line bg-paper">
                {["Data", "Nº NF", "Motorista", "Classe", "Diâmetro", "Peso Líquido", "Peso NF", "Diferença", "R$/t", "Valor", "Status"].map(
                  (c) => (
                    <th
                      key={c}
                      className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-ink-soft"
                    >
                      {c}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {statement.rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center text-ink-soft">
                    Nenhuma pesagem encontrada com esses filtros.
                  </td>
                </tr>
              )}
              {statement.rows.map((receipt) => {
                const diff = receipt.invoiceWeight !== null ? receipt.netWeight - receipt.invoiceWeight : null;
                const value = receiptValue(receipt);
                return (
                  <tr key={receipt.id} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 text-ink">
                      {new Date(receipt.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink">{receipt.invoiceNumber}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink">{receipt.driver}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink">{woodClassLabels[receipt.type]}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink">{diameterClassLabels[receipt.diameterClass]}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-ink">
                      {formatKg(receipt.netWeight)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink">
                      {receipt.invoiceWeight !== null ? formatKg(receipt.invoiceWeight) : dash}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink">{diff !== null ? formatKg(diff) : dash}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink">
                      {receipt.pricePerTon !== null ? formatCurrency(receipt.pricePerTon) : dash}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-ink">
                      {value !== null ? formatCurrency(value) : dash}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink">{statusLabel(receipt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-control border border-line bg-paper px-4 py-3 text-[12.5px] sm:grid-cols-6">
          <div>
            <p className="text-ink-soft">Recebido</p>
            <p className="font-semibold text-ink">{formatKg(statement.totals.receivedKg)}</p>
          </div>
          <div>
            <p className="text-ink-soft">NF Original</p>
            <p className="font-semibold text-ink">{formatKg(statement.totals.invoicedKg)}</p>
          </div>
          <div>
            <p className="text-ink-soft">Já Complementado</p>
            <p className="font-semibold text-ink">{formatKg(statement.totals.reconciledDiffKg)}</p>
          </div>
          <div>
            <p className="text-ink-soft">Diferença Pendente</p>
            <p className="font-semibold text-amber-text">{formatKg(statement.totals.pendingDiffKg)}</p>
          </div>
          <div>
            <p className="text-ink-soft">Valor Pendente</p>
            <p className="font-semibold text-ink">{formatCurrency(statement.totals.pendingValue)}</p>
          </div>
          <div>
            <p className="text-ink-soft">Valor Total do Período</p>
            <p className="font-display text-[15px] font-semibold text-forest-deep">
              {formatCurrency(statement.totals.totalValue)}
            </p>
          </div>
        </div>

        {statement.totals.unpricedCount > 0 && (
          <p className="-mt-3 text-right text-[11.5px] text-amber-text">
            {statement.totals.unpricedCount === 1
              ? "1 pesagem sem preço por tonelada não entrou no valor total."
              : `${statement.totals.unpricedCount} pesagens sem preço por tonelada não entraram no valor total.`}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-4.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-control border border-line px-4.5 py-2.5 text-[13px] font-semibold text-ink-soft transition hover:bg-paper"
          >
            Fechar
          </button>
          <button
            type="button"
            disabled={exporting !== null || statement.rows.length === 0}
            onClick={() => handleExport("xlsx")}
            className="flex items-center gap-2 rounded-control border border-line bg-paper-raised px-4.5 py-2.5 text-[13px] font-bold text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FileSpreadsheet className="h-4 w-4" strokeWidth={1.8} />
            {exporting === "xlsx" ? "Gerando…" : "Baixar XLS"}
          </button>
          <button
            type="button"
            disabled={exporting !== null || statement.rows.length === 0}
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 rounded-control bg-canopy px-4.5 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FileDown className="h-4 w-4" strokeWidth={2} />
            {exporting === "pdf" ? "Gerando…" : "Baixar PDF"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
