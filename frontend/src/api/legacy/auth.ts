import { apiClient } from "../client";
import type { AuthUser } from "@/types";

export async function checkSession() {
  const { data } = await apiClient.post("/auth/user", {});
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<{ msg: string }>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function signup(name: string, email: string, password: string) {
  const { data } = await apiClient.post<{ msg: string; timeLeft?: number }>(
    "/auth/signup",
    { name, email, password }
  );
  return data;
}

export async function guestLogin() {
  const { data } = await apiClient.post<{ msg: string; email?: string }>(
    "/auth/guest-login",
    {}
  );
  return data;
}

export async function logout() {
  const { data } = await apiClient.post("/auth/logout", {});
  return data;
}

export async function getUserInfo() {
  const { data } = await apiClient.post<{ userData: AuthUser }>(
    "/auth/user-info",
    {}
  );
  return data.userData;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const { data } = await apiClient.post<{ msg: string }>("/auth/change-password", {
    oldPassword,
    newPassword,
  });
  return data;
}

export async function googleOauth(payload: {
  email: string;
  name: string;
  photoUrl: string;
}) {
  const { data } = await apiClient.post("/auth/google-oauth", payload);
  return data;
}

export async function firebaseSignin(idToken: string) {
  const { data } = await apiClient.post<{
    success: boolean;
    token?: string;
    user?: { id: string; email: string; displayName: string; role: string };
  }>("/auth/firebase-signin", { idToken });
  return data;
}

export async function updateProfile(payload: { name: string; photoUrl?: string }) {
  const { data } = await apiClient.post<{ msg: string }>("/auth/update-profile", payload);
  return data;
}
