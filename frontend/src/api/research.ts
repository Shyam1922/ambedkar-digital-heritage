import { request } from './client';
import type { Citation, ResearchResponse, SearchResult } from './types';

export async function searchArchive(query: string, limit: number = 6): Promise<SearchResult[]> {
  return request<SearchResult[]>('/search', {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  });
}

export async function askArchive(query: string, limit: number = 5): Promise<ResearchResponse> {
  return request<ResearchResponse>('/research', {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  });
}

export async function askDocument(archiveId: string, query: string, limit: number = 5): Promise<ResearchResponse> {
  return request<ResearchResponse>(`/research/document/${encodeURIComponent(archiveId)}`, {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  });
}
