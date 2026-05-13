import React, { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { useWebRTC } from "../../hooks/useWebRTC";
import { VideoTile } from "./VideoTile";
import { MediaControlBar } from "./MediaControlBar";
import { Socket } from "socket.io-client";

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
  } = useWebRTC({ roomId, socket, userId, userName });

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
      <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-900 rounded-lg">
        <button
          onClick={joinCall}
          className="flex flex-col items-center justify-center p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <Video size={48} className="mb-4" />
          <span className="text-xl font-semibold">Join Call</span>
        </button>
        {callError && (
          <p className="mt-4 text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">
            {callError}
          </p>
        )}
      </div>
    );
  }

  const participantCount = 1 + peers.size;
  let gridClass = "grid-cols-1";
  if (participantCount >= 2) gridClass = "grid-cols-2";

  return (
    <div className="flex flex-col h-full bg-gray-950 p-3 rounded-xl overflow-hidden">
      <div className="text-gray-400 text-sm font-medium mb-3 flex items-center justify-between px-1">
        <span>{participantCount} {participantCount === 1 ? "person" : "people"} in call</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live
        </span>
      </div>

      <div className={`grid ${gridClass} gap-3 auto-rows-max flex-1 overflow-y-auto pr-1`}>
        {/* Local Stream */}
        <VideoTile
          stream={localStream}
          userName={userName}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isActiveSpeaker={activeSpeakerId === "local"}
          isLocal={true}
          connectionQuality="good"
        />

        {/* Remote Streams */}
        {Array.from(peers.entries()).map(([id, peerData]) => (
          <VideoTile
            key={id}
            stream={peerData.stream}
            userName={peerData.userName}
            isMuted={peerData.isMuted}
            isCameraOff={peerData.isCameraOff || !peerData.stream || peerData.stream.getVideoTracks().length === 0}
            isActiveSpeaker={activeSpeakerId === id}
            connectionQuality="good" // Real implementation would query peer.peer._pc.getStats()
          />
        ))}
      </div>

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
  );
}
