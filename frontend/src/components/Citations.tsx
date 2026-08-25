import { Link } from 'react-router-dom'
import type { Citation } from '../lib/api'
export function Citations({sources}:{sources:Citation[]}) { return <section className="sources"><h3>Archive sources</h3>{sources.map((source,index)=><Link className="source" key={`${source.archive_id}-${index}`} to={source.detail_url}><b>{index+1}. {source.title}</b><span>{source.archive_id} · {source.source}{source.page_number ? ` · p. ${source.page_number}`:''}</span><p>{source.excerpt}</p></Link>)}</section> }
