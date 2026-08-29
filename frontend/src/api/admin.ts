import { request } from './client';
import type {
  AdminArchiveUpdate,
  AdminDeleteResponse,
  AdminUploadPayload,
  AdminUser,
  ArchiveItem,
  TokenResponse,
} from './types';

export async function adminLogin(username: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getAdminMe(): Promise<AdminUser> {
  return request<AdminUser>('/admin/me', { auth: true });
}

export async function listAdminArchive(): Promise<ArchiveItem[]> {
  return request<ArchiveItem[]>('/admin/archive', { auth: true });
}

export async function getAdminArchiveItem(archiveId: string): Promise<ArchiveItem> {
  return request<ArchiveItem>(`/admin/archive/${encodeURIComponent(archiveId)}`, { auth: true });
}

export async function createAdminArchive(payload: AdminUploadPayload): Promise<ArchiveItem> {
  const form = new FormData();
  form.set('archive_id', payload.archive_id);
  form.set('title', payload.title);
  form.set('description', payload.description);
  form.set('document_type', payload.type);
  form.set('date', payload.date);
  form.set('author_speaker', payload.author_speaker);
  if (payload.language) form.set('language', payload.language);
  form.set('source', payload.source);
  if (payload.source_url) form.set('source_url', payload.source_url);
  if (payload.tags) form.set('tags', payload.tags);
  if (payload.content_start_page != null) {
    form.set('content_start_page', String(payload.content_start_page));
  }
  form.set('file', payload.file);

  return request<ArchiveItem>('/admin/archive', {
    method: 'POST',
    body: form,
    auth: true,
  });
}

export async function updateAdminArchive(archiveId: string, update: AdminArchiveUpdate): Promise<ArchiveItem> {
  return request<ArchiveItem>(`/admin/archive/${encodeURIComponent(archiveId)}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
    auth: true,
  });
}

export async function deleteAdminArchive(archiveId: string): Promise<AdminDeleteResponse> {
  return request<AdminDeleteResponse>(`/admin/archive/${encodeURIComponent(archiveId)}`, {
    method: 'DELETE',
    auth: true,
  });
}
