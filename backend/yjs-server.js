import { WebSocketServer } from "ws";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import * as syncProtocol from "y-protocols/sync.js";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { URL } from "url";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const MESSAGE_QUERY_AWARENESS = 3;

const rooms = new Map();

function getRoomName(request) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  return url.pathname.slice(1);
}

function readAwarenessClientIds(update) {
  const decoder = decoding.createDecoder(update);
  const count = decoding.readVarUint(decoder);
  const clientIds = [];

  for (let i = 0; i < count; i += 1) {
    clientIds.push(decoding.readVarUint(decoder));
    decoding.readVarUint(decoder);
    decoding.readVarString(decoder);
  }

  return clientIds;
}

function sendMessage(conn, message) {
  if (conn.readyState === 1) {
    conn.send(message);
  }
}

function broadcast(room, message, origin = null) {
  room.connections.forEach((conn) => {
    if (conn !== origin) {
      sendMessage(conn, message);
    }
  });
}

function getRoom(roomName) {
  if (!rooms.has(roomName)) {
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);
    const connections = new Set();

    const room = { doc, awareness, connections };

    doc.on("update", (update, origin) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      broadcast(room, encoding.toUint8Array(encoder), origin);
    });

    awareness.on("update", ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated, removed);
      if (changedClients.length === 0) return;

      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      broadcast(room, encoding.toUint8Array(encoder), origin);
    });

    rooms.set(roomName, room);
  }

  return rooms.get(roomName);
}

function setupWSConnection(conn, req) {
  const roomName = getRoomName(req);
  const room = getRoom(roomName);
  const { doc, awareness, connections } = room;
  const connectionClientIds = new Set();

  connections.add(conn);
  conn.binaryType = "arraybuffer";

  conn.on("message", (message) => {
    try {
      const decoder = decoding.createDecoder(new Uint8Array(message));
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case MESSAGE_SYNC: {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MESSAGE_SYNC);
          syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
          if (encoding.length(encoder) > 1) {
            sendMessage(conn, encoding.toUint8Array(encoder));
          }
          break;
        }
        case MESSAGE_AWARENESS: {
          const update = decoding.readVarUint8Array(decoder);
          readAwarenessClientIds(update).forEach((clientId) => {
            connectionClientIds.add(clientId);
          });
          awarenessProtocol.applyAwarenessUpdate(awareness, update, conn);
          break;
        }
        case MESSAGE_QUERY_AWARENESS: {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
          encoding.writeVarUint8Array(
            encoder,
            awarenessProtocol.encodeAwarenessUpdate(
              awareness,
              Array.from(awareness.getStates().keys())
            )
          );
          sendMessage(conn, encoding.toUint8Array(encoder));
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error("Yjs message handling error:", error);
    }
  });

  conn.on("close", () => {
    connections.delete(conn);
    awarenessProtocol.removeAwarenessStates(
      awareness,
      Array.from(connectionClientIds),
      conn
    );
  });

  const syncEncoder = encoding.createEncoder();
  encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(syncEncoder, doc);
  sendMessage(conn, encoding.toUint8Array(syncEncoder));

  const awarenessEncoder = encoding.createEncoder();
  encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
  encoding.writeVarUint8Array(
    awarenessEncoder,
    awarenessProtocol.encodeAwarenessUpdate(
      awareness,
      Array.from(awareness.getStates().keys())
    )
  );
  sendMessage(conn, encoding.toUint8Array(awarenessEncoder));
}

export function createYjsServer(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", setupWSConnection);

  httpServer.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      if (url.pathname.startsWith("/socket.io")) {
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } catch (error) {
      console.error("Yjs server upgrade handling error:", error);
      socket.destroy();
    }
  });

  return wss;
}
