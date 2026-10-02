import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { isAxiosError } from "axios";
import {
  createReceipt,
  updateReceipt,
  diameterClassLabels,
  woodClassLabels,
  weighedUnitLabels,
  WoodClass,
  DiameterClass,
  WeighedUnit,
  type Receipt,
} from "../../services/receipts";
import { getSuppliers, type Farm, type Supplier } from "../../services/suppliers";

export interface WeighingFormProps {
  receipt?: Receipt | null;
  onCancel: () => void;
  onSaved: (receipt: Receipt) => void;
}

interface FormState {
  invoiceNumber: string;
  invoiceWeight: string;
  pricePerTon: string;
  supplierId: string;
  farmId: string;
  newFarmName: string;
  length: string;
  woodClass: WoodClass | "";
  diameterClass: DiameterClass | "";
  weighedUnit: WeighedUnit;
  truckPlate: string;
  trailerPlate: string;
  driver: string;
  notes: string;
  grossWeight: string;
  tareWeight: string;
  trailerGrossWeight: string;
  trailerTareWeight: string;
}

const initialState: FormState = {
  invoiceNumber: "",
  invoiceWeight: "",
  pricePerTon: "",
  supplierId: "",
  farmId: "",
  newFarmName: "",
  length: "",
  woodClass: "",
  diameterClass: "",
  weighedUnit: WeighedUnit.TRUCK_AND_TRAILER,
  truckPlate: "",
  trailerPlate: "",
  driver: "",
  notes: "",
  grossWeight: "",
  tareWeight: "",
  trailerGrossWeight: "",
  trailerTareWeight: "",
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

function receiptToFormState(receipt: Receipt): FormState {
  return {
    invoiceNumber: receipt.invoiceNumber,
    invoiceWeight: receipt.invoiceWeight !== null ? String(receipt.invoiceWeight) : "",
    pricePerTon: receipt.pricePerTon !== null ? String(receipt.pricePerTon) : "",
    supplierId: receipt.supplierId,
    farmId: receipt.farmId,
    newFarmName: "",
    length: String(receipt.length),
    woodClass: receipt.type,
    diameterClass: receipt.diameterClass,
    weighedUnit: receipt.weighedUnit,
    truckPlate: receipt.truckPlate ?? "",
    trailerPlate: receipt.trailerPlate ?? "",
    driver: receipt.driver,
    notes: receipt.notes ?? "",
    grossWeight: String(receipt.grossWeight),
    tareWeight: String(receipt.tareWeight),
    trailerGrossWeight: receipt.trailerGrossWeight !== null ? String(receipt.trailerGrossWeight) : "",
    trailerTareWeight: receipt.trailerTareWeight !== null ? String(receipt.trailerTareWeight) : "",
  };
}

function normalizeFarmName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (match) => match.toUpperCase());
}

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return "Não foi possível registrar a pesagem. Tente novamente.";
}

