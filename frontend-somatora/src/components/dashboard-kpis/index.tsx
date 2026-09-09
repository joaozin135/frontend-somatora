import { Scale, Package, Truck, ClipboardList } from "lucide-react";
import KpiCard from "../kpi-card";

/**
 * DashboardKpis — SOMAPAR
 * Linha de KPIs da tela inicial. Os números abaixo são placeholder — troque
 * pelos dados reais assim que a API de pesagens estiver disponível
 * (provavelmente um GET tipo /dashboard/resumo ou similar).
 */
export default function DashboardKpis() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={Scale}
        label="Pesagens hoje"
        value="34"
        trend={{ direction: "up", label: "12% vs. ontem" }}
      />
      <KpiCard
        icon={Package}
        label="Volume recebido no mês"
        value="8.240 m³"
        trend={{ direction: "up", label: "6,4% vs. mês anterior" }}
      />
      <KpiCard
        icon={Truck}
        label="Caminhões na fila"
        value="5"
        trend={{ direction: "warn", label: "Aguardando pesagem" }}
      />
      <KpiCard
        icon={ClipboardList}
        label="Notas pendentes"
        value="3"
        variant="alert"
        trend={{ direction: "warn", label: "Aguardando conferência" }}
      />
    </section>
  );
}