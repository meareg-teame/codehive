import { apiClient } from "../client";
import type { Language } from "@/lib/languages";
import type {
  AccessRequestProject,
  ProjectDetails,
  ProjectSummary,
  RunCodeResult,
  SharedProject,
} from "@/types";

export async function createProject(payload: {
  projectName: string;
  language: Language;
  visibility: string;
}) {
  const { data } = await apiClient.post<{ msg: string; project?: ProjectSummary }>(
    "/project/create-project",
    payload
  );
  return data;
}

export async function getProjects() {
  const { data } = await apiClient.post<{ projects: ProjectSummary[] }>(
    "/project/get-projects",
    {}
  );
  return data.projects;
}

export async function deleteProject(id: string) {
  const { data } = await apiClient.post<{ msg: string }>("/project/delete-project", {
    id,
  });
  return data;
}

export async function getProjectDetails(id: string) {
  const { data } = await apiClient.post<{
    projectDetails: ProjectDetails;
    user: string;
  }>("/project/get-project-details", { id });
  return data;
}

export async function createFile(projectId: string, fileName: string) {
  const { data } = await apiClient.post<{
    msg: string;
    projectDetails: ProjectDetails;
  }>("/project/create-file", { projectId, fileName });
  return data;
}

export async function deleteFile(id: string, fileName: string) {
  const { data } = await apiClient.post<{
    msg: string;
    projectDetails: ProjectDetails;
    deletedFile?: string;
  }>("/project/delete-file", { id, fileName });
  return data;
}

export async function renameFile(
  projectId: string,
  oldFileName: string,
  newFileName: string
) {
  const { data } = await apiClient.post<{
    msg: string;
    projectDetails: ProjectDetails;
  }>("/project/rename-file", { projectId, oldFileName, newFileName });
  return data;
}

export async function saveFile(projectId: string, fileName: string, code: string) {
  const { data } = await apiClient.post<{
    msg: string;
    files: ProjectDetails["files"];
  }>("/project/save-file", { projectId, fileName, code });
  return data;
}

export async function runCode(code: string, language: Language, stdin = "") {
  const { data } = await apiClient.post<{
    result?: RunCodeResult;
    msg?: string;
  }>("/project/run-code", { code, language, stdin });
  return data;
}

export async function aiExplain(code: string, language: Language) {
  const { data } = await apiClient.post<{ msg: string }>("/project/ai-explain", {
    code,
    language,
  });
  return data;
}

export async function getSharedWithMe() {
  const { data } = await apiClient.post<{ sharedProjects: SharedProject[] }>(
    "/project/shared-with-me",
    {}
  );
  return data.sharedProjects;
}

export async function removeAccess(projectId: string) {
  const { data } = await apiClient.post<{
    msg: string;
    sharedProjects: SharedProject[];
  }>("/project/remove-access", { projectId });
  return data;
}

export async function getAccessManagement() {
  const { data } = await apiClient.post<{
    accessManagementProjects: AccessRequestProject[];
  }>("/project/access-management", {});
  return data.accessManagementProjects;
}
