import type { Receipt } from "../../services/receipts";

export interface SupplierReconciliation {
  supplier: string;
  receivedKg: number;
  invoicedKg: number;
  reconciledDiffKg: number;
  pendingDiffKg: number;
  pendingValue: number;
  pendingReceiptIds: string[];
}

export function computeReconciliation(receipts: Receipt[]): SupplierReconciliation[] {
  const bySupplier = new Map<string, SupplierReconciliation>();

  for (const receipt of receipts) {
    if (receipt.invoiceWeight === null) continue;

    let entry = bySupplier.get(receipt.supplier);
    if (!entry) {
      entry = {
        supplier: receipt.supplier,
        receivedKg: 0,
        invoicedKg: 0,
        reconciledDiffKg: 0,
        pendingDiffKg: 0,
        pendingValue: 0,
        pendingReceiptIds: [],
      };
      bySupplier.set(receipt.supplier, entry);
    }

    const diff = receipt.netWeight - receipt.invoiceWeight;
    entry.receivedKg += receipt.netWeight;
    entry.invoicedKg += receipt.invoiceWeight;

    if (receipt.complementaryInvoiceId) {
      entry.reconciledDiffKg += diff;
    } else if (diff > 0) {
      entry.pendingDiffKg += diff;
      entry.pendingValue += (diff / 1000) * (receipt.pricePerTon ?? 0);
      entry.pendingReceiptIds.push(receipt.id);
    }
  }

  return Array.from(bySupplier.values()).sort((a, b) => b.pendingDiffKg - a.pendingDiffKg);
}
