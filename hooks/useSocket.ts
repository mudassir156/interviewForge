'use client';

import { useEffect, useCallback } from 'react';
import { initSocket, getSocket, on, off, emit } from '@/lib/socket';

export function useSocket() {
  useEffect(() => {
    // Initialize socket on mount
    initSocket();
  }, []);

  const subscribe = useCallback((event: string, callback: (...args: any[]) => void) => {
    on(event, callback);

    // Cleanup on unmount
    return () => {
      off(event, callback);
    };
  }, []);

  const publish = useCallback((event: string, data?: any) => {
    emit(event, data);
  }, []);

  return {
    socket: getSocket(),
    subscribe,
    publish,
  };
}
