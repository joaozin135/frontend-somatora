import { useEffect, useState, useCallback } from "react";
import { isAxiosError } from "axios";
import { Plus } from "lucide-react";
import Modal from "../../components/modal";
import WeighingForm from "./weighing-form";
import WeighingTable from "./weighing-table";
import { deleteReceipt, getReceipts, unlinkComplementaryInvoice, type Receipt } from "../../services/receipts";

function extractDeleteErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return "Não foi possível excluir a pesagem. Tente novamente.";
}

export default function WeighingPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [deletingReceipt, setDeletingReceipt] = useState<Receipt | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  function openCreate() {
    setEditingReceipt(null);
    setFormOpen(true);
  }

  function openEdit(receipt: Receipt) {
    setEditingReceipt(receipt);
    setFormOpen(true);
  }

  function openDelete(receipt: Receipt) {
    setDeleteError("");
    setDeletingReceipt(receipt);
  }

  async function confirmDelete() {
    if (!deletingReceipt) return;
    setDeleting(true);
    setDeleteError("");
    try {
      if (deletingReceipt.complementaryInvoiceId) {
        await unlinkComplementaryInvoice(deletingReceipt.id);
      }
      await deleteReceipt(deletingReceipt.id);
      setReceipts((prev) => prev.filter((r) => r.id !== deletingReceipt.id));
      setDeletingReceipt(null);
    } catch (err) {
      setDeleteError(extractDeleteErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function handleSaved(receipt: Receipt) {
    setReceipts((prev) => {
      const exists = prev.some((r) => r.id === receipt.id);
      return exists ? prev.map((r) => (r.id === receipt.id ? receipt : r)) : [receipt, ...prev];
    });
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
          onClick={openCreate}
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

      {!loading && !error && <WeighingTable receipts={receipts} onEdit={openEdit} onDelete={openDelete} />}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingReceipt ? "Editar pesagem" : "Nova pesagem"}>
        <WeighingForm receipt={editingReceipt} onCancel={() => setFormOpen(false)} onSaved={handleSaved} />
      </Modal>

      <Modal open={deletingReceipt !== null} onClose={() => setDeletingReceipt(null)} title="Excluir pesagem">
        {deletingReceipt && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-ink">
              Tem certeza que deseja excluir a pesagem da NF{" "}
              <strong className="font-semibold">{deletingReceipt.invoiceNumber}</strong> ({deletingReceipt.supplier})?
              Essa ação não pode ser desfeita.
            </p>

            {deletingReceipt.complementaryInvoiceId && (
              <div className="rounded-control border border-amber/25 bg-amber-soft px-4 py-3 text-[13px] text-amber-text">
                Essa pesagem está vinculada à nota complementar{" "}
                <strong>{deletingReceipt.complementaryInvoice?.number}</strong>. Ao confirmar, ela será desvinculada
                automaticamente antes de ser excluída.
              </div>
            )}

            {deleteError && (
              <div className="rounded-control border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] text-danger-text">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingReceipt(null)}
                className="rounded-control border border-line px-4 py-2.5 text-[13px] font-bold text-ink transition hover:bg-paper"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-control bg-danger px-4 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-danger/90 disabled:opacity-60"
              >
                {deleting
                  ? "Excluindo…"
                  : deletingReceipt.complementaryInvoiceId
                    ? "Desvincular e excluir"
                    : "Excluir pesagem"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
