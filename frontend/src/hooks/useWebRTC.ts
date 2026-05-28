import { useState, useEffect, useRef, useCallback } from "react";
import SimplePeer from "simple-peer";
import { Socket } from "socket.io-client";

interface PeerData {
  peer: SimplePeer.Instance;
  stream: MediaStream | null;
  userName: string;
  isMuted: boolean;
  isCameraOff: boolean;
}

interface UseWebRTCProps {
  roomId: string;
  socket: Socket;
  userId: string;
  userName: string;
}

export function useWebRTC({ roomId, socket, userId, userName }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerData>>(new Map());
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);

  const peersRef = useRef<Map<string, PeerData>>(new Map());
  const streamRef = useRef<MediaStream | null>(null);

  const updatePeers = () => {
    setPeers(new Map(peersRef.current));
  };

  const getReadableMediaError = (error: unknown) => {
    if (!(error instanceof DOMException)) {
      return "Could not access camera or microphone.";
    }

    switch (error.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Camera or microphone permission was denied.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No camera or microphone was found on this device.";
      case "NotReadableError":
      case "TrackStartError":
        return "Camera or microphone is already in use by another app or browser tab.";
      case "OverconstrainedError":
      case "ConstraintNotSatisfiedError":
        return "Requested camera or microphone settings are not supported on this device.";
      case "AbortError":
        return "The browser could not start the selected camera or microphone.";
      default:
        return `${error.name}: could not access camera or microphone.`;
    }
  };

  const getPreferredMediaStream = async () => {
    const attempts: Array<{
      constraints: MediaStreamConstraints;
      onSuccess: (stream: MediaStream) => void;
      fallbackMessage?: string;
    }> = [
      {
        constraints: {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        },
        onSuccess: (stream) => {
          setIsCameraOff(stream.getVideoTracks().length === 0);
          setIsMuted(stream.getAudioTracks().length === 0);
        },
      },
      {
        constraints: {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        },
        onSuccess: () => {
          setIsCameraOff(true);
          setIsMuted(false);
          setCallError("Camera unavailable. Joined with microphone only.");
        },
      },
      {
        constraints: {
          audio: false,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        },
        onSuccess: () => {
          setIsCameraOff(false);
          setIsMuted(true);
          setCallError("Microphone unavailable. Joined with camera only.");
        },
      },
    ];

    let lastError: unknown = null;
    for (const attempt of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(attempt.constraints);
        attempt.onSuccess(stream);
        return stream;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  };

  const createPeer = (
    userToSignal: string,
    callerId: string,
    stream: MediaStream,
    isInitiator: boolean,
    remoteUserName: string
  ) => {
    const existingPeer = peersRef.current.get(userToSignal);
    if (existingPeer) {
      return existingPeer.peer;
    }

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream,
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });

    peer.on("signal", (signal) => {
      if (signal.type === "offer") {
        socket.emit("webrtc:offer", {
          targetSocketId: userToSignal,
          offer: signal,
          senderSocketId: callerId,
          senderUserName: userName,
        });
      } else if (signal.type === "answer") {
        socket.emit("webrtc:answer", {
          targetSocketId: userToSignal,
          answer: signal,
        });
      } else if ("candidate" in signal) {
        socket.emit("webrtc:ice-candidate", {
          targetSocketId: userToSignal,
          candidate: signal,
        });
      }
    });

    peer.on("stream", (remoteStream) => {
      const peerData = peersRef.current.get(userToSignal);
      if (peerData) {
        peerData.stream = remoteStream;
        peersRef.current.set(userToSignal, peerData);
        updatePeers();
      }
    });

    peer.on("close", () => {
      peer.destroy();
      peersRef.current.delete(userToSignal);
      updatePeers();
    });

    peer.on("error", (err) => {
      console.error("SimplePeer error:", err);
      peer.destroy();
      peersRef.current.delete(userToSignal);
      updatePeers();
    });

    peersRef.current.set(userToSignal, { peer, stream: null, userName: remoteUserName, isMuted: false, isCameraOff: false });
    updatePeers();

    return peer;
  };

  const joinCall = async () => {
    if (isInCall) return;
    setCallError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCallError("This browser does not support camera or microphone access.");
        return;
      }

      const stream = await getPreferredMediaStream();

      setLocalStream(stream);
      streamRef.current = stream;
      setIsInCall(true);

      socket.emit("webrtc:join-call", { roomId, userId, userName });
    } catch (error) {
      setCallError(getReadableMediaError(error));
      return;
    }
  };

  const leaveCall = useCallback(() => {
    peersRef.current.forEach(({ peer }) => {
      peer.destroy();
    });
    peersRef.current.clear();
    updatePeers();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    streamRef.current = null;
    setIsInCall(false);
    setIsScreenSharing(false);

    socket.emit("webrtc:leave-call", { roomId, userId });
  }, [roomId, socket, userId]);

  useEffect(() => {
    socket.on("webrtc:call-full", () => {
      setCallError("Room is at full capacity (max 6 participants).");
      leaveCall();
    });

    socket.on("webrtc:all-call-participants", (users: any[]) => {
      if (!streamRef.current) return;
      users.forEach((user) => {
        createPeer(user.socketId, socket.id as string, streamRef.current!, true, user.userName);
      });
    });

    socket.on("webrtc:user-joined-call", (payload) => {
      if (!streamRef.current) return;
      createPeer(payload.socketId, socket.id as string, streamRef.current, false, payload.userName);
    });

    socket.on("webrtc:offer", (payload) => {
      const peerData = peersRef.current.get(payload.senderSocketId);
      if (peerData) {
        peerData.peer.signal(payload.offer);
      } else if (streamRef.current) {
        // If we don't have a peer for them yet, maybe they joined at the exact same time
        const peer = createPeer(payload.senderSocketId, socket.id as string, streamRef.current, false, payload.senderUserName);
        peer.signal(payload.offer);
      }
    });

    socket.on("webrtc:answer", (payload) => {
      const peerData = peersRef.current.get(payload.senderSocketId);
      if (peerData) {
        peerData.peer.signal(payload.answer);
      }
    });

    socket.on("webrtc:ice-candidate", (payload) => {
      const peerData = peersRef.current.get(payload.senderSocketId);
      if (peerData) {
        peerData.peer.signal(payload.candidate);
      }
    });

    socket.on("webrtc:user-left-call", (payload) => {
      const peerData = peersRef.current.get(payload.socketId);
      if (peerData) {
        peerData.peer.destroy();
        peersRef.current.delete(payload.socketId);
        updatePeers();
      }
    });

    socket.on("webrtc:media-state", (payload) => {
      const peerData = peersRef.current.get(payload.socketId);
      if (peerData) {
        peerData.isMuted = payload.isMuted;
        peerData.isCameraOff = payload.isCameraOff;
        updatePeers();
      }
    });

    return () => {
      socket.off("webrtc:call-full");
      socket.off("webrtc:all-call-participants");
      socket.off("webrtc:user-joined-call");
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
      socket.off("webrtc:user-left-call");
      socket.off("webrtc:media-state");
    };
  }, [socket, userName]);

  useEffect(() => {
    return () => {
      if (isInCall) {
        leaveCall();
      }
    };
  }, [isInCall, leaveCall]);

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuted = !audioTrack.enabled;
        setIsMuted(newMuted);
        socket.emit("webrtc:media-state", { roomId, isMuted: newMuted, isCameraOff });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" } as MediaTrackConstraints,
          audio: false,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track for all peers
        peersRef.current.forEach(({ peer }) => {
          const videoTrack = streamRef.current?.getVideoTracks()[0];
          if (videoTrack && peer.streams[0]) {
            peer.replaceTrack(videoTrack, screenTrack, streamRef.current!);
          }
        });

        screenTrack.onended = () => {
          stopScreenShare();
        };

        // Replace local stream
        if (streamRef.current) {
          const videoTrack = streamRef.current.getVideoTracks()[0];
          streamRef.current.removeTrack(videoTrack);
          streamRef.current.addTrack(screenTrack);
          setLocalStream(new MediaStream(streamRef.current.getTracks()));
        }

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];

      if (isCameraOff) {
        cameraTrack.enabled = false;
      }

      peersRef.current.forEach(({ peer }) => {
        const videoTrack = streamRef.current?.getVideoTracks()[0];
        if (videoTrack && peer.streams[0]) {
          peer.replaceTrack(videoTrack, cameraTrack, streamRef.current!);
        }
      });

      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        videoTrack.stop();
        streamRef.current.removeTrack(videoTrack);
        streamRef.current.addTrack(cameraTrack);
        setLocalStream(new MediaStream(streamRef.current.getTracks()));
      }

      setIsScreenSharing(false);
    } catch (err) {
      console.error("Error reverting to camera:", err);
    }
  };

  const enableCameraTrack = useCallback(async () => {
    if (!streamRef.current) return;

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];

      peersRef.current.forEach(({ peer }) => {
        const currentVideoTrack = streamRef.current?.getVideoTracks()[0];
        if (currentVideoTrack && streamRef.current) {
          peer.replaceTrack(currentVideoTrack, cameraTrack, streamRef.current);
        }
      });

      streamRef.current.addTrack(cameraTrack);
      setLocalStream(new MediaStream(streamRef.current.getTracks()));
      setIsCameraOff(false);
      socket.emit("webrtc:media-state", { roomId, isMuted, isCameraOff: false });
    } catch (error) {
      console.error("Error enabling camera:", error);
      setCallError("Could not enable camera.");
    }
  }, [isMuted, roomId, socket]);

  const toggleCameraSafe = useCallback(() => {
    if (!streamRef.current) return;

    if (streamRef.current.getVideoTracks().length === 0) {
      void enableCameraTrack();
      return;
    }

    const videoTrack = streamRef.current.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    const newCameraOff = !videoTrack.enabled;
    setIsCameraOff(newCameraOff);
    socket.emit("webrtc:media-state", { roomId, isMuted, isCameraOff: newCameraOff });
  }, [enableCameraTrack, isMuted, roomId, socket]);

  return {
    localStream,
    peers,
    isInCall,
    isMuted,
    isCameraOff,
    isScreenSharing,
    joinCall,
    leaveCall,
    toggleMute,
    toggleCamera: toggleCameraSafe,
    toggleScreenShare,
    callError,
  };
}
