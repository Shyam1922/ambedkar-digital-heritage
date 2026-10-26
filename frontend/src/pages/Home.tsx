import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PORTRAIT = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDqbt5LK8Pqa1Wo5y2bf2Q6k7XC2uWtxrfjiBLlIyxMwExe_w0JhYwwB61yt0hm2rRGTgiYxN0yR1a40YrWNgsw4V4at3ym7jZy-OaIiwR7Jm2rMsolE1F2eMXih4ae4d-5QK5uykUkD_wSKkMLnSrIbrfGIA2vdXr77H5TXfizfBJpMl9gWoG5cxkl-us7T0aSvF2LR1U-ujpb_V5Fh9BKhqR4R0ncysHvr2snRKEc4QBemSbLFwp';

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
