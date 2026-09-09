import { api } from "./api";

export const WoodClass = {
  PE: "PE",
  BICA: "BICA",
  SEGUNDA_TORA: "SEGUNDA_TORA",
} as const;
export type WoodClass = (typeof WoodClass)[keyof typeof WoodClass];

export const woodClassLabels: Record<WoodClass, string> = {
  PE: "Pé",
  BICA: "Bica",
  SEGUNDA_TORA: "Segunda Tora",
};

export const DiameterClass = {
  FROM_18_TO_24: "FROM_18_TO_24",
  FROM_24_TO_33: "FROM_24_TO_33",
  ABOVE_33: "ABOVE_33",
} as const;
export type DiameterClass = (typeof DiameterClass)[keyof typeof DiameterClass];

export const diameterClassLabels: Record<DiameterClass, string> = {
  FROM_18_TO_24: "18 a 24",
  FROM_24_TO_33: "24 a 33",
  ABOVE_33: "Acima de 33",
};

export interface ComplementaryInvoiceSummary {
  id: string;
  number: string;
  supplier: string;
  totalWeight: number;
  issueDate: string;
}

export interface Receipt {
  id: string;
  invoiceNumber: string;
  supplier: string;
  farm: string;
  length: number;
  type: WoodClass;
  diameterClass: DiameterClass;
  truckPlate: string;
  trailerPlate: string | null;
  driver: string;
  notes: string | null;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  invoiceWeight: number | null;
  pricePerTon: number | null;
  complementaryInvoiceId: string | null;
  complementaryInvoice: ComplementaryInvoiceSummary | null;
  createdAt: string;
}

export interface CreateReceiptPayload {
  invoiceNumber: string;
  supplier: string;
  farm: string;
  length: number;
  type: WoodClass;
  diameterClass: DiameterClass;
  truckPlate: string;
  trailerPlate?: string;
  driver: string;
  notes?: string;
  grossWeight: number;
  tareWeight: number;
  invoiceWeight: number;
  pricePerTon: number;
}

export async function getReceipts(): Promise<Receipt[]> {
  const { data } = await api.get<Receipt[]>("/receipt");
  return data;
}

export async function createReceipt(payload: CreateReceiptPayload): Promise<Receipt> {
  const { data } = await api.post<Receipt>("/receipt", payload);
  return data;
}
