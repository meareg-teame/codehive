import type { Language } from "@/lib/languages";

export type ProjectFile = {
  name: string;
  content: string;
};

export type ProjectSummary = {
  _id: string;
  name: string;
  language: Language;
  visibility?: string;
  owner?: string;
  collaborators?: string[];
  files?: ProjectFile[];
  accessRequests?: string[];
  creationTime?: number;
  editedTime?: number;
};

export type ProjectDetails = ProjectSummary & {
  files: ProjectFile[];
};

export type SharedProject = {
  _id: string;
  name: string;
  owner: string;
};

export type AccessRequestProject = {
  projectId: string;
  projectName?: string;
  requestedBy: string;
  status: "pending" | "granted";
};

export type TeamMember = {
  email: string;
  name: string;
  photoUrl?: string;
  role: "owner" | "admin" | "member" | "guest";
};
