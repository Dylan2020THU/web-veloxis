import type { Sport } from "../data/sports";

import { useRef, useState } from "react";

type SportPanelProps = { sport: Sport; index: number; onSelect: () => void };

export function SportPanel({ sport, index, onSelect }: SportPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef(false);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);

  function activate() {
    activeRef.current = true;
    setActive(true);
    void videoRef.current?.play().catch(() => {
      // Keep the highlighted poster visible when autoplay is unavailable.
    });
  }

  function deactivate() {
    activeRef.current = false;
    setActive(false);
    setPlaying(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      if (video.readyState > 0) video.currentTime = 0;
    }
  }

  return (
    <article
      className={`sport-card sport-card-${sport.id}${active ? " is-active" : ""}`}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
    >
      <img src={`${import.meta.env.BASE_URL}${sport.image}`} alt={`${sport.name}运动场景`} loading="lazy" width="720" height="1280" />
      {sport.video && (
        <video
          ref={videoRef}
          className={playing ? "is-playing" : ""}
          src={`${import.meta.env.BASE_URL}${sport.video}`}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onPlaying={() => {
            if (activeRef.current) setPlaying(true);
            else videoRef.current?.pause();
          }}
        />
      )}
      <div className="sport-card-shade" />
      <div className="sport-card-top"><span>{String(index + 1).padStart(2, "0")}</span></div>
      <h3 className="sport-card-title">{sport.appName}<span className="sport-card-sport">{sport.name}</span></h3>
      <div className="sport-card-copy"><span>{sport.nameEn.toUpperCase()}</span><p>{sport.tag}</p></div>
      <button className="sport-card-button" onClick={() => { deactivate(); onSelect(); }} aria-label={`打开产品：${sport.appName}`}>
        打开产品
      </button>
    </article>
  );
}
