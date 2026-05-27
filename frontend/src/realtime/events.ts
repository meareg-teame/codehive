import type { ProjectDetails } from "@/types";

export const SOCKET_EVENTS = {
  updatedFiles: "updated files",
  roomStateChange: "room:state-change",
  roomSyncStart: "room:sync-start",
  roomSyncConfirm: "room:sync-confirm",
  roomJoin: "room:join",
  codeChange: "code_change",
  codeExecute: "code_execute",
  requestAccess: "request access",
  grantProjectAccess: "grant project access",
} as const;

export type UpdatedFilesPayload = {
  projectDetails: ProjectDetails;
  newContent?: string;
  deletedFile?: string;
};

export type AccessRequestedPayload = {
  projectId: string;
  requestedBy: string;
  projectName: string;
};

export type GrantAccessPayload = {
  projectId: string;
  requestedBy: string;
};

export function accessRequestedChannel(userEmail: string) {
  return `${userEmail}:access requested`;
}

export function accessGrantedChannel(userEmail: string) {
  return `${userEmail}:access granted`;
}
