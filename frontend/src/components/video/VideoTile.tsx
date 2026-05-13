import React, { useEffect, useRef } from "react";
import { MicOff, Signal, SignalHigh, SignalLow, SignalMedium } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null;
  userName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isActiveSpeaker: boolean;
  connectionQuality?: "good" | "fair" | "poor" | "unknown";
  isLocal?: boolean;
}

export function VideoTile({
  stream,
  userName,
  isMuted,
  isCameraOff,
  isActiveSpeaker,
  connectionQuality = "unknown",
  isLocal = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const displayName = isLocal ? `${userName} (You)` : userName;
  const truncatedName = displayName.length > 18 ? displayName.slice(0, 15) + "..." : displayName;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 transition-all duration-300 animate-in fade-in zoom-in-95 ${
        isActiveSpeaker ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {isCameraOff ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-white text-2xl font-semibold">
            {initials}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-md">
        {truncatedName}
      </div>

      {/* Mute indicator */}
      {isMuted && (
        <div className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full text-white">
          <MicOff size={14} />
        </div>
      )}

      {/* Connection Quality */}
      {connectionQuality !== "unknown" && !isLocal && (
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-md text-white">
          {connectionQuality === "good" && <SignalHigh size={14} className="text-green-500" />}
          {connectionQuality === "fair" && <SignalMedium size={14} className="text-yellow-500" />}
          {connectionQuality === "poor" && <SignalLow size={14} className="text-red-500" />}
        </div>
      )}
    </div>
  );
}
