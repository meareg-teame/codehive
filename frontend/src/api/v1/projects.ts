import { apiClient } from "../client";
import type { ProjectSummary } from "@/types";

export async function listProjects() {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ProjectSummary[];
  }>("/api/v1/projects");
  return data.data;
}

export async function getProject(id: string) {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ProjectSummary;
  }>(`/api/v1/projects/${id}`);
  return data.data;
}

export async function createProject(payload: {
  name: string;
  description?: string;
  language?: string;
  visibility?: string;
}) {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ProjectSummary;
  }>("/api/v1/projects", payload);
  return data.data;
}
