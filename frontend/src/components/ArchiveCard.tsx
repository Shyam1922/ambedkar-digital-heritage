import { Link } from 'react-router-dom'
import type { Item } from '../lib/api'
export function ArchiveCard({item}:{item:Item}) { return <Link to={`/archive/${item.archive_id}`} className="archive-card"><div className="card-top"><span className="badge">{item.type}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.description}</p><small>{item.source}</small>{item.verification_status !== 'VERIFIED' && <em className="demo-label">{item.verification_status}</em>}</Link> }
