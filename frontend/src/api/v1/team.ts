import { apiClient } from "../client";
import type { TeamMember } from "@/types";

export async function getTeam(projectId: string) {
  const { data } = await apiClient.get<{
    success: boolean;
    data: TeamMember[];
  }>(`/api/v1/projects/${projectId}/team`);
  return data.data;
}

export async function generateLegacyInvite(projectId: string) {
  const { data } = await apiClient.post<{
    success: boolean;
    inviteLink: string;
    token: string;
  }>(`/v1/projects/${projectId}/team/generate-invite`, {});
  return data;
}

export type JoinInfo = {
  projectId: string;
  projectName: string;
  language: string;
  visibility: string;
  inviterName: string | null;
};

export async function getJoinInfo(token: string): Promise<JoinInfo> {
  const { data } = await apiClient.get<{ success: boolean; data: JoinInfo }>(
    `/api/join-info/${token}`
  );
  return data.data;
}
