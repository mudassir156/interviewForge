'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Mic, MicOff } from 'lucide-react';

interface Participant {
  id?: string;
  userId?: string;
  name: string;
  role: 'interviewer' | 'candidate';
  isActive: boolean;
  hasVideo?: boolean;
  hasAudio?: boolean;
  avatar?: string;
}

interface ParticipantsPanelProps {
  participants: Participant[];
}

export function ParticipantsPanel({ participants }: ParticipantsPanelProps) {
  return (
    <Card className="glass-dark border-border h-full flex flex-col overflow-hidden">
      <div className="border-b border-border px-4 py-3 flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Participants</h3>
        <Badge className="bg-primary/20 text-primary border-primary/30 border ml-auto">
          {participants.length}
        </Badge>
      </div>

      <div className="flex-1 overflow-auto space-y-2 p-4">
        {participants.map(participant => (
          <div
            key={participant.id || participant.userId || participant.name}
            className="interactive-surface flex items-start justify-between rounded-lg p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-card border border-border flex-shrink-0">
                  {participant.avatar ? (
                    <img src={participant.avatar} alt={`${participant.name} avatar`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {participant.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {participant.role === 'interviewer' ? 'Host' : 'Candidate'}
                  </p>
                </div>
              </div>

              {/* Media Status */}
              <div className="flex gap-1">
                {participant.hasVideo ? (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 border text-xs gap-1">
                    <Video className="w-3 h-3" />
                    Video
                  </Badge>
                ) : null}
                {participant.hasAudio ? (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 border text-xs gap-1">
                    <Mic className="w-3 h-3" />
                    Audio
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Status Indicator */}
            {participant.isActive && (
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2 ml-2" />
            )}
          </div>
        ))}
        {participants.length === 0 && (
          <p className="text-xs text-muted-foreground">No one has joined this room yet.</p>
        )}
      </div>
    </Card>
  );
}
