import { io, type Socket } from "socket.io-client";
import { BACKEND_URL } from "@/api/client";

export type SocketOptions = {
  reconnection?: boolean;
  timeout?: number;
};

export function createAppSocket(options: SocketOptions = {}): Socket {
  return io(BACKEND_URL, {
    transports: ["websocket", "polling"],  // websocket-first — Railway supports native WS
    withCredentials: true,
    reconnection: options.reconnection ?? true,
    timeout: options.timeout ?? 10000,
  });
}
