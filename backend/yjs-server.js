// backend/yjs-server.js
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

export function createYjsServer(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", setupWSConnection);

  httpServer.on("upgrade", (request, socket, head) => {
    // This will switch the protocol from HTTP to WebSocket and hand over the connection to Yjs
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  return wss;
}
