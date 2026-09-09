import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";

/**
 * KpiCard — SOMAPAR
 * Card de número rápido, genérico o bastante pra ser usado em qualquer tela
 * (Dashboard, Usuários, etc.), não só aqui.
 *
 * Uso:
 *   <KpiCard icon={Scale} label="Pesagens hoje" value="34" trend={{ direction: "up", label: "12% vs. ontem" }} />
 *   <KpiCard icon={ClipboardList} label="Notas pendentes" value="3" variant="alert" trend={{ direction: "warn", label: "Aguardando conferência" }} />
 */

export interface KpiTrend {
  direction: "up" | "down" | "warn";
  label: string;
}

export interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: KpiTrend;
  /** "alert" troca o acento decorativo e o fundo do ícone pra tom âmbar. */
  variant?: "default" | "alert";
}

export default function KpiCard({ icon: Icon, label, value, trend, variant = "default" }: KpiCardProps) {
  const isAlert = variant === "alert";

  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-paper-raised p-4.5 pb-4 shadow-card">
      <span
        aria-hidden="true"
        className={`absolute -right-3.5 -top-3.5 h-11.5 w-11.5 rounded-[40%_55%_45%_55%/50%_45%_55%_50%] ${
          isAlert ? "bg-amber-soft" : "bg-sage/35"
        }`}
      />

      <div
        className={`relative flex h-8 w-8 items-center justify-center rounded-[9px] ${
          isAlert ? "bg-amber-soft text-amber" : "bg-canopy/12 text-forest-deep"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>

      <p className="relative mt-3.5 text-xs font-semibold text-ink-soft">{label}</p>
      <p className="relative mt-1 font-display text-[26px] font-semibold text-ink-navy">{value}</p>

      {trend && (
        <span
          className={`relative mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-bold ${
            trend.direction === "up"
              ? "bg-canopy/14 text-forest-deep"
              : trend.direction === "down"
                ? "bg-danger/10 text-danger-text"
                : "bg-amber-soft text-amber-text"
          }`}
        >
          {trend.direction === "up" && <ArrowUp className="h-2.75 w-2.75" strokeWidth={3} />}
          {trend.direction === "down" && <ArrowDown className="h-2.75 w-2.75" strokeWidth={3} />}
          {trend.label}
        </span>
      )}
    </div>
  );
}