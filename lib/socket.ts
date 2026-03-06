import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(): Socket {
  if (socket) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:3001';

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[v0] Socket connected:', socket!.id);
  });

  socket.on('disconnect', () => {
    console.log('[v0] Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('[v0] Socket error:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function emit(event: string, data?: any): void {
  if (socket) {
    socket.emit(event, data);
  } else {
    console.warn('[v0] Socket not initialized');
  }
}

export function on(event: string, callback: (...args: any[]) => void): void {
  if (socket) {
    socket.on(event, callback);
  } else {
    console.warn('[v0] Socket not initialized');
  }
}

export function off(event: string, callback?: (...args: any[]) => void): void {
  if (socket) {
    socket.off(event, callback);
  }
}

export function once(event: string, callback: (...args: any[]) => void): void {
  if (socket) {
    socket.once(event, callback);
  }
}
