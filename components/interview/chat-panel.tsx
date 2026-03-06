'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send } from 'lucide-react';
import { initSocket, on, off, emit, getSocket } from '@/lib/socket';

interface Message {
  id: string;
  clientMessageId?: string;
  sender: string;
  senderAvatar?: string;
  role: 'interviewer' | 'candidate' | 'system';
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  roomId: string;
  currentUser?: {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
  } | null;
}

export function ChatPanel({ roomId, currentUser }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?roomId=${roomId}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await response.json();

        if (response.ok && Array.isArray(data.messages)) {
          const normalized: Message[] = data.messages.map((message: any) => {
            const senderName =
              typeof message.sender === 'object' && message.sender?.name
                ? message.sender.name
                : typeof message.sender === 'string'
                  ? message.sender
                  : 'Unknown';

            return {
              id: String(message._id || message.id || Date.now()),
              sender: senderName,
              senderAvatar:
                typeof message.sender === 'object' && typeof message.sender?.avatar === 'string'
                  ? message.sender.avatar
                  : undefined,
              role: senderName === currentUser?.name ? 'interviewer' : 'candidate',
              content: message.content,
              timestamp: message.timestamp,
            };
          });
          setMessages(normalized);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [currentUser?.name, roomId]);

  useEffect(() => {
    initSocket();

    const handleIncomingMessage = (data: any) => {
      if (data.roomId && data.roomId !== roomId) {
        return;
      }

      const senderName = typeof data.sender === 'object' ? (data.sender?.name || 'Unknown') : (data.sender || 'Unknown');
      const senderAvatar = typeof data.sender === 'object' && typeof data.sender?.avatar === 'string'
        ? data.sender.avatar
        : undefined;
      const messageId = String(data.id || data._id || Date.now());
      const clientMessageId = data.clientMessageId ? String(data.clientMessageId) : undefined;

      setMessages((prev) => {
        if (prev.some((message) => message.id === messageId)) {
          return prev;
        }

        const optimisticIndex = clientMessageId
          ? prev.findIndex((message) => message.id === clientMessageId)
          : -1;

        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = {
            ...updated[optimisticIndex],
            id: messageId,
            clientMessageId,
            timestamp: data.timestamp || updated[optimisticIndex].timestamp,
          };
          return updated;
        }

        return [
          ...prev,
          {
            id: messageId,
            clientMessageId,
            sender: senderName,
            senderAvatar,
            role: senderName === currentUser?.name ? 'interviewer' : 'candidate',
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ];
      });
    };

    on('chat:message', handleIncomingMessage);
    return () => off('chat:message', handleIncomingMessage);
  }, [currentUser?.name, roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentUser?.id) return;

    const content = input.trim();
    const optimisticId = `local-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        clientMessageId: optimisticId,
        sender: currentUser.name,
        senderAvatar: currentUser.avatar,
        role: 'interviewer',
        content,
        timestamp: new Date().toISOString(),
      },
    ]);

    setInput('');

    const sendViaApi = async () => {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            roomId,
            sender: currentUser.id,
            content,
            type: 'text',
          }),
        });

        if (!response.ok) {
          throw new Error('API send failed');
        }

        const data = await response.json();
        const persistedId = data?.message?._id ? String(data.message._id) : optimisticId;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === optimisticId
              ? {
                  ...message,
                  id: persistedId,
                  timestamp: data?.message?.timestamp || message.timestamp,
                }
              : message
          )
        );
      } catch (error) {
        console.error('[v0] Failed to send message:', error);
        setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
      }
    };

    const socket = getSocket() || initSocket();

    if (socket?.connected) {
      socket.timeout(10000).emit(
        'chat:message',
        {
          roomId,
          content,
          clientMessageId: optimisticId,
          sender: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
          },
        },
        (error: any, response: any) => {
          if (error || !response?.success) {
            void sendViaApi();
          }
        }
      );
      return;
    }

    await sendViaApi();
  };

  const formatTime = (dateValue: string) => {
    return new Date(dateValue).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="glass-dark border-border h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-4 py-2 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id}>
            {message.role === 'system' ? (
              <div className="flex justify-center py-2">
                <p className="interactive-chip text-xs text-muted-foreground px-3 py-1 rounded-full">
                  {message.content}
                </p>
              </div>
            ) : (
              <div
                className={`flex gap-2 items-start min-w-0 ${
                  message.role === 'interviewer' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  {message.senderAvatar ? (
                    <img src={message.senderAvatar} alt={`${message.sender} avatar`} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {message.sender.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div
                  className={`flex-1 min-w-0 flex flex-col ${
                    message.role === 'interviewer' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{message.sender}</span>
                    <span className="ml-2">{formatTime(message.timestamp)}</span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg w-fit max-w-[85%] sm:max-w-xs break-words ${
                      message.role === 'interviewer'
                        ? 'bg-primary/20 text-foreground border border-primary/30'
                        : 'interactive-chip text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 space-y-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          className="bg-input border-border text-foreground placeholder:text-muted-foreground text-sm"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!input.trim() || !currentUser?.id}
          size="sm"
          className="w-full gap-2 bg-gradient-primary"
        >
          <Send className="w-4 h-4" />
          Send
        </Button>
      </div>
    </Card>
  );
}
