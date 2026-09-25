import { useState, type FormEvent, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { X } from "lucide-react";
import {
  createFarm,
  createSupplier,
  deleteFarm,
  updateSupplier,
  type Farm,
  type Supplier,
} from "../../services/suppliers";

export interface SupplierFormProps {
  supplier: Supplier | null;
  onCancel: () => void;
  onSaved: (supplier: Supplier) => void;
}

interface FormState {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
}

const inputClass =
  "w-full rounded-control border border-line bg-paper px-3.5 py-2.75 text-[13px] text-ink placeholder:text-ink-placeholder focus:outline-none focus:border-canopy focus:ring-2 focus:ring-canopy/20";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </label>
      {children}
    </div>
  );
}

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return "Não foi possível salvar. Tente novamente.";
}

function NewFarmsSection({ names, onChange }: { names: string[]; onChange: (names: string[]) => void }) {
  function updateAt(index: number, value: string) {
    const next = [...names];
    next[index] = value;
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(names.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">Fazendas</label>
      <div className="space-y-2">
        {names.map((name, index) => (
          <div key={index} className="flex gap-2">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => updateAt(index, e.target.value)}
              placeholder="Ex: Fazenda Santa Rita"
            />
            {names.length > 1 && (
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Remover fazenda"
                className="flex shrink-0 items-center justify-center rounded-control border border-line px-3 text-ink-soft transition hover:bg-paper"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...names, ""])}
        className="mt-2 text-[12px] font-bold text-canopy-dark hover:underline"
      >
        + Adicionar fazenda
      </button>
    </div>
  );
}

function ExistingFarmsSection({ supplierId, initialFarms }: { supplierId: string; initialFarms: Farm[] }) {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;

    setBusy(true);
    setLocalError("");
    try {
      const farm = await createFarm(supplierId, name);
      setFarms((prev) => [...prev, farm]);
      setNewName("");
    } catch (err) {
      setLocalError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(farmId: string) {
    setBusy(true);
    setLocalError("");
    try {
      await deleteFarm(farmId);
      setFarms((prev) => prev.filter((f) => f.id !== farmId));
    } catch (err) {
      setLocalError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">Fazendas</label>
      <div className="space-y-2">
        {farms.map((farm) => (
          <div
            key={farm.id}
            className="flex items-center justify-between rounded-control border border-line bg-paper px-3.5 py-2.5 text-[13px] text-ink"
          >
            {farm.name}
            <button
              type="button"
              disabled={busy}
              onClick={() => handleRemove(farm.id)}
              aria-label="Remover fazenda"
              className="text-ink-soft transition hover:text-danger-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        ))}
        {farms.length === 0 && <p className="text-[12.5px] text-ink-soft">Nenhuma fazenda cadastrada ainda.</p>}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          className={inputClass}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nova fazenda"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          type="button"
          disabled={busy || !newName.trim()}
          onClick={handleAdd}
          className="shrink-0 rounded-control border border-line px-3.5 text-[12px] font-bold text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-ink-soft">Fazendas são salvas na hora, mesmo sem clicar em "Salvar".</p>
      {localError && <p className="mt-1.5 text-[12px] font-semibold text-danger-text">{localError}</p>}
    </div>
  );
}

export default function SupplierForm({ supplier, onCancel, onSaved }: SupplierFormProps) {
  const [form, setForm] = useState<FormState>({
    name: supplier?.name ?? "",
    cnpj: supplier?.cnpj ?? "",
    address: supplier?.address ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
  });
  const [newFarmNames, setNewFarmNames] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Informe o nome do fornecedor.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      cnpj: form.cnpj.trim() || undefined,
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      ...(!supplier && {
        farmNames: Array.from(new Set(newFarmNames.map((n) => n.trim()).filter(Boolean))),
      }),
    };

    setSubmitting(true);
    try {
      const saved = supplier ? await updateSupplier(supplier.id, payload) : await createSupplier(payload);
      onSaved(saved);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Nome do fornecedor" htmlFor="supplier-name">
        <input
          id="supplier-name"
          autoFocus
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Ex: Fazenda Santa Rita"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="CNPJ" htmlFor="supplier-cnpj">
          <input
            id="supplier-cnpj"
            className={inputClass}
            value={form.cnpj}
            onChange={(e) => update("cnpj", e.target.value)}
            placeholder="12.345.678/0001-90"
          />
        </Field>

        <Field label="Telefone" htmlFor="supplier-phone">
          <input
            id="supplier-phone"
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(11) 91234-5678"
          />
        </Field>

        <Field label="E-mail" htmlFor="supplier-email">
          <input
            id="supplier-email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="contato@fornecedor.com.br"
          />
        </Field>

        <Field label="Endereço" htmlFor="supplier-address">
          <input
            id="supplier-address"
            className={inputClass}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Rua, número, cidade"
          />
        </Field>
      </div>

      {supplier ? (
        <ExistingFarmsSection supplierId={supplier.id} initialFarms={supplier.farms} />
      ) : (
        <NewFarmsSection names={newFarmNames} onChange={setNewFarmNames} />
      )}

      {error && (
        <p className="rounded-control bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-danger-text">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-line pt-4.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-control border border-line px-4.5 py-2.5 text-[13px] font-semibold text-ink-soft transition hover:bg-paper"
        >
          {supplier ? "Fechar" : "Cancelar"}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-control bg-canopy px-4.5 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
