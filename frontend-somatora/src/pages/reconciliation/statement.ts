import type { DiameterClass, Receipt, WoodClass } from "../../services/receipts";

export interface StatementFilters {
  supplier: string;
  startDate: string;
  endDate: string;
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

function isWithinRange(createdAt: string, startDate: string, endDate: string): boolean {
  const created = new Date(createdAt).getTime();
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T23:59:59.999`).getTime();
  return created >= start && created <= end;
}

/** Pesagens do fornecedor no período, antes dos filtros de motorista/classe/diâmetro — usado para popular as opções desses filtros. */
export function receiptsForSupplierRange(
  receipts: Receipt[],
  supplier: string,
  startDate: string,
  endDate: string,
): Receipt[] {
  return receipts.filter((r) => r.supplier === supplier && isWithinRange(r.createdAt, startDate, endDate));
}

export function buildStatement(receipts: Receipt[], filters: StatementFilters): Statement {
  const scoped = receiptsForSupplierRange(receipts, filters.supplier, filters.startDate, filters.endDate).filter(
    (r) => {
      if (filters.driver && r.driver !== filters.driver) return false;
      if (filters.type && r.type !== filters.type) return false;
      if (filters.diameterClass && r.diameterClass !== filters.diameterClass) return false;
      return true;
    },
  );

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
