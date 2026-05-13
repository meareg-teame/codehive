import React from "react";
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff } from "lucide-react";

interface MediaControlBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeaveCall: () => void;
}

export function MediaControlBar({
  isMuted,
  isCameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onLeaveCall,
}: MediaControlBarProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-3 px-4 bg-gray-900 rounded-xl mt-4">
      <button
        onClick={onToggleMute}
        className={`p-3 rounded-full transition-colors ${
          isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
        }`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <button
        onClick={onToggleCamera}
        className={`p-3 rounded-full transition-colors ${
          isCameraOff ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
        }`}
        title={isCameraOff ? "Turn on camera" : "Turn off camera"}
      >
        {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
      </button>

      <button
        onClick={onToggleScreenShare}
        className={`p-3 rounded-full transition-colors ${
          isScreenSharing ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-200"
        }`}
        title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
      >
        {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
      </button>

      <div className="w-px h-8 bg-gray-700 mx-2" />

      <button
        onClick={onLeaveCall}
        className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
        title="Leave call"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
}
