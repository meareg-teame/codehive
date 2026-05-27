import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS, type UpdatedFilesPayload } from "./events";
import type { ProjectDetails, RoomStateChangeEvent } from "@/types";

type UseEditorSocketOptions = {
  socket: Socket | null;
  projectId: string;
  userId: string;
  onFilesUpdated: (payload: UpdatedFilesPayload) => void;
  onRoomStateChange: (state: string) => void;
};

export function useEditorSocket({
  socket,
  projectId,
  userId,
  onFilesUpdated,
  onRoomStateChange,
}: UseEditorSocketOptions) {
  useEffect(() => {
    if (!socket || !projectId || !userId) return;

    const handleFiles = (data: UpdatedFilesPayload) => {
      onFilesUpdated(data);
    };

    const handleRoomState = (data: RoomStateChangeEvent) => {
      onRoomStateChange(data.newState);
    };

    const handleSyncStart = () => {
      onRoomStateChange("Synchronizing");
      window.setTimeout(() => {
        socket.emit(SOCKET_EVENTS.roomSyncConfirm, { roomId: projectId });
      }, 500);
    };

    const handleConnectError = () => {
      onRoomStateChange("Offline");
    };

    socket.emit(SOCKET_EVENTS.roomJoin, { roomId: projectId, userId });

    socket.on(SOCKET_EVENTS.updatedFiles, handleFiles);
    socket.on(SOCKET_EVENTS.roomStateChange, handleRoomState);
    socket.on(SOCKET_EVENTS.roomSyncStart, handleSyncStart);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off(SOCKET_EVENTS.updatedFiles, handleFiles);
      socket.off(SOCKET_EVENTS.roomStateChange, handleRoomState);
      socket.off(SOCKET_EVENTS.roomSyncStart, handleSyncStart);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket, projectId, userId, onFilesUpdated, onRoomStateChange]);
}

export function reverseProjectFiles(project: ProjectDetails): ProjectDetails {
  return {
    ...project,
    files: [...project.files].reverse(),
  };
}
