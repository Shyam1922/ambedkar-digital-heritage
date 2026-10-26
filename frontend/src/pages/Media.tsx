import { useState } from 'react';
import { Captions, MoreVertical, Pause, Play, RotateCcw, RotateCw, Volume2 } from 'lucide-react';

const SPEECH = '/assets/ambedkar-assembly-speech.png';

export function Media() {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="media-viewer-page">
      <div className="media-primary">
        <div className="media-image"><img src={SPEECH} alt="Dr. B. R. Ambedkar addressing an assembly" /><div className="media-image-tools"><Volume2 /><Captions /><MoreVertical /></div></div>
        <article className="media-details">
          <div className="media-badges"><span>Audio archive</span><span>Authenticated</span></div>
          <h1>Speech at the Constituent Assembly</h1>
          <p>Dr. B. R. Ambedkar <i aria-hidden="true">·</i> November 25, 1949</p>
          <div className="waveform" aria-label="Playback position 12 minutes 45 seconds of 38 minutes 12 seconds"><span /></div>
          <div className="media-times"><span>12:45</span><span>38:12</span></div>
          <div className="media-controls"><button aria-label="Volume"><Volume2 /></button><button aria-label="Closed captions"><Captions /></button><button aria-label="Go back 10 seconds"><RotateCcw /></button><button className="play-button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause /> : <Play />}</button><button aria-label="Go forward 10 seconds"><RotateCw /></button><button aria-label="More options"><MoreVertical /></button></div>
        </article>
      </div>
      <aside className="transcript-panel"><header><h2>Transcript</h2><span>Auto-synced</span></header><div className="transcript-body"><p>“I feel that the Constitution is workable, it is flexible and it is strong enough to hold the country together both in peacetime and in wartime.”</p><p className="active">“Indeed, if I may say so, if things go wrong under the new Constitution, the reason will not be that we had a bad Constitution. What we will have to say is, that man was vile.”</p><p>“Political democracy cannot last unless there lies at the base of it social democracy.”</p><p>“What does social democracy mean? It means a way of life which recognizes liberty, equality and fraternity.”</p></div></aside>
    </section>
  );
}
