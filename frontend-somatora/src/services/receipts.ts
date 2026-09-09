import { api } from "./api";

export const WoodClass = {
  PE: "PE",
  BICA: "BICA",
} as const;
export type WoodClass = (typeof WoodClass)[keyof typeof WoodClass];

export const woodClassLabels: Record<WoodClass, string> = {
  PE: "Pé",
  BICA: "Bica",
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

export interface Receipt {
  id: string;
  type: WoodClass;
  diameterClass: DiameterClass;
  createdAt: string;
}

export interface CreateReceiptPayload {
  type: WoodClass;
  diameterClass: DiameterClass;
}

export async function getReceipts(): Promise<Receipt[]> {
  const { data } = await api.get<Receipt[]>("/receipt");
  return data;
}

export async function createReceipt(payload: CreateReceiptPayload): Promise<Receipt> {
  const { data } = await api.post<Receipt>("/receipt", payload);
  return data;
}
