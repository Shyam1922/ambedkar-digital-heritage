import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PORTRAIT = '/assets/ambedkar-portrait.png';

export function Home() {
  return (
    <section className="attract-screen">
      <div className="attract-portrait" style={{ backgroundImage: `url(${PORTRAIT})` }} role="img" aria-label="Archival portrait of Dr. B. R. Ambedkar" />
      <div className="attract-copy">
        <h1>Educate. Agitate. Organize.</h1>
        <p>Enter the life, writings, speeches, and constitutional legacy of Dr. B. R. Ambedkar.</p>
        <Link to="/timeline" className="discovery-button">Begin discovery <ArrowRight aria-hidden="true" /></Link>
      </div>
      <span className="attract-caption">Dr. B. R. Ambedkar · Digital Heritage Collection</span>
      <span className="attract-watermark">1891—1956</span>
    </section>
  );
}
