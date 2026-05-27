import React, { useEffect, useRef } from "react";
import { MicOff, Signal, SignalHigh, SignalLow, SignalMedium, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const displayName = isLocal ? "You" : userName;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-muted transition-all duration-500 shadow-2xl ${
        isActiveSpeaker ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "border border-white/5"
      }`}
    >
      <AnimatePresence mode="wait">
        {isCameraOff ? (
          <motion.div 
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sidebar to-background relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-primary),transparent)] opacity-10" />
            <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-xl border border-primary/20 flex items-center justify-center text-primary text-xl font-black italic shadow-lg z-10">
              {initials}
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 z-10">Camera Off</p>
          </motion.div>
        ) : (
          <motion.video
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          />
        )}
      </AnimatePresence>

      {/* Name tag Overlay */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5">
          {isLocal && <User className="w-3 h-3 text-primary" />}
          {displayName}
        </div>
      </div>

      {/* Status Bar Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <AnimatePresence>
          {isMuted && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-destructive/80 backdrop-blur-xl border border-destructive/20 p-1.5 rounded-lg text-white shadow-xl"
            >
              <MicOff size={12} />
            </motion.div>
          )}
        </AnimatePresence>

        {connectionQuality !== "unknown" && !isLocal && (
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-lg text-white shadow-xl">
            {connectionQuality === "good" && <SignalHigh size={12} className="text-emerald-500" />}
            {connectionQuality === "fair" && <SignalMedium size={12} className="text-amber-500" />}
            {connectionQuality === "poor" && <SignalLow size={12} className="text-rose-500" />}
          </div>
        )}
      </div>

      {/* Speaker indicator (subtle pulse overlay) */}
      {isActiveSpeaker && (
        <div className="absolute inset-0 pointer-events-none ring-inset ring-2 ring-primary/20 animate-pulse" />
      )}
    </motion.div>
  );
}
