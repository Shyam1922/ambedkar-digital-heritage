export type Item = { archive_id:string; title:string; description:string; type:string; date:string; author_speaker:string; language:string; source:string; source_url:string; tags:string[]; file_path:string; extracted_text:string; verification_status:string }
export type Citation = {archive_id:string; title:string; source:string; source_url:string; page_number?:number; excerpt:string; detail_url:string}
export type DocumentPage = {
  archive_id: string;
  title: string;
  page_number: number;
  total_pages: number;
  text: string;
}
export type Event = {event_id:string; date:string; title:string; description:string; image:string; verification_status:string; related_archive_items:Item[]}
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
async function request<T>(path:string, options?:RequestInit):Promise<T> { const response = await fetch(`${API}${path}`, {headers:{'Content-Type':'application/json'},...options}); if(!response.ok) throw new Error((await response.json().catch(()=>null))?.detail || 'The archive service is unavailable.'); return response.json() }

export const api = {
  archive: (q='',type='') =>
    request<{items:Item[],total:number}>(`/archive?q=${encodeURIComponent(q)}${type?`&type=${encodeURIComponent(type)}`:''}`),

  item: (id:string) =>
    request<Item>(`/archive/${id}`),

  page: (id: string, page: number) =>
    request<DocumentPage>(`/archive/${id}/pages/${page}`),

  timeline: () =>
    request<Event[]>('/timeline'),

  search: (query:string) =>
    request<{citation:Citation;score:number}[]>('/search',{
      method:'POST',
      body:JSON.stringify({query})
    }),

  research: (query:string,id?:string) =>
    request<{answer:string;sources:Citation[];mode:string;insufficient_information:boolean}>(
      id?`/research/document/${id}`:'/research',
      {
        method:'POST',
        body:JSON.stringify({query})
      }
    )
}
