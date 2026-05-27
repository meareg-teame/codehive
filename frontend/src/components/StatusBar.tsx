import React from "react";
import { CheckCircle2, Globe, Info, Zap } from "lucide-react";

interface StatusBarProps {
  language: string;
  roomState: string;
  onlineCount: number;
}

export function StatusBar({ language, roomState, onlineCount }: StatusBarProps) {
  const getStatusColor = () => {
    switch (roomState.toLowerCase()) {
      case "synchronized":
      case "initialized":
        return "text-green-400";
      case "synchronizing":
        return "text-blue-400 animate-pulse";
      case "offline":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  return (
    <footer className="h-6 border-t border-white/5 bg-background flex items-center justify-between px-3 text-[10px] text-muted-foreground select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <Globe className="w-3 h-3" />
          <span className="font-medium uppercase tracking-wider">{roomState}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className={`w-3 h-3 ${getStatusColor()}`} />
          <span>Sync Status</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <Info className="w-3 h-3" />
          <span>Ln 1, Col 1</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span>AI Assistant Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span>{onlineCount} {onlineCount === 1 ? 'Collaborator' : 'Collaborators'}</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-foreground uppercase tracking-widest bg-accent/50 px-2 py-0.5 rounded transition-colors hover:bg-accent cursor-pointer">
          {language}
        </div>
      </div>
    </footer>
  );
}
