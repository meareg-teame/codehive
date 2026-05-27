import { apiClient } from "../client";

export type CollaborationSession = {
  _id: string;
  projectId: string;
  roomCode: string;
  state: string;
  startedAt?: string;
  endedAt?: string;
};

export async function createSession(projectId: string) {
  const { data } = await apiClient.post<{
    success: boolean;
    data: CollaborationSession;
  }>(`/api/v1/projects/${projectId}/sessions`, {});
  return data.data;
}

export async function listSessions(projectId: string) {
  const { data } = await apiClient.get<{
    success: boolean;
    data: CollaborationSession[];
  }>(`/api/v1/projects/${projectId}/sessions`);
  return data.data;
}
