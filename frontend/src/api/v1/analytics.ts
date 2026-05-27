import { apiClient } from "../client";

export type PersonalAnalytics = {
  totalSessions: number;
  totalTimeInSessions: number;
  mostUsedLanguage: string;
  totalExecutions: number;
  projectCount: number;
};

export type ProjectAnalytics = {
  totalSessions: number;
  avgSessionDuration: number;
  languageDistribution: Record<string, number>;
  memberContributions: Array<{ userName: string; linesContributed: number }>;
  sessionsOverTime: Array<{ date: string; count: number }>;
};

export async function getOverview() {
  const { data } = await apiClient.get<{
    success: boolean;
    data: PersonalAnalytics;
  }>("/api/v1/analytics/overview");
  return data.data;
}

export async function getProjectAnalytics(projectId: string) {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ProjectAnalytics;
  }>(`/api/v1/analytics/projects/${projectId}`);
  return data.data;
}
