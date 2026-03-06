'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CodeEditor } from './code-editor';
import { ChatPanel } from './chat-panel';
import { ParticipantsPanel } from './participants-panel';
import { ExecutionPanel } from './execution-panel';
import type { ExecutionResult } from './execution-panel';
import { ArrowLeft, Copy, Phone, Copy as CopyIcon, Loader2, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { initSocket, emit, on, off, getSocket } from '@/lib/socket';
import { useRoomAudio } from '@/hooks/useRoomAudio';

interface LiveRoomProps {
  roomId: string;
}

interface RoomInfo {
  title: string;
  language: string;
  difficulty: string;
  status: string;
}

const getRoomTitle = (room: any) => {
  const titleCandidates = [
    room?.title,
    room?.jobTitle,
    room?.position,
    room?.role,
    room?.description,
  ];

  const matchedTitle = titleCandidates.find(
    (value) => typeof value === 'string' && value.trim().length > 0
  );

  return typeof matchedTitle === 'string' ? matchedTitle.trim() : 'Interview Room';
};

type RoomParticipant = {
  id?: string;
  userId?: string;
  name: string;
  avatar?: string;
  role: 'interviewer' | 'candidate';
  isActive: boolean;
  hasVideo?: boolean;
  hasAudio?: boolean;
};

export function LiveRoom({ roomId }: LiveRoomProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const {
    isVoiceJoined,
    isMuted,
    isJoiningVoice,
    audioError,
    leaveVoice,
    toggleMute,
  } = useRoomAudio({ roomId, participants });

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms?roomId=${roomId}`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.rooms?.length > 0) {
          const r = data.rooms[0];
          setRoomInfo({
            title: getRoomTitle(r),
            language: r.language,
            difficulty: r.difficulty,
            status: r.status,
          });
        }
      } catch (err) {
        console.error('[v0] Failed to fetch room info:', err);
      } finally {
        setRoomLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Join socket room
  useEffect(() => {
    if (!user) return;
    initSocket();

    setParticipants((previous) => {
      const exists = previous.some(
        (participant) => participant.userId === user.id || participant.name === user.name
      );
      if (exists) {
        return previous;
      }
      return [
        ...previous,
        {
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role === 'candidate' ? 'candidate' : 'interviewer',
          isActive: true,
          hasAudio: true,
          hasVideo: false,
        },
      ];
    });

    const normalizeParticipant = (participant: any): RoomParticipant => ({
      id: participant.id,
      userId: participant.userId,
      name: participant.name,
      avatar: participant.avatar,
      role: participant.role === 'candidate' ? 'candidate' : 'interviewer',
      isActive: participant.isActive ?? true,
      hasAudio: participant.hasAudio,
      hasVideo: participant.hasVideo,
    });

    const handleRoomState = (data: any) => {
      if (!Array.isArray(data.participants)) {
        return;
      }
      setParticipants(data.participants.map(normalizeParticipant));
    };

    const handleParticipantJoin = (data: any) => {
      const participant = normalizeParticipant(data.participant || data);
      setParticipants((previous) => {
        const existingIndex = previous.findIndex(
          (item) => (item.id && item.id === participant.id)
            || (item.userId && item.userId === participant.userId)
            || item.name === participant.name
        );

        if (existingIndex === -1) {
          return [...previous, participant];
        }

        const updated = [...previous];
        updated[existingIndex] = { ...updated[existingIndex], ...participant, isActive: true };
        return updated;
      });
    };

    const handleParticipantLeave = (data: any) => {
      const leftId = data.userId;
      if (!leftId) {
        return;
      }

      setParticipants((previous) =>
        previous.filter((participant) => participant.id !== leftId && participant.userId !== leftId)
      );
    };

    const handleParticipantUpdate = (data: any) => {
      const incoming = normalizeParticipant(data.participant || data);
      setParticipants((previous) => {
        const index = previous.findIndex(
          (participant) => (participant.id && participant.id === incoming.id)
            || (participant.userId && participant.userId === incoming.userId)
            || participant.name === incoming.name
        );

        if (index === -1) {
          return [...previous, incoming];
        }

        const updated = [...previous];
        updated[index] = { ...updated[index], ...incoming };
        return updated;
      });
    };

    const handleRoomClose = () => {
      router.push('/dashboard/history');
    };

    const joinRoom = () => {
      emit('room:join', {
        roomId,
        user: { id: user.id, name: user.name, avatar: user.avatar },
        role: user.role ?? 'interviewer',
      });
    };

    const handleSocketConnect = () => {
      joinRoom();
    };

    on('room:state', handleRoomState);
    on('participant:join', handleParticipantJoin);
    on('participant:leave', handleParticipantLeave);
    on('participant:update', handleParticipantUpdate);
    on('room:close', handleRoomClose);
    on('connect', handleSocketConnect);

    if (getSocket()?.connected) {
      joinRoom();
    }

    return () => {
      off('room:state', handleRoomState);
      off('participant:join', handleParticipantJoin);
      off('participant:leave', handleParticipantLeave);
      off('participant:update', handleParticipantUpdate);
      off('room:close', handleRoomClose);
      off('connect', handleSocketConnect);
      emit('room:leave', { roomId });
    };
  }, [roomId, router, user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/interview/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndSession = async () => {
    if (isEndingSession) return;

    setIsEndingSession(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ roomId, status: 'completed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      emit('room:close', {
        roomId,
        reason: 'Session ended by host',
      });
      leaveVoice();
      emit('room:leave', { roomId });
      router.push('/dashboard/history');
    } catch (error) {
      console.error('[v0] Failed to end session:', error);
      setIsEndingSession(false);
    }
  };

  const languageLabel = roomInfo?.language
    ? roomInfo.language.charAt(0).toUpperCase() + roomInfo.language.slice(1)
    : '';

  const difficultyLabel = roomInfo?.difficulty
    ? roomInfo.difficulty.charAt(0).toUpperCase() + roomInfo.difficulty.slice(1)
    : '';

  const roomTitle = roomInfo?.title?.trim() ? roomInfo.title : 'Interview Room';

  return (
    <div className="h-dvh bg-gradient-dark flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* Header */}
      <header className="border-b border-border bg-card flex items-center justify-between flex-wrap" style={{ padding: '1rem 1.5rem', gap: '1rem', flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            {roomLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading room...</span>
              </div>
            ) : (
              <>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  {roomTitle}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {languageLabel}{difficultyLabel ? ` • Difficulty: ${difficultyLabel}` : ''}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 border">
            ● Live
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2 text-xs sm:text-sm text-foreground border-border/80 bg-card/40 hover:bg-card/80 hover:text-foreground"
          >
            {copied ? (
              <><CopyIcon className="w-4 h-4" />Copied!</>
            ) : (
              <><Copy className="w-4 h-4" />Share</>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-foreground border-border/80 bg-card/40 hover:bg-card/80 hover:text-foreground"
            onClick={toggleMute}
            disabled={isJoiningVoice}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isJoiningVoice ? 'Connecting Mic...' : isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hidden sm:flex text-foreground border-border/80 bg-card/40 hover:bg-red-500/12 hover:text-red-200 hover:border-red-400/30"
            onClick={handleEndSession}
            disabled={isEndingSession}
          >
            <Phone className="w-4 h-4" />
            {isEndingSession ? 'Ending...' : 'End Session'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      {audioError ? (
        <div className="px-4 sm:px-6 pt-2 text-xs text-red-300">{audioError}</div>
      ) : null}
  <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 overflow-hidden min-h-0">
  <div className="flex-[2] flex flex-col gap-4 overflow-hidden min-h-0">
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <CodeEditor
              roomId={roomId}
              userId={user?.id}
              onExecute={setExecutionResult}
              onExecuting={setIsExecuting}
            />
          </div>

          {/* Execution Panel */}
        <div style={{ height: '160px', flexShrink: 0 }}>
            <ExecutionPanel result={executionResult} isExecuting={isExecuting} />
          </div>
        </div>

        {/* Right Panel - Chat and Participants */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Participants */}
          <div className="flex-1 min-h-0">
            <ParticipantsPanel participants={participants} />
          </div>

          {/* Chat */}
          <div className="h-64 lg:h-auto lg:flex-1 min-h-0">
            <ChatPanel
              roomId={roomId}
              currentUser={user ? { id: user.id, name: user.name, role: user.role, avatar: user.avatar } : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
