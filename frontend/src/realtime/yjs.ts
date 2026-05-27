import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const YWS_URL = import.meta.env.VITE_YWS_URL || "ws://localhost:10000";

export function createYjsProvider(roomName: string) {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(YWS_URL, roomName, ydoc);
  const type = ydoc.getText("monaco");
  return { ydoc, provider, type };
}

export { YWS_URL };
