import { api } from "./api";
import type { ComplementaryInvoiceSummary } from "./receipts";

export interface CreateComplementaryInvoicePayload {
  number: string;
  totalWeight: number;
  receiptIds: string[];
}

export async function getComplementaryInvoices(): Promise<ComplementaryInvoiceSummary[]> {
  const { data } = await api.get<ComplementaryInvoiceSummary[]>("/complementary-invoice");
  return data;
}

export async function createComplementaryInvoice(
  payload: CreateComplementaryInvoicePayload,
): Promise<ComplementaryInvoiceSummary> {
  const { data } = await api.post<ComplementaryInvoiceSummary>("/complementary-invoice", payload);
  return data;
}
