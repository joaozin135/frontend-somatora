import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../../components/modal";
import SupplierForm from "./supplier-form";
import { getSuppliers, updateSupplier, type Supplier } from "../../services/suppliers";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch {
      setError("Não foi possível carregar os fornecedores agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  function openCreate() {
    setEditingSupplier(null);
    setFormOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditingSupplier(supplier);
    setFormOpen(true);
  }

  function handleSaved(supplier: Supplier) {
    setSuppliers((prev) => {
      const exists = prev.some((s) => s.id === supplier.id);
      return exists ? prev.map((s) => (s.id === supplier.id ? supplier : s)) : [...prev, supplier];
    });
    setFormOpen(false);
  }

  function closeForm() {
    setFormOpen(false);
    // Fazendas podem ter sido adicionadas/removidas direto pela API enquanto
    // o modal estava aberto, mesmo sem clicar em "Salvar" — recarrega pra refletir.
    loadSuppliers();
  }

  async function toggleActive(supplier: Supplier) {
    setTogglingId(supplier.id);
    try {
      const updated = await updateSupplier(supplier.id, { active: !supplier.active });
      setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch {
      setError("Não foi possível atualizar o fornecedor agora.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="p-8.5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-navy">Fornecedores</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">Cadastro usado na seleção de novas pesagens</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex shrink-0 items-center gap-2 rounded-control bg-canopy px-4 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Novo fornecedor
        </button>
      </div>

      {loading && <p className="text-[13px] text-ink-soft">Carregando fornecedores…</p>}

      {!loading && error && (
        <div className="flex items-center justify-between gap-4 rounded-control border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] text-danger-text">
          {error}
          <button type="button" onClick={loadSuppliers} className="font-bold underline underline-offset-2">
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && suppliers.length === 0 && (
        <div className="rounded-card border border-line bg-paper-raised px-6 py-12 text-center text-[13px] text-ink-soft shadow-card">
          Nenhum fornecedor cadastrado ainda.
        </div>
      )}

      {!loading && !error && suppliers.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line bg-paper-raised shadow-card">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">Nome</th>
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">CNPJ / CPF</th>
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">Contato</th>
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">Status</th>
                <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft"></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3 font-semibold text-ink">{supplier.name}</td>
                  <td className="px-4 py-3 text-ink">
                    {supplier.cnpj ?? <span className="text-ink-placeholder">—</span>}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {supplier.phone || supplier.email ? (
                      <div className="leading-tight">
                        {supplier.phone && <div>{supplier.phone}</div>}
                        {supplier.email && <div className="text-ink-soft">{supplier.email}</div>}
                      </div>
                    ) : (
                      <span className="text-ink-placeholder">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        supplier.active ? "bg-canopy/14 text-forest-deep" : "bg-line text-ink-soft"
                      }`}
                    >
                      {supplier.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(supplier)}
                        className="rounded-control border border-line px-3 py-1.5 text-[12px] font-bold text-ink transition hover:bg-paper"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={togglingId === supplier.id}
                        onClick={() => toggleActive(supplier)}
                        className="rounded-control border border-line px-3 py-1.5 text-[12px] font-bold text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {supplier.active ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={closeForm} title={editingSupplier ? "Editar fornecedor" : "Novo fornecedor"}>
        <SupplierForm supplier={editingSupplier} onCancel={closeForm} onSaved={handleSaved} />
      </Modal>
    </div>
  );
}
