// backend/yjs-server.js
import { WebSocketServer } from "ws";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import * as syncProtocol from "y-protocols/sync.js";
import { URL } from "url";

// Map from room name to a Y.Doc
const docs = new Map();

function getRoomName(request) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  return url.pathname.slice(1); // remove leading '/'
}

function getDoc(roomName) {
  if (!docs.has(roomName)) {
    const doc = new Y.Doc();
    docs.set(roomName, doc);
  }
  return docs.get(roomName);
}

function setupWSConnection(conn, req) {
  const roomName = getRoomName(req);
  const doc = getDoc(roomName);
  
  conn.binaryType = "arraybuffer";

  // Create a new awareness instance for each connection
  const awareness = new awarenessProtocol.Awareness(doc);
  
  const onSyncMessage = (message) => {
    syncProtocol.readSyncMessage(message, conn, doc);
  };

  const onAwarenessMessage = (message) => {
    awarenessProtocol.applyAwarenessUpdate(awareness, message, conn);
  };

  const onDocUpdate = (update, origin) => {
    if (origin !== conn) {
      const message = syncProtocol.createSyncMessage(doc, update);
      conn.send(message);
    }
  };

  const onAwarenessUpdate = (update, origin) => {
    if (origin !== conn) {
      const message = awarenessProtocol.createAwarenessUpdate(awareness, update);
      conn.send(message);
    }
  };

  conn.on("message", (message) => {
    try {
      const buffer = new Uint8Array(message);
      const type = syncProtocol.readMessageType(buffer);
      switch (type) {
        case syncProtocol.messageType.sync:
          onSyncMessage(buffer);
          break;
        case syncProtocol.messageType.awareness:
          onAwarenessMessage(buffer);
          break;
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  conn.on("close", () => {
    awareness.removeStates([conn.id], conn);
    doc.off("update", onDocUpdate);
    awareness.off("update", onAwarenessUpdate);
  });

  // Subscribe to events
  doc.on("update", onDocUpdate);
  awareness.on("update", onAwarenessUpdate);

  // Immediately send sync step 1 and awareness state
  const syncStep1 = syncProtocol.createSyncStep1(doc);
  conn.send(syncStep1);
  
  const awarenessState = awarenessProtocol.createAwarenessUpdate(awareness, awareness.getStates());
  conn.send(awarenessState);
}

export function createYjsServer(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", setupWSConnection);

  httpServer.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      if (url.pathname.startsWith("/socket.io")) {
        return; // Allow Socket.io to handle its own upgrades
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } catch (err) {
      console.error("Yjs server upgrade handling error:", err);
      socket.destroy();
    }
  });

  return wss;
}