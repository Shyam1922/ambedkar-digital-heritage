import { request } from './client';
import type { ArchiveItem, ArchiveListResponse, DocumentPage } from './types';

export async function listArchiveItems(query: string = '', type: string = ''): Promise<ArchiveListResponse> {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  if (type.trim()) params.set('type', type.trim());
  
  const queryString = params.toString();
  const endpoint = queryString ? `/archive?${queryString}` : '/archive';
  return request<ArchiveListResponse>(endpoint);
}

export async function getArchiveItem(archiveId: string): Promise<ArchiveItem> {
  return request<ArchiveItem>(`/archive/${encodeURIComponent(archiveId)}`);
}

export async function getDocumentPage(archiveId: string, pageNumber: number): Promise<DocumentPage> {
  return request<DocumentPage>(`/archive/${encodeURIComponent(archiveId)}/pages/${pageNumber}`);
}
