import { api } from "./api";
import type { Role } from "../contexts/authContext";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
}

export interface UserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
}

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  USER: "Usuário",
};

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/user");
  return data;
}

export async function createUser(input: UserInput): Promise<User> {
  const { data } = await api.post<User>("/user", input);
  return data;
}
