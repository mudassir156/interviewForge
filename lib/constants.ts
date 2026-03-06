// Programming Languages
export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '⟨ ⟩' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⊕' },
  { id: 'go', name: 'Go', icon: '🐹' },
  { id: 'rust', name: 'Rust', icon: '🦀' },
] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', color: 'text-green-400' },
  { id: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { id: 'hard', label: 'Hard', color: 'text-red-400' },
] as const;

// Room Status
export const ROOM_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// Session Status
export const SESSION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

// Participant Roles
export const PARTICIPANT_ROLES = {
  INTERVIEWER: 'interviewer',
  CANDIDATE: 'candidate',
} as const;

// Socket Events
export const SOCKET_EVENTS = {
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  CODE_UPDATE: 'code:update',
  CODE_EXECUTE: 'code:execute',
  EXECUTION_RESULT: 'execution:result',
  CHAT_MESSAGE: 'chat:message',
  PARTICIPANT_JOIN: 'participant:join',
  PARTICIPANT_LEAVE: 'participant:leave',
  ROOM_CLOSE: 'room:close',
  ERROR: 'error',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;

// Code Editor Settings
export const CODE_EDITOR_SETTINGS = {
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_LINE_HEIGHT: 1.5,
  DEFAULT_TAB_SIZE: 2,
  MIN_FONT_SIZE: 10,
  MAX_FONT_SIZE: 20,
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  ROOM_CREATED: 'Interview room created successfully',
  ROOM_JOINED: 'Joined interview room',
  CODE_EXECUTED: 'Code executed successfully',
  ERROR_EXECUTION: 'Error executing code',
  USER_JOINED: 'User joined the interview',
  USER_LEFT: 'User left the interview',
  SESSION_ENDED: 'Interview session ended',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CREATE_ROOM: '/dashboard/create-room',
  ROOM: (roomId: string) => `/interview/${roomId}`,
  HISTORY: '/dashboard/history',
  SETTINGS: '/dashboard/settings',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  ROOMS: '/api/rooms',
  ROOM: (roomId: string) => `/api/rooms/${roomId}`,
  SESSIONS: '/api/sessions',
  SESSION: (sessionId: string) => `/api/sessions/${sessionId}`,
  EXECUTE: '/api/execute',
  MESSAGES: '/api/messages',
} as const;
