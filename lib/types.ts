// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interview Room Types
export interface InterviewRoom {
  _id?: string;
  roomId: string;
  title: string;
  language: 'javascript' | 'python' | 'java' | 'cpp' | 'go' | 'rust';
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'archived';
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Interview Session Types
export interface InterviewSession {
  _id?: string;
  roomId: string;
  sessionId: string;
  interviewRoom: InterviewRoom;
  participants: SessionParticipant[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'active' | 'paused' | 'completed';
  language: string;
  code: string;
  codeHistory: CodeSnapshot[];
}

export interface SessionParticipant {
  id: string;
  user: User;
  role: 'interviewer' | 'candidate';
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
}

// Code Execution Types
export interface CodeSnapshot {
  timestamp: Date;
  code: string;
  userId: string;
  language: string;
}

export interface ExecutionRequest {
  code: string;
  language: string;
  input?: string;
}

export interface ExecutionResult {
  _id?: string;
  sessionId: string;
  code: string;
  language: string;
  output: string;
  error?: string;
  executionTime: number;
  memory?: number;
  timestamp: Date;
  success: boolean;
}

// Chat/Message Types
export interface Message {
  _id?: string;
  sessionId: string;
  sender: User;
  content: string;
  timestamp: Date;
  type: 'text' | 'system';
}

// Socket.io Event Types
export interface SocketEvents {
  'room:join': (data: { roomId: string; user: User; role: string }) => void;
  'room:leave': (data: { roomId: string; userId: string }) => void;
  'code:update': (data: { code: string; userId: string; language: string }) => void;
  'code:execute': (data: { code: string; language: string; sessionId: string }) => void;
  'execution:result': (data: ExecutionResult) => void;
  'chat:message': (data: Message) => void;
  'participant:join': (data: { participant: SessionParticipant }) => void;
  'participant:leave': (data: { userId: string }) => void;
  'room:close': (data: { roomId: string; reason: string }) => void;
  'error': (data: { message: string }) => void;
}

// Room History Types
export interface RoomHistory {
  _id?: string;
  roomId: string;
  title: string;
  language: string;
  createdBy: User;
  participants: User[];
  startTime: Date;
  endTime: Date;
  duration: number;
  codeSnapshots: CodeSnapshot[];
  executionResults: ExecutionResult[];
  messages: Message[];
  status: 'completed' | 'archived';
}

// Filter Types
export interface RoomFilters {
  language?: string;
  status?: string;
  difficulty?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
