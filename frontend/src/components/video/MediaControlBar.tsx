import React from "react";
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";

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
    <TooltipProvider>
      <div className="flex items-center justify-center gap-2 p-2 bg-background/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              onClick={onToggleMute}
              className="w-10 h-10 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{isMuted ? "Unmute Mic" : "Mute Mic"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCameraOff ? "destructive" : "secondary"}
              size="icon"
              onClick={onToggleCamera}
              className="w-10 h-10 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{isCameraOff ? "Enable Camera" : "Disable Camera"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isScreenSharing ? "primary" : "secondary"}
              size="icon"
              onClick={onToggleScreenShare}
              className={`w-10 h-10 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                isScreenSharing ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{isScreenSharing ? "Stop Sharing" : "Share Screen"}</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={onLeaveCall}
              className="w-10 h-10 rounded-xl shadow-lg shadow-destructive/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <PhoneOff size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Disconnect</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
