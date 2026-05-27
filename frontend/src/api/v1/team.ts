import { apiClient } from "../client";
import type { TeamMember } from "@/types";

export async function getTeam(projectId: string) {
  const { data } = await apiClient.get<{
    success: boolean;
    data: TeamMember[];
  }>(`/api/v1/projects/${projectId}/team`);
  return data.data;
}

export async function createInvite(projectId: string) {
  const { data } = await apiClient.post<{
    success: boolean;
    data: { inviteLink: string; token: string };
  }>(`/api/v1/projects/${projectId}/team/invite`, {});
  return data.data;
}
