import { Link } from "react-router";
import { History } from "lucide-react";
import { woodClassLabels, type Receipt } from "../../services/receipts";

function formatKg(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function RecentActivity({ receipts }: { receipts: Receipt[] }) {
  const recent = [...receipts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="rounded-card border border-line bg-paper-raised p-4.5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-canopy/12 text-forest-deep">
            <History className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-display text-[15px] font-semibold text-ink-navy">Atividade recente</p>
            <p className="text-[11.5px] text-ink-soft">Últimas pesagens registradas</p>
          </div>
        </div>
        <Link to="/pesagens" className="shrink-0 text-[12.5px] font-bold text-forest-deep hover:underline">
          Ver todas
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-soft">Nenhuma pesagem registrada ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {recent.map((receipt) => (
            <li key={receipt.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{receipt.supplier}</p>
                <p className="truncate text-[11.5px] text-ink-soft">
                  {woodClassLabels[receipt.type]} · {receipt.truckPlate}
                  {receipt.trailerPlate ? ` / ${receipt.trailerPlate}` : ""} · {formatDateTime(receipt.createdAt)}
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-bold text-ink">{formatKg(receipt.netWeight)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
