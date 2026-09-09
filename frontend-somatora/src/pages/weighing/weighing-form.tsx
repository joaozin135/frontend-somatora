import { useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  createReceipt,
  diameterClassLabels,
  WoodClass,
  DiameterClass,
  type Receipt,
} from "../../services/receipts";

export interface WeighingFormProps {
  onCancel: () => void;
  onCreated: (receipt: Receipt) => void;
}

interface FormState {
  invoiceNumber: string;
  supplier: string;
  farm: string;
  length: string;
  woodClass: WoodClass | "SEGUNDA_TORA" | "";
  diameterClass: DiameterClass | "";
  truckPlate: string;
  trailerPlate: string;
  driver: string;
  notes: string;
  grossWeight: string;
  tareWeight: string;
}

const initialState: FormState = {
  invoiceNumber: "",
  supplier: "",
  farm: "",
  length: "",
  woodClass: "",
  diameterClass: "",
  truckPlate: "",
  trailerPlate: "",
  driver: "",
  notes: "",
  grossWeight: "",
  tareWeight: "",
};

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

export default function WeighingForm({ onCancel, onCreated }: WeighingFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const gross = Number(form.grossWeight);
  const tare = Number(form.tareWeight);
  const hasWeights = form.grossWeight !== "" && form.tareWeight !== "" && !Number.isNaN(gross) && !Number.isNaN(tare);
  const netWeight = hasWeights ? gross - tare : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (form.woodClass === "SEGUNDA_TORA") {
      setError('A classe "Segunda Tora" ainda não é aceita pela API — fale com o time antes de usar essa opção.');
      return;
    }

    if (!form.woodClass || !form.diameterClass) {
      setError("Selecione a classe da madeira e o diâmetro.");
      return;
    }

    if (netWeight !== null && netWeight < 0) {
      setError("O peso bruto não pode ser menor que o peso vazio.");
      return;
    }

    setSubmitting(true);
    try {
      const receipt = await createReceipt({
        type: form.woodClass,
        diameterClass: form.diameterClass,
      });
      onCreated(receipt);
    } catch {
      setError("Não foi possível registrar a pesagem. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-start gap-2.5 rounded-control border border-amber/30 bg-amber-soft/60 px-3.5 py-3 text-[12px] leading-relaxed text-amber-text">
        <AlertTriangle className="mt-0.5 h-3.75 w-3.75 shrink-0" strokeWidth={2} />
        <p>
          Por enquanto a API só grava <strong>classe da madeira</strong> e <strong>diâmetro</strong>. Os demais
          campos abaixo já seguem o padrão do romaneio, mas serão persistidos assim que o backend for atualizado.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nº da nota fiscal" htmlFor="invoiceNumber">
          <input
            id="invoiceNumber"
            className={inputClass}
            value={form.invoiceNumber}
            onChange={(e) => update("invoiceNumber", e.target.value)}
            placeholder="Ex: 123456"
          />
        </Field>

        <Field label="Fornecedor" htmlFor="supplier">
          <input
            id="supplier"
            className={inputClass}
            value={form.supplier}
            onChange={(e) => update("supplier", e.target.value)}
            placeholder="Nome do fornecedor"
          />
        </Field>

        <Field label="Fazenda" htmlFor="farm">
          <input
            id="farm"
            className={inputClass}
            value={form.farm}
            onChange={(e) => update("farm", e.target.value)}
            placeholder="Nome da fazenda"
          />
        </Field>

        <Field label="Comprimento (m)" htmlFor="length">
          <input
            id="length"
            className={inputClass}
            value={form.length}
            onChange={(e) => update("length", e.target.value)}
            placeholder="Ex: 2,20"
            inputMode="decimal"
          />
        </Field>

        <Field label="Classe da madeira" htmlFor="woodClass">
          <select
            id="woodClass"
            className={inputClass}
            value={form.woodClass}
            onChange={(e) => update("woodClass", e.target.value as FormState["woodClass"])}
          >
            <option value="" disabled>
              Selecione…
            </option>
            <option value={WoodClass.PE}>Pé</option>
            <option value={WoodClass.BICA}>Bica</option>
            <option value="SEGUNDA_TORA" disabled title="Ainda não suportado pela API">
              Segunda Tora (em breve)
            </option>
          </select>
        </Field>

        <Field label="Diâmetro" htmlFor="diameterClass">
          <select
            id="diameterClass"
            className={inputClass}
            value={form.diameterClass}
            onChange={(e) => update("diameterClass", e.target.value as FormState["diameterClass"])}
          >
            <option value="" disabled>
              Selecione…
            </option>
            {Object.entries(diameterClassLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Placa do cavalo" htmlFor="truckPlate">
          <input
            id="truckPlate"
            className={inputClass}
            value={form.truckPlate}
            onChange={(e) => update("truckPlate", e.target.value.toUpperCase())}
            placeholder="ABC1D23"
            maxLength={8}
          />
        </Field>

        <Field label="Placa da julieta" htmlFor="trailerPlate">
          <input
            id="trailerPlate"
            className={inputClass}
            value={form.trailerPlate}
            onChange={(e) => update("trailerPlate", e.target.value.toUpperCase())}
            placeholder="Se houver bitrem"
            maxLength={8}
          />
        </Field>

        <Field label="Motorista" htmlFor="driver">
          <input
            id="driver"
            className={inputClass}
            value={form.driver}
            onChange={(e) => update("driver", e.target.value)}
            placeholder="Nome do motorista"
          />
        </Field>

        <Field label="Peso bruto (kg)" htmlFor="grossWeight">
          <input
            id="grossWeight"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
            value={form.grossWeight}
            onChange={(e) => update("grossWeight", e.target.value)}
            placeholder="0,00"
          />
        </Field>

        <Field label="Peso vazio (kg)" htmlFor="tareWeight">
          <input
            id="tareWeight"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
            value={form.tareWeight}
            onChange={(e) => update("tareWeight", e.target.value)}
            placeholder="0,00"
          />
        </Field>

        <Field label="Peso líquido (kg)" htmlFor="netWeight">
          <input
            id="netWeight"
            disabled
            className={`${inputClass} cursor-not-allowed bg-line/40 text-ink-soft`}
            value={netWeight !== null ? netWeight.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}
            placeholder="Calculado automaticamente"
          />
        </Field>
      </div>

      <Field label="Observação" htmlFor="notes">
        <textarea
          id="notes"
          className={`${inputClass} min-h-20 resize-y`}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Alguma observação sobre a carga…"
        />
      </Field>

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
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-control bg-canopy px-4.5 py-2.5 text-[13px] font-extrabold text-white shadow-card transition hover:bg-canopy-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Salvando…" : "Registrar pesagem"}
        </button>
      </div>
    </form>
  );
}
