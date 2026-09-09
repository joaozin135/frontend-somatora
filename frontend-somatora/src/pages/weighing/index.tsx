import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import Modal from "../../components/modal";
import WeighingForm from "./weighing-form";
import WeighingTable from "./weighing-table";
import { getReceipts, type Receipt } from "../../services/receipts";

export default function WeighingPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReceipts();
      setReceipts([...data].reverse());
    } catch {
      setError("Não foi possível carregar as pesagens agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  function handleCreated(receipt: Receipt) {
    setReceipts((prev) => [receipt, ...prev]);
    setFormOpen(false);
  }

  return (
    <div className="p-8.5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-navy">Últimas pesagens</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">Recebimentos registrados na portaria</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-control bg-canopy px-4 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Nova pesagem
        </button>
      </div>

      {loading && <p className="text-[13px] text-ink-soft">Carregando pesagens…</p>}

      {!loading && error && (
        <div className="flex items-center justify-between gap-4 rounded-control border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] text-danger-text">
          {error}
          <button type="button" onClick={loadReceipts} className="font-bold underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && <WeighingTable receipts={receipts} />}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Nova pesagem">
        <WeighingForm onCancel={() => setFormOpen(false)} onCreated={handleCreated} />
      </Modal>
    </div>
  );
}
