export type InviteTokenPayload = {
  projectId: string;
  invitedBy?: string;
  exp?: number;
  iat?: number;
};

export function decodeInviteToken(token: string): InviteTokenPayload | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const payload = JSON.parse(json) as InviteTokenPayload;
    if (!payload.projectId) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