export default function WeighingForm({ receipt = null, onCancel, onSaved }: WeighingFormProps) {
  const isEditing = receipt !== null;
  const [form, setForm] = useState<FormState>(() => (receipt ? receiptToFormState(receipt) : initialState));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const lockSupplier = isEditing && receipt!.complementaryInvoiceId !== null;

  useEffect(() => {
    getSuppliers()
      .then((data) => setSuppliers(data.filter((s) => s.active)))
      .catch(() => setError("Não foi possível carregar os fornecedores."));
  }, []);

  const supplierOptions = useMemo(() => {
    if (receipt && !suppliers.some((s) => s.id === receipt.supplierId)) {
      return [...suppliers, { id: receipt.supplierId, name: `${receipt.supplier} (inativo)` } as Supplier];
    }
    return suppliers;
  }, [suppliers, receipt]);

  const selectedSupplierFarms = useMemo(() => {
    const supplier = suppliers.find((s) => s.id === form.supplierId);
    let farms = supplier?.farms ?? [];
    if (receipt && receipt.supplierId === form.supplierId && !farms.some((f) => f.id === receipt.farmId)) {
      farms = [...farms, { id: receipt.farmId, name: `${receipt.farm} (removida)` } as Farm];
    }
    return farms;
  }, [suppliers, form.supplierId, receipt]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSupplierChange(supplierId: string) {
    const supplier = suppliers.find((s) => s.id === supplierId);
    const farms = supplier?.farms ?? [];
    setForm((prev) => ({
      ...prev,
      supplierId,
      farmId: farms.length === 1 ? farms[0].id : "",
      newFarmName: "",
    }));
  }

  const isCombined = form.weighedUnit === WeighedUnit.TRUCK_AND_TRAILER;
  const mainPart = form.weighedUnit === WeighedUnit.TRAILER ? "Julieta" : "Cavalo";

  const gross = Number(form.grossWeight);
  const tare = Number(form.tareWeight);
  const hasWeights = form.grossWeight !== "" && form.tareWeight !== "" && !Number.isNaN(gross) && !Number.isNaN(tare);
  const mainNetWeight = hasWeights ? gross - tare : null;

  const trailerGross = Number(form.trailerGrossWeight);
  const trailerTare = Number(form.trailerTareWeight);
  const hasTrailerWeights =
    isCombined &&
    form.trailerGrossWeight !== "" &&
    form.trailerTareWeight !== "" &&
    !Number.isNaN(trailerGross) &&
    !Number.isNaN(trailerTare);
  const trailerNetWeight = hasTrailerWeights ? trailerGross - trailerTare : null;

  const netWeight =
    mainNetWeight !== null ? mainNetWeight + (isCombined ? (trailerNetWeight ?? 0) : 0) : null;

  const invoiceWeight = Number(form.invoiceWeight);
  const hasInvoiceDiff = netWeight !== null && form.invoiceWeight !== "" && !Number.isNaN(invoiceWeight);
  const invoiceDiff = hasInvoiceDiff ? netWeight! - invoiceWeight : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (
      !form.invoiceNumber ||
      !form.invoiceWeight ||
      !form.pricePerTon ||
      !form.supplierId ||
      (!form.farmId && !form.newFarmName.trim()) ||
      !form.length ||
      !form.woodClass ||
      !form.diameterClass ||
      !form.driver ||
      !form.grossWeight ||
      !form.tareWeight
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (form.weighedUnit !== WeighedUnit.TRAILER && !form.truckPlate.trim()) {
      setError("Informe a placa do cavalo.");
      return;
    }

    if (form.weighedUnit !== WeighedUnit.TRUCK && !form.trailerPlate.trim()) {
      setError("Informe a placa da julieta.");
      return;
    }

    if (mainNetWeight !== null && mainNetWeight <= 0) {
      setError(`O peso bruto ${mainPart === "Julieta" ? "da julieta" : "do cavalo"} deve ser maior que o peso vazio.`);
      return;
    }

    if (isCombined && (!form.trailerGrossWeight || !form.trailerTareWeight)) {
      setError("Informe o peso bruto e o peso vazio da julieta.");
      return;
    }

    if (isCombined && trailerNetWeight !== null && trailerNetWeight <= 0) {
      setError("O peso bruto da julieta deve ser maior que o peso vazio da julieta.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        invoiceNumber: form.invoiceNumber,
        invoiceWeight: Number(form.invoiceWeight),
        pricePerTon: Number(form.pricePerTon.replace(",", ".")),
        supplierId: form.supplierId,
        ...(form.farmId
          ? { farmId: form.farmId }
          : { newFarmName: normalizeFarmName(form.newFarmName) }),
        length: Number(form.length.replace(",", ".")),
        type: form.woodClass,
        diameterClass: form.diameterClass,
        weighedUnit: form.weighedUnit,
        truckPlate: form.truckPlate.trim() || null,
        trailerPlate: form.trailerPlate.trim() || null,
        driver: form.driver,
        notes: form.notes || undefined,
        grossWeight: gross,
        tareWeight: tare,
        ...(isCombined && { trailerGrossWeight: trailerGross, trailerTareWeight: trailerTare }),
      };
      const saved = isEditing ? await updateReceipt(receipt!.id, payload) : await createReceipt(payload);
      onSaved(saved);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

        <Field label="Tonelada da NF (kg)" htmlFor="invoiceWeight">
          <input
            id="invoiceWeight"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
            value={form.invoiceWeight}
            onChange={(e) => update("invoiceWeight", e.target.value)}
            placeholder="0,00"
          />
        </Field>

        <Field label="Valor por tonelada (R$)" htmlFor="pricePerTon">
          <input
            id="pricePerTon"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
            value={form.pricePerTon}
            onChange={(e) => update("pricePerTon", e.target.value)}
            placeholder="0,00"
          />
        </Field>

        <Field label="Fornecedor" htmlFor="supplierId">
          <select
            id="supplierId"
            className={inputClass}
            value={form.supplierId}
            disabled={lockSupplier}
            onChange={(e) => handleSupplierChange(e.target.value)}
          >
            <option value="" disabled>
              {supplierOptions.length === 0 ? "Nenhum fornecedor cadastrado" : "Selecione…"}
            </option>
            {supplierOptions.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {lockSupplier && (
            <p className="mt-1.5 text-[11.5px] text-ink-soft">
              Já vinculada a uma nota fiscal complementar — não é possível trocar o fornecedor.
            </p>
          )}
        </Field>

        <Field label="Fazenda" htmlFor="farm">
          {selectedSupplierFarms.length === 0 ? (
            <input
              id="farm"
              className={inputClass}
              value={form.newFarmName}
              onChange={(e) => update("newFarmName", e.target.value)}
              disabled={!form.supplierId}
              placeholder={form.supplierId ? "Nome da fazenda (nova)" : "Selecione um fornecedor primeiro"}
            />
          ) : (
            <select
              id="farm"
              className={inputClass}
              value={form.farmId}
              disabled={selectedSupplierFarms.length === 1}
              onChange={(e) => update("farmId", e.target.value)}
            >
              <option value="" disabled>
                Selecione…
              </option>
              {selectedSupplierFarms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          )}
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
            {Object.entries(woodClassLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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

        <div className="sm:col-span-2">
          <p id="weighedUnit-label" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            O que está sendo pesado?
          </p>
          <div role="radiogroup" aria-labelledby="weighedUnit-label" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {Object.values(WeighedUnit).map((unit) => {
              const selected = form.weighedUnit === unit;
              return (
                <button
                  key={unit}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update("weighedUnit", unit)}
                  className={`rounded-control border px-3 py-2.5 text-left text-[12.5px] transition ${
                    selected
                      ? "border-canopy bg-canopy/10 font-bold text-forest-deep ring-2 ring-canopy/20"
                      : "border-line bg-paper font-semibold text-ink-soft hover:bg-paper-raised hover:text-ink"
                  }`}
                >
                  {weighedUnitLabels[unit]}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11.5px] text-ink-soft">
            {form.weighedUnit === WeighedUnit.TRUCK_AND_TRAILER &&
              "Mesma classe de madeira no cavalo e na julieta: os dois pesos entram nesta pesagem."}
            {form.weighedUnit === WeighedUnit.TRUCK &&
              "Só o peso do cavalo. Se a julieta trouxer outra classe, registre ela em outra pesagem como “Só julieta”."}
            {form.weighedUnit === WeighedUnit.TRAILER &&
              "Só o peso da julieta, sem somar o cavalo de novo. Use quando a julieta trouxer outra classe de madeira."}
          </p>
        </div>

        <Field
          label={form.weighedUnit === WeighedUnit.TRAILER ? "Placa do cavalo (opcional)" : "Placa do cavalo"}
          htmlFor="truckPlate"
        >
          <input
            id="truckPlate"
            className={inputClass}
            value={form.truckPlate}
            onChange={(e) => update("truckPlate", e.target.value.toUpperCase())}
            placeholder={form.weighedUnit === WeighedUnit.TRAILER ? "Cavalo que puxou a julieta" : "ABC1D23"}
            maxLength={8}
          />
        </Field>

        <Field
          label={form.weighedUnit === WeighedUnit.TRUCK ? "Placa da julieta (opcional)" : "Placa da julieta"}
          htmlFor="trailerPlate"
        >
          <input
            id="trailerPlate"
            className={inputClass}
            value={form.trailerPlate}
            onChange={(e) => update("trailerPlate", e.target.value.toUpperCase())}
            placeholder={form.weighedUnit === WeighedUnit.TRUCK ? "Se estiver engatada" : "XYZ9A87"}
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

        <Field label={`Peso bruto — ${mainPart} (kg)`} htmlFor="grossWeight">
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

        <Field label={`Peso vazio — ${mainPart} (kg)`} htmlFor="tareWeight">
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

        {isCombined && (
          <>
            <Field label="Peso bruto — Julieta (kg)" htmlFor="trailerGrossWeight">
              <input
                id="trailerGrossWeight"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className={inputClass}
                value={form.trailerGrossWeight}
                onChange={(e) => update("trailerGrossWeight", e.target.value)}
                placeholder="0,00"
              />
            </Field>

            <Field label="Peso vazio — Julieta (kg)" htmlFor="trailerTareWeight">
              <input
                id="trailerTareWeight"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className={inputClass}
                value={form.trailerTareWeight}
                onChange={(e) => update("trailerTareWeight", e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </>
        )}

        <Field label="Peso líquido (kg)" htmlFor="netWeight">
          <input
            id="netWeight"
            disabled
            className={`${inputClass} cursor-not-allowed bg-line/40 text-ink-soft`}
            value={netWeight !== null ? netWeight.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}
            placeholder="Calculado automaticamente"
          />
          {isCombined && mainNetWeight !== null && (
            <p className="mt-1.5 text-[11.5px] text-ink-soft">
              Cavalo: {mainNetWeight.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg
              {trailerNetWeight !== null &&
                ` + Julieta: ${trailerNetWeight.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg`}
            </p>
          )}
          {invoiceDiff !== null && (
            <p className="mt-1.5 text-[11.5px] text-ink-soft">
              {invoiceDiff > 0
                ? `${invoiceDiff.toLocaleString("pt-BR")} kg acima da NF — vai precisar de complementar.`
                : invoiceDiff < 0
                  ? `${Math.abs(invoiceDiff).toLocaleString("pt-BR")} kg abaixo da NF.`
                  : "Bate exatamente com a NF."}
            </p>
          )}
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
          {submitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Registrar pesagem"}
        </button>
      </div>
    </form>
  );
}
