import { Link } from "react-router";
import { AlertTriangle, CircleCheck } from "lucide-react";
import type { Receipt } from "../../services/receipts";
import { computeReconciliation } from "../../pages/reconciliation/stats";

function formatTon(kg: number) {
  return `${(kg / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PendingSummary({ receipts }: { receipts: Receipt[] }) {
  const rows = computeReconciliation(receipts).filter((row) => row.pendingDiffKg > 0);
  const totalValue = rows.reduce((sum, row) => sum + row.pendingValue, 0);
  const top = rows.slice(0, 4);

  return (
    <div className="flex h-full flex-col rounded-card border border-line bg-paper-raised p-4.5 shadow-card">
      <div className="mb-4 flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${
            rows.length ? "bg-amber-soft text-amber" : "bg-canopy/12 text-forest-deep"
          }`}
        >
          {rows.length ? (
            <AlertTriangle className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <CircleCheck className="h-4 w-4" strokeWidth={1.8} />
          )}
        </div>
        <div>
          <p className="font-display text-[15px] font-semibold text-ink-navy">Pendências de fechamento</p>
          <p className="text-[11.5px] text-ink-soft">Diferenças aguardando nota complementar</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6 text-center">
          <p className="text-[13px] font-semibold text-ink">Tudo em dia</p>
          <p className="text-[12px] text-ink-soft">Nenhuma diferença pendente de complementar.</p>
        </div>
      ) : (
        <>
          <p className="font-display text-[26px] font-semibold text-ink-navy">{formatCurrency(totalValue)}</p>
          <p className="mb-3.5 text-[11.5px] text-ink-soft">
            em {rows.length} {rows.length === 1 ? "fornecedor" : "fornecedores"}
          </p>

          <ul className="flex flex-1 flex-col gap-2.5">
            {top.map((row) => (
              <li key={row.supplier} className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="truncate font-semibold text-ink">{row.supplier}</span>
                <span className="shrink-0 font-bold text-amber-text">{formatTon(row.pendingDiffKg)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <Link
        to="/relatorios"
        className="mt-4 block rounded-control border border-line px-3 py-2 text-center text-[12.5px] font-bold text-ink transition hover:bg-paper"
      >
        Ver relatório completo
      </Link>
    </div>
  );
}
