import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { BACKEND_URL } from "../api/client";

function getWebSocketUrl() {
  if (import.meta.env.VITE_YWS_URL) {
    return import.meta.env.VITE_YWS_URL;
  }
  // Derive from backend URL
  const url = new URL(BACKEND_URL);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}`;
}

const YWS_URL = getWebSocketUrl();

export function createYjsProvider(roomName: string) {
  const ydoc = new Y.Doc();
  // The path is now handled by the server upgrade mechanism, so we don't need to specify /yjs here.
  // The WebsocketProvider will connect to the root and the server will handle the upgrade.
  const provider = new WebsocketProvider(YWS_URL, roomName, ydoc);
  const type = ydoc.getText("monaco");
  return { ydoc, provider, type };
}

export { YWS_URL };
