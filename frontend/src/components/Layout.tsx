import { Link, NavLink } from 'react-router-dom'
import { Landmark } from 'lucide-react'
import type { ReactNode } from 'react'
export function Layout({children}:{children:ReactNode}) { return <><header><Link className="brand" to="/"><Landmark size={25}/><span>Ambedkar <i>Archive</i></span></Link><nav><NavLink to="/archive">Archive</NavLink><NavLink to="/timeline">Timeline</NavLink><NavLink to="/research">Research</NavLink></nav></header><main>{children}</main><footer>Dr. B. R. Ambedkar Digital Heritage Archive · Base MVP · Source-linked research</footer></> }
