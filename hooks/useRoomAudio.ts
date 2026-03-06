'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { emit, getSocket, off, on } from '@/lib/socket';

type ParticipantRef = {
  id?: string;
};

interface UseRoomAudioOptions {
  roomId: string;
  participants: ParticipantRef[];
}

interface WebRTCOfferPayload {
  roomId: string;
  fromSocketId: string;
  sdp: RTCSessionDescriptionInit;
}

interface WebRTCAnswerPayload {
  roomId: string;
  fromSocketId: string;
  sdp: RTCSessionDescriptionInit;
}

interface WebRTCIcePayload {
  roomId: string;
  fromSocketId: string;
  candidate: RTCIceCandidateInit;
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

function getIceServers(): RTCIceServer[] {
  const raw = process.env.NEXT_PUBLIC_WEBRTC_ICE_SERVERS;

  if (!raw) {
    return DEFAULT_ICE_SERVERS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as RTCIceServer[];
    }
    return DEFAULT_ICE_SERVERS;
  } catch {
    return DEFAULT_ICE_SERVERS;
  }
}

export function useRoomAudio({ roomId, participants }: UseRoomAudioOptions) {
  const [isVoiceJoined, setIsVoiceJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isJoiningVoice, setIsJoiningVoice] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudioRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const pendingAudioPlaybackRef = useRef<Set<string>>(new Set());
  const hasAttemptedJoinRef = useRef(false);

  const iceServers = useMemo(() => getIceServers(), []);

  const getOrCreateAudioEl = useCallback((socketId: string): HTMLAudioElement => {
    const existing = remoteAudioRef.current.get(socketId);
    if (existing) {
      return existing;
    }

    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.setAttribute('playsinline', 'true');
    audioEl.style.display = 'none';
    audioEl.dataset.socketId = socketId;
    document.body.appendChild(audioEl);

    remoteAudioRef.current.set(socketId, audioEl);
    return audioEl;
  }, []);

  const removeAudioEl = useCallback((socketId: string) => {
    const audioEl = remoteAudioRef.current.get(socketId);
    if (!audioEl) {
      return;
    }

    audioEl.srcObject = null;
    audioEl.remove();
    remoteAudioRef.current.delete(socketId);
    pendingAudioPlaybackRef.current.delete(socketId);
  }, []);

  const playRemoteAudio = useCallback(async (socketId: string) => {
    const audioEl = remoteAudioRef.current.get(socketId);
    if (!audioEl) {
      return;
    }

    try {
      await audioEl.play();
      pendingAudioPlaybackRef.current.delete(socketId);
    } catch {
      pendingAudioPlaybackRef.current.add(socketId);
    }
  }, []);

  const retryPendingAudioPlayback = useCallback(() => {
    const pendingIds = Array.from(pendingAudioPlaybackRef.current.values());
    pendingIds.forEach((socketId) => {
      void playRemoteAudio(socketId);
    });
  }, [playRemoteAudio]);

  const closePeer = useCallback((socketId: string) => {
    const peer = peersRef.current.get(socketId);
    if (peer) {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.close();
      peersRef.current.delete(socketId);
    }

    removeAudioEl(socketId);
  }, [removeAudioEl]);

  const closeAllPeers = useCallback(() => {
    const peerIds = Array.from(peersRef.current.keys());
    peerIds.forEach(closePeer);
  }, [closePeer]);

  const createPeerConnection = useCallback(
    (targetSocketId: string) => {
      const existingPeer = peersRef.current.get(targetSocketId);
      if (existingPeer) {
        return existingPeer;
      }

      const peer = new RTCPeerConnection({ iceServers });

      peer.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        emit('webrtc:ice-candidate', {
          roomId,
          targetSocketId,
          candidate: event.candidate.toJSON(),
        });
      };

      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) {
          return;
        }

        const audioEl = getOrCreateAudioEl(targetSocketId);
        audioEl.srcObject = remoteStream;
        void playRemoteAudio(targetSocketId);
      };

      peer.onconnectionstatechange = () => {
        if (
          peer.connectionState === 'failed'
          || peer.connectionState === 'closed'
          || peer.connectionState === 'disconnected'
        ) {
          closePeer(targetSocketId);
        }
      };

      const localStream = localStreamRef.current;
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peer.addTrack(track, localStream);
        });
      }

      peersRef.current.set(targetSocketId, peer);
      return peer;
    },
    [closePeer, getOrCreateAudioEl, iceServers, roomId]
  );

  useEffect(() => {
    const interactionEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart'];

    const handleUserInteraction = () => {
      retryPendingAudioPlayback();
    };

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserInteraction, { passive: true });
    });

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserInteraction);
      });
    };
  }, [retryPendingAudioPlayback]);

  const shouldInitiateOffer = useCallback((targetSocketId: string) => {
    const mySocketId = getSocket()?.id;
    if (!mySocketId || mySocketId === targetSocketId) {
      return false;
    }

    return mySocketId > targetSocketId;
  }, []);

  const createAndSendOffer = useCallback(
    async (targetSocketId: string) => {
      if (!isVoiceJoined || !shouldInitiateOffer(targetSocketId)) {
        return;
      }

      try {
        const peer = createPeerConnection(targetSocketId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        emit('webrtc:offer', {
          roomId,
          targetSocketId,
          sdp: offer,
        });
      } catch (error) {
        console.error('[v0] Failed to create/send offer:', error);
      }
    },
    [createPeerConnection, isVoiceJoined, roomId, shouldInitiateOffer]
  );

  const joinVoice = useCallback(async () => {
    if (isVoiceJoined || isJoiningVoice) {
      return;
    }

    setIsJoiningVoice(true);
    setAudioError(null);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = localStream;
      setIsVoiceJoined(true);
      setIsMuted(false);

      emit('participant:media', {
        roomId,
        hasAudio: true,
      });
      hasAttemptedJoinRef.current = true;
    } catch (error) {
      console.error('[v0] Failed to join voice:', error);
      setAudioError('Microphone access is required for voice chat.');
      hasAttemptedJoinRef.current = true;
    } finally {
      setIsJoiningVoice(false);
    }
  }, [isJoiningVoice, isVoiceJoined, roomId]);

  useEffect(() => {
    if (hasAttemptedJoinRef.current || isVoiceJoined || isJoiningVoice) {
      return;
    }

    void joinVoice();
  }, [isJoiningVoice, isVoiceJoined, joinVoice]);

  const leaveVoice = useCallback(() => {
    closeAllPeers();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setIsVoiceJoined(false);
    setIsMuted(false);
    emit('participant:media', {
      roomId,
      hasAudio: false,
    });
  }, [closeAllPeers, roomId]);

  const toggleMute = useCallback(() => {
    const localStream = localStreamRef.current;
    if (!localStream) {
      if (!isJoiningVoice) {
        void joinVoice();
      }
      return;
    }

    const nextMuted = !isMuted;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);
    emit('participant:media', {
      roomId,
      hasAudio: !nextMuted,
    });
  }, [isJoiningVoice, isMuted, joinVoice, roomId]);

  useEffect(() => {
    if (!isVoiceJoined) {
      return;
    }

    const targetSocketIds = participants
      .map((participant) => participant.id)
      .filter((id): id is string => Boolean(id));

    targetSocketIds.forEach((socketId) => {
      const mySocketId = getSocket()?.id;
      if (!mySocketId || socketId === mySocketId) {
        return;
      }

      if (!peersRef.current.has(socketId)) {
        void createAndSendOffer(socketId);
      }
    });
  }, [createAndSendOffer, isVoiceJoined, participants]);

  useEffect(() => {
    const handleOffer = async (payload: WebRTCOfferPayload) => {
      if (payload.roomId !== roomId || !isVoiceJoined) {
        return;
      }

      try {
        const peer = createPeerConnection(payload.fromSocketId);
        await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        emit('webrtc:answer', {
          roomId,
          targetSocketId: payload.fromSocketId,
          sdp: answer,
        });
      } catch (error) {
        console.error('[v0] Failed to handle offer:', error);
      }
    };

    const handleAnswer = async (payload: WebRTCAnswerPayload) => {
      if (payload.roomId !== roomId || !isVoiceJoined) {
        return;
      }

      try {
        const peer = peersRef.current.get(payload.fromSocketId);
        if (!peer) {
          return;
        }

        await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      } catch (error) {
        console.error('[v0] Failed to handle answer:', error);
      }
    };

    const handleIceCandidate = async (payload: WebRTCIcePayload) => {
      if (payload.roomId !== roomId || !isVoiceJoined) {
        return;
      }

      try {
        const peer = peersRef.current.get(payload.fromSocketId);
        if (!peer) {
          return;
        }

        await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (error) {
        console.error('[v0] Failed to handle ICE candidate:', error);
      }
    };

    const handleParticipantLeave = (data: { userId?: string }) => {
      if (!data.userId) {
        return;
      }
      closePeer(data.userId);
    };

    on('webrtc:offer', handleOffer);
    on('webrtc:answer', handleAnswer);
    on('webrtc:ice-candidate', handleIceCandidate);
    on('participant:leave', handleParticipantLeave);

    return () => {
      off('webrtc:offer', handleOffer);
      off('webrtc:answer', handleAnswer);
      off('webrtc:ice-candidate', handleIceCandidate);
      off('participant:leave', handleParticipantLeave);
    };
  }, [closePeer, createPeerConnection, isVoiceJoined, roomId]);

  useEffect(() => {
    return () => {
      leaveVoice();
    };
  }, [leaveVoice]);

  return {
    isVoiceJoined,
    isMuted,
    isJoiningVoice,
    audioError,
    joinVoice,
    leaveVoice,
    toggleMute,
  };
}
