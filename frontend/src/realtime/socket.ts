import { io, type Socket } from "socket.io-client";
import { BACKEND_URL } from "@/api/client";

export type SocketOptions = {
  reconnection?: boolean;
  timeout?: number;
};

export function createAppSocket(options: SocketOptions = {}): Socket {
  return io(BACKEND_URL, {
    // Polling-first is more reliable across Firefox, proxies, and hosted WS upgrades.
    transports: ["polling", "websocket"],
    reconnection: options.reconnection ?? true,
    timeout: options.timeout ?? 10000,
  });
}
