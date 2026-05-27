import { apiClient, setStoredAccessToken } from "../client";
import type { V1User } from "@/types";

export async function firebaseSignin(payload: {
  firebaseToken: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  firebaseUID: string;
}) {
  const { data } = await apiClient.post<{
    success: boolean;
    data: { token: string; user: V1User };
  }>("/api/v1/auth/firebase-signin", payload);

  if (data.data?.token) {
    setStoredAccessToken(data.data.token);
  }
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get<{
    success: boolean;
    data: V1User;
  }>("/api/v1/auth/me");
  return data.data;
}
