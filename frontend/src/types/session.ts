export type RoomState =
  | "Initialized"
  | "Waiting"
  | "Active"
  | "Synchronizing"
  | "Terminated"
  | "Offline";

export type RoomStateChangeEvent = {
  roomId?: string;
  newState: string;
};
