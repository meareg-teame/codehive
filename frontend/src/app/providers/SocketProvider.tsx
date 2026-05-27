import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { createAppSocket } from "@/realtime/socket";
import { useAuthOptional } from "./AuthProvider";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const auth = useAuthOptional();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (auth?.loading) return;

    const instance = createAppSocket({ reconnection: true });
    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [auth?.loading, auth?.user?.email]);

  const value = useMemo(() => socket, [socket]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within SocketProvider when socket is ready");
  }
  return socket;
}

export function useSocketOptional() {
  return useContext(SocketContext);
}
