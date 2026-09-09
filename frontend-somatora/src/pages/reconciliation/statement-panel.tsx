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
import { buildStatement, receiptsForSupplierMonth, type StatementFilters } from "./statement";
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

function statusLabel(receipt: Receipt) {
  if (receipt.complementaryInvoice) return `Complementada (NF ${receipt.complementaryInvoice.number})`;
  if (receipt.invoiceWeight !== null && receipt.netWeight > receipt.invoiceWeight) return "Pendente";
  return "—";
}

export default function StatementPanel({ supplier, month, receipts, onClose }: StatementPanelProps) {
  const [driver, setDriver] = useState("");
  const [type, setType] = useState<WoodClassType | "">("");
  const [diameterClass, setDiameterClass] = useState<DiameterClassType | "">("");
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  const supplierMonthReceipts = useMemo(
    () => receiptsForSupplierMonth(receipts, supplier, month),
    [receipts, supplier, month],
  );

  const driverOptions = useMemo(
    () => Array.from(new Set(supplierMonthReceipts.map((r) => r.driver))).sort(),
    [supplierMonthReceipts],
  );

  const filters: StatementFilters = {
    supplier,
    month,
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

        <div className="overflow-x-auto rounded-control border border-line">
          <table className="w-full min-w-180 border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-line bg-paper">
                {["Data", "Nº NF", "Motorista", "Classe", "Diâmetro", "Peso Líquido", "Peso NF", "Diferença", "Status"].map(
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
                  <td colSpan={9} className="px-3 py-6 text-center text-ink-soft">
                    Nenhuma pesagem encontrada com esses filtros.
                  </td>
                </tr>
              )}
              {statement.rows.map((receipt) => {
                const diff = receipt.invoiceWeight !== null ? receipt.netWeight - receipt.invoiceWeight : null;
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
                    <td className="whitespace-nowrap px-3 py-2 text-ink">{statusLabel(receipt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-control border border-line bg-paper px-4 py-3 text-[12.5px] sm:grid-cols-5">
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
            <p className="font-semibold text-ink">
              {statement.totals.pendingValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        </div>

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
