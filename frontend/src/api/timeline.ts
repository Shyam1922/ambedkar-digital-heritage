import { request } from './client';
import type { TimelineEvent } from './types';

export async function listTimelineEvents(): Promise<TimelineEvent[]> {
  return request<TimelineEvent[]>('/timeline');
}

export async function getTimelineEvent(eventId: string): Promise<TimelineEvent> {
  return request<TimelineEvent>(`/timeline/${encodeURIComponent(eventId)}`);
}
