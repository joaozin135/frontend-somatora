import { useCallback, useEffect, useState } from "react";
import DashboardKpis from "../../components/dashboard-kpis";
import VolumeChart from "../../components/volume-chart";
import PendingSummary from "../../components/pending-summary";
import RecentActivity from "../../components/recent-activity";
import { getReceipts, type Receipt } from "../../services/receipts";

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [error, setError] = useState("");

  const loadReceipts = useCallback(async () => {
    setError("");
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch {
      setError("Não foi possível carregar os dados do painel agora.");
    }
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  if (error) {
    return (
      <div className="p-8.5">
        <div className="flex items-center justify-between gap-4 rounded-control border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] text-danger-text">
          {error}
          <button type="button" onClick={loadReceipts} className="font-bold underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!receipts) {
    return (
      <div className="p-8.5">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-card border border-line bg-paper-raised shadow-card" />
          ))}
        </section>
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="h-72 animate-pulse rounded-card border border-line bg-paper-raised shadow-card xl:col-span-2" />
          <div className="h-72 animate-pulse rounded-card border border-line bg-paper-raised shadow-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-8.5">
      <DashboardKpis receipts={receipts} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <VolumeChart receipts={receipts} />
        </div>
        <PendingSummary receipts={receipts} />
      </div>

      <RecentActivity receipts={receipts} />
    </div>
  );
}
