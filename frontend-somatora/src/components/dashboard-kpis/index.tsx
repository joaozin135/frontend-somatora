import { useEffect, useState } from "react";
import { Scale, Package, Building2, BarChart3 } from "lucide-react";
import KpiCard, { type KpiTrend } from "../kpi-card";
import { getReceipts, type Receipt } from "../../services/receipts";
import { computeDashboardStats } from "./stats";

function formatTon(kg: number) {
  return `${(kg / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`;
}

function buildTrend(current: number, previous: number, suffix: string): KpiTrend | undefined {
  if (previous === 0) return undefined;
  const change = ((current - previous) / previous) * 100;
  if (Math.round(change) === 0) return undefined;
  return {
    direction: change > 0 ? "up" : "down",
    label: `${change > 0 ? "+" : ""}${change.toFixed(0)}% ${suffix}`,
  };
}

export default function DashboardKpis() {
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getReceipts()
      .then(setReceipts)
      .catch(() => setError("Não foi possível carregar os indicadores agora."));
  }, []);

  if (error) {
    return (
      <div className="rounded-control border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] text-danger-text">
        {error}
      </div>
    );
  }

  if (!receipts) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-card border border-line bg-paper-raised shadow-card" />
        ))}
      </section>
    );
  }

  const stats = computeDashboardStats(receipts);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={Scale}
        label="Pesagens hoje"
        value={stats.weighingsToday.toString()}
        trend={buildTrend(stats.weighingsToday, stats.weighingsYesterday, "vs. ontem")}
      />
      <KpiCard
        icon={Package}
        label="Volume recebido no mês"
        value={formatTon(stats.volumeThisMonthKg)}
        trend={buildTrend(stats.volumeThisMonthKg, stats.volumeLastMonthKg, "vs. mês anterior")}
      />
      <KpiCard
        icon={Building2}
        label="Fornecedores atendidos no mês"
        value={stats.suppliersThisMonth.toString()}
        trend={buildTrend(stats.suppliersThisMonth, stats.suppliersLastMonth, "vs. mês anterior")}
      />
      <KpiCard
        icon={BarChart3}
        label="Peso líquido médio por carga"
        value={formatTon(stats.avgNetWeightThisMonthKg)}
        trend={buildTrend(stats.avgNetWeightThisMonthKg, stats.avgNetWeightLastMonthKg, "vs. mês anterior")}
      />
    </section>
  );
}
