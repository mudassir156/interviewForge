'use client';

import { use } from 'react';
import { LiveRoom } from '@/components/interview/live-room';

export default function InterviewPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);

  return <LiveRoom roomId={roomId} />;
}
