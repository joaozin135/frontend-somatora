import type { DiameterClass, Receipt, WoodClass } from "../../services/receipts";

export interface StatementFilters {
  supplier: string;
  month: string;
  driver?: string;
  type?: WoodClass;
  diameterClass?: DiameterClass;
}

export interface StatementTotals {
  receivedKg: number;
  invoicedKg: number;
  reconciledDiffKg: number;
  pendingDiffKg: number;
  pendingValue: number;
}

export interface Statement {
  rows: Receipt[];
  totals: StatementTotals;
}

/** Pesagens do fornecedor+mês, antes dos filtros de motorista/classe/diâmetro — usado para popular as opções desses filtros. */
export function receiptsForSupplierMonth(receipts: Receipt[], supplier: string, month: string): Receipt[] {
  const [year, monthIndex] = month.split("-").map(Number);
  return receipts.filter((r) => {
    if (r.supplier !== supplier) return false;
    const created = new Date(r.createdAt);
    return created.getFullYear() === year && created.getMonth() + 1 === monthIndex;
  });
}

export function buildStatement(receipts: Receipt[], filters: StatementFilters): Statement {
  const scoped = receiptsForSupplierMonth(receipts, filters.supplier, filters.month).filter((r) => {
    if (filters.driver && r.driver !== filters.driver) return false;
    if (filters.type && r.type !== filters.type) return false;
    if (filters.diameterClass && r.diameterClass !== filters.diameterClass) return false;
    return true;
  });

  const rows = [...scoped].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const totals: StatementTotals = {
    receivedKg: 0,
    invoicedKg: 0,
    reconciledDiffKg: 0,
    pendingDiffKg: 0,
    pendingValue: 0,
  };

  for (const receipt of rows) {
    totals.receivedKg += receipt.netWeight;
    if (receipt.invoiceWeight === null) continue;

    totals.invoicedKg += receipt.invoiceWeight;
    const diff = receipt.netWeight - receipt.invoiceWeight;
    if (receipt.complementaryInvoiceId) {
      totals.reconciledDiffKg += diff;
    } else if (diff > 0) {
      totals.pendingDiffKg += diff;
      totals.pendingValue += (diff / 1000) * (receipt.pricePerTon ?? 0);
    }
  }

  return { rows, totals };
}
