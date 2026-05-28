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
    <footer className="h-7 border-t border-white/10 bg-background/60 backdrop-blur-md flex items-center justify-between px-4 text-[10px] text-muted-foreground/80 select-none relative z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <Globe className="w-3 h-3 text-primary" />
          <span className="font-semibold uppercase tracking-wider">{roomState}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className={`w-3 h-3 ${getStatusColor()}`} />
          <span className="font-medium">Sync Protocol</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <Info className="w-3 h-3 text-muted-foreground/50" />
          <span>Ln 1, Col 1</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
          <Zap className="w-3 h-3 text-primary animate-pulse" />
          <span className="font-medium">AI Core Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
          <span className="font-medium">{onlineCount} {onlineCount === 1 ? 'Peer' : 'Peers'} Online</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md transition-colors hover:bg-primary/20 cursor-pointer">
          {language}
        </div>
      </div>
    </footer>
  );
}
