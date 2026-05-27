import { apiClient } from "../client";

export type CodeDocument = {
  projectId: string;
  content: string;
  language: string;
  updatedAt?: string;
};

export async function getDocument(projectId: string) {
  const { data } = await apiClient.get<{
    success: boolean;
    data: CodeDocument | null;
  }>(`/api/v1/projects/${projectId}/document`);
  return data.data;
}

export async function saveDocument(
  projectId: string,
  payload: { content: string; language: string }
) {
  const { data } = await apiClient.post<{
    success: boolean;
    data: CodeDocument;
  }>(`/api/v1/projects/${projectId}/document`, payload);
  return data.data;
}
