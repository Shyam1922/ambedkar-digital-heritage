export interface ArchiveItem {
  archive_id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  author_speaker: string;
  language: string;
  source: string;
  source_url: string;
  tags: string[];
  file_path?: string;
  extracted_text?: string;
  verification_status: string;
  short_summary?: string;
}

export interface ArchiveListResponse {
  items: ArchiveItem[];
  total: number;
}

export interface DocumentPage {
  archive_id: string;
  title: string;
  page_number: number;
  total_pages: number;
  original_page_number: number | null;
  text: string;
}

export interface TimelineEvent {
  event_id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  verification_status: string;
  related_archive_items: ArchiveItem[];
}

export interface Citation {
  archive_id: string;
  title: string;
  source: string;
  source_url: string;
  page_number?: number | null;
  excerpt: string;
  detail_url: string;
}

export interface SearchResult {
  citation: Citation;
  score: number;
}

export interface ResearchRequest {
  query: string;
  limit?: number;
}

export interface ResearchResponse {
  answer: string;
  sources: Citation[];
  mode: string;
  insufficient_information: boolean;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
}

export interface AdminUser {
  id: number;
  username: string;
}

export interface AdminUploadPayload {
  archive_id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  author_speaker: string;
  language?: string;
  source: string;
  source_url?: string;
  tags?: string;
  content_start_page?: number;
  file: File;
}

export interface AdminDeleteResponse {
  message: string;
  archive_id: string;
}

export interface AdminArchiveUpdate {
  title?: string;
  description?: string;
  type?: string;
  date?: string;
  author_speaker?: string;
  language?: string;
  source?: string;
  source_url?: string;
  tags?: string;
  verification_status?: string;
}

