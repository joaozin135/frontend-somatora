import { api } from "./api";

export interface Farm {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  active: boolean;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  farms: Farm[];
}

export interface SupplierInput {
  name: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  farmNames?: string[];
}

export async function getSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get<Supplier[]>("/supplier");
  return data;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const { data } = await api.post<Supplier>("/supplier", input);
  return data;
}

export async function updateSupplier(
  id: string,
  input: Partial<SupplierInput> & { active?: boolean },
): Promise<Supplier> {
  const { data } = await api.patch<Supplier>(`/supplier/${id}`, input);
  return data;
}

export async function createFarm(supplierId: string, name: string): Promise<Farm> {
  const { data } = await api.post<Farm>(`/supplier/${supplierId}/farm`, { name });
  return data;
}

export async function deleteFarm(farmId: string): Promise<void> {
  await api.delete(`/farm/${farmId}`);
}
