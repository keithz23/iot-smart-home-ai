import { api } from "@/lib/axios";

export interface AuthUser {
  id: number;
  username: string;
  created_at: string;
}

export async function login(username: string, password: string) {
  const { data } = await api.post<AuthUser>("/auth/login", {
    username,
    password,
  });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}
