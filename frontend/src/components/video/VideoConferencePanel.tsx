import React, { useEffect, useState } from "react";
import { Video, Users, Radio, AlertCircle } from "lucide-react";
import { useWebRTC } from "../../hooks/useWebRTC";
import { VideoTile } from "./VideoTile";
import { MediaControlBar } from "./MediaControlBar";
import { Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

interface VideoConferencePanelProps {
  roomId: string;
  socket: Socket;
  userId: string;
  userName: string;
}

export function VideoConferencePanel({ roomId, socket, userId, userName }: VideoConferencePanelProps) {
  const {
    localStream,
    peers,
    isInCall,
    isMuted,
    isCameraOff,
    isScreenSharing,
    joinCall,
    leaveCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    callError,
    callParticipantCount,
  } = useWebRTC({ roomId, socket, userId, userName });

  console.log("[VideoConferencePanel] Rendering, peers:", peers, "localStream:", localStream);

  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  // Active speaker detection
  useEffect(() => {
    if (!isInCall) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analysers = new Map<string, AnalyserNode>();
    const dataArrays = new Map<string, Uint8Array>();

    const addStream = (id: string, stream: MediaStream) => {
      if (stream.getAudioTracks().length === 0) return;
      try {
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analysers.set(id, analyser);
        dataArrays.set(id, dataArray);
      } catch (e) {
        console.error("Error creating audio analyser", e);
      }
    };

    if (localStream) addStream("local", localStream);
    peers.forEach((peerData, id) => {
      if (peerData.stream) addStream(id, peerData.stream);
    });

    let animationFrameId: number;
    let lastSpeakerChange = Date.now();
    let currentActiveSpeaker: string | null = null;

    const checkLevels = () => {
      let maxVolume = 0;
      let loudestId: string | null = null;

      for (const [id, analyser] of analysers.entries()) {
        const dataArray = dataArrays.get(id);
        if (dataArray) {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          if (average > maxVolume && average > 15) {
            maxVolume = average;
            loudestId = id;
          }
        }
      }

      if (loudestId !== currentActiveSpeaker && Date.now() - lastSpeakerChange > 500) {
        currentActiveSpeaker = loudestId;
        lastSpeakerChange = Date.now();
        setActiveSpeakerId(loudestId);
      }

      animationFrameId = requestAnimationFrame(checkLevels);
    };

    checkLevels();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioContext.state !== "closed") audioContext.close();
    };
  }, [localStream, peers, isInCall]);

  if (!isInCall) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 bg-gradient-to-b from-sidebar/40 to-transparent rounded-2xl border border-white/5 mx-2 my-4 backdrop-blur-sm"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative w-20 h-20 bg-background border border-white/10 rounded-3xl flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-500 shadow-2xl">
            <Video size={36} className="text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-black tracking-tighter uppercase italic text-white">Collaboration Core</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-relaxed max-w-[180px] mx-auto">
            Ready to engage with your team in high-fidelity audio/video.
          </p>
        </div>

        <Button
          onClick={joinCall}
          className="w-full bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.2em] h-11 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {callParticipantCount > 0 ? "Join Call" : "Initialize Uplink"}
        </Button>

        {callError && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-[9px] font-bold uppercase tracking-widest"
          >
            <AlertCircle size={14} />
            {callError}
          </motion.div>
        )}
      </motion.div>
    );
  }

  const participantCount = 1 + peers.size;

  return (
    <div className="flex flex-col h-full bg-sidebar/20 p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground italic">Live Session</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{participantCount} Participating</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Secure Uplink</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        <div className="grid grid-cols-1 gap-4">
          <VideoTile
            stream={localStream}
            userName={userName}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isActiveSpeaker={activeSpeakerId === "local"}
            isLocal={true}
            connectionQuality="good"
          />

          {Array.from(peers.entries()).map(([id, peerData]) => {
            // Only show camera off if explicitly toggled off by user, or if no stream at all
            // Don't check videoTracks.length === 0 because tracks may be added later via addtrack event
            const shouldShowCameraOff = peerData.isCameraOff || !peerData.stream;
            console.log(`[VideoConferencePanel] Peer ${peerData.userName}:`, {
              isCameraOff: peerData.isCameraOff,
              hasStream: !!peerData.stream,
              videoTracks: peerData.stream?.getVideoTracks().length,
              shouldShowCameraOff
            });
            return (
              <VideoTile
                key={id}
                stream={peerData.stream}
                userName={peerData.userName}
                isMuted={peerData.isMuted}
                isCameraOff={shouldShowCameraOff}
                isActiveSpeaker={activeSpeakerId === id}
                connectionQuality="good"
              />
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <MediaControlBar
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onLeaveCall={leaveCall}
        />
      </div>
    </div>
  );
}
