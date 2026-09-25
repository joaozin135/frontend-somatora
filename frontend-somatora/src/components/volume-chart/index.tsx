import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import type { Receipt } from "../../services/receipts";

interface MonthBucket {
  key: string;
  label: string;
  volumeKg: number;
}

function buildMonthlySeries(receipts: Receipt[], months = 6): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${ref.getFullYear()}-${ref.getMonth()}`,
      label: ref.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      volumeKg: 0,
    });
  }

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const receipt of receipts) {
    const created = new Date(receipt.createdAt);
    const bucket = byKey.get(`${created.getFullYear()}-${created.getMonth()}`);
    if (bucket) bucket.volumeKg += receipt.netWeight;
  }

  return buckets;
}

function formatTon(kg: number) {
  return `${(kg / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`;
}

export default function VolumeChart({ receipts }: { receipts: Receipt[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const buckets = useMemo(() => buildMonthlySeries(receipts), [receipts]);
  const maxKg = Math.max(...buckets.map((bucket) => bucket.volumeKg), 1);
  const lastIndex = buckets.length - 1;
  const ticks = [maxKg, maxKg / 2, 0];

  return (
    <div className="h-full rounded-card border border-line bg-paper-raised p-4.5 shadow-card">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-canopy/12 text-forest-deep">
          <TrendingUp className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="font-display text-[15px] font-semibold text-ink-navy">Volume recebido por mês</p>
          <p className="text-[11.5px] text-ink-soft">Últimos 6 meses, em toneladas líquidas</p>
        </div>
      </div>

      <div className="relative h-44 pl-10">
        {ticks.map((tick, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 flex items-center gap-2"
            style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
          >
            <span className="w-7 shrink-0 -translate-y-1/2 text-right text-[10.5px] tabular-nums text-ink-soft">
              {(tick / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </span>
            <span className="h-px w-full -translate-y-1/2 bg-line" />
          </div>
        ))}

        <div className="absolute inset-y-0 left-10 right-0 flex items-end justify-between gap-2">
          {buckets.map((bucket, i) => {
            const heightPct = bucket.volumeKg > 0 ? Math.max((bucket.volumeKg / maxKg) * 100, 3) : 0;
            const isLast = i === lastIndex;
            const showLabel = hovered === i || isLast;

            return (
              <div
                key={bucket.key}
                className="group relative flex h-full flex-1 cursor-default flex-col items-center justify-end outline-none"
                tabIndex={0}
                role="img"
                aria-label={`${bucket.label}: ${formatTon(bucket.volumeKg)}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                {showLabel && (
                  <div
                    className={`absolute bottom-full mb-1.5 whitespace-nowrap rounded-control px-2 py-1 text-[11px] font-bold ${
                      hovered === i ? "bg-ink-navy text-white shadow-card" : "text-forest-deep"
                    }`}
                  >
                    {formatTon(bucket.volumeKg)}
                  </div>
                )}
                <div
                  className="w-full max-w-6 rounded-t-[4px] bg-canopy transition-colors group-hover:bg-canopy-dark group-focus:bg-canopy-dark"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-10">
        {buckets.map((bucket) => (
          <span key={bucket.key} className="flex-1 text-center text-[11px] font-semibold capitalize text-ink-soft">
            {bucket.label}
          </span>
        ))}
      </div>
    </div>
  );
}
