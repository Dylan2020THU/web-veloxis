import { useRef, useState } from "react";
import { motion as m } from "framer-motion";
import type { Sport } from "../data/sports";
import type { PanelMotion } from "../lib/panelMotion";

type SportPanelProps = {
  sport: Sport;
  className?: string;
  motionState: PanelMotion;
  isActive: boolean;
  onHoverStart: () => void;
};

/** public/ 下的资源路径 → 带 BASE_URL 的完整 URL（适配 /industry/ 子路径部署） */
function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

const mediaEffectClasses = [
  "absolute inset-0 h-full w-full object-cover",
  "brightness-[0.42] grayscale transition-[filter] duration-700 ease-out",
  "group-hover:brightness-100 group-hover:grayscale-0",
  "group-focus-within:brightness-100 group-focus-within:grayscale-0",
].join(" ");

const springTransition = {
  type: "spring" as const,
  stiffness: 360,
  damping: 30,
  mass: 0.82,
};

/**
 * Porsche-style sport card: 2-up grid cell, hover to activate zoom + reveal detail.
 * Parent drives scale/translate so neighbors yield space with a springy feel.
 */
export function SportPanel({
  sport,
  className,
  motionState,
  isActive,
  onHoverStart,
}: SportPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoVisible, setVideoVisible] = useState(false);

  const showVideo = () => {
    setVideoVisible(true);
    const v = videoRef.current;
    if (!v) return;
    void v.play().catch(() => {});
  };

  const hideVideo = () => {
    setVideoVisible(false);
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  const handleEnter = () => {
    onHoverStart();
    if (sport.video) showVideo();
  };

  const handleLeave = () => {
    if (sport.video) hideVideo();
  };

  return (
    <m.article
      layout={false}
      animate={{
        x: motionState.x,
        y: motionState.y,
        scale: motionState.scale,
      }}
      transition={springTransition}
      style={{ zIndex: motionState.zIndex }}
      className={[
        "group veloxis-shape relative isolate min-h-[320px] cursor-pointer overflow-hidden",
        className,
        "h-[min(420px,52vw)] origin-center will-change-transform",
        isActive
          ? "shadow-[0_28px_56px_-16px_rgba(6,126,253,0.35)]"
          : "shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)]",
      ].join(" ")}
      tabIndex={0}
      aria-label={`${sport.name} — ${sport.description}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {sport.video ? (
        <>
          <div
            className={[mediaEffectClasses, "bg-cover bg-center"].join(" ")}
            style={{ backgroundImage: `url(${sport.image})` }}
            aria-hidden
          />
          <video
            ref={videoRef}
            className={[
              mediaEffectClasses,
              "transition-opacity duration-300",
              videoVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
            src={publicAsset(sport.video)}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        </>
      ) : (
        <div
          className={[mediaEffectClasses, "bg-cover bg-center"].join(" ")}
          style={{ backgroundImage: `url(${sport.image})` }}
          aria-hidden
        />
      )}

      <div
        className={[
          "absolute inset-0 bg-black/50 transition-[background] duration-500",
          "group-hover:bg-[linear-gradient(to_top,rgba(6,126,253,0.96)_0%,rgba(6,126,253,0.38)_16%,rgba(0,0,0,0.12)_100%)]",
          "group-focus-within:bg-[linear-gradient(to_top,rgba(6,126,253,0.96)_0%,rgba(6,126,253,0.38)_16%,rgba(0,0,0,0.12)_100%)]",
        ].join(" ")}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-x-0 top-7 flex justify-center px-4 md:top-9">
        <h2
          className={[
            "text-center text-2xl font-bold tracking-wide text-white md:text-3xl lg:text-4xl",
            "transition-[transform,opacity] duration-500",
            "group-hover:-translate-y-1 group-focus-within:-translate-y-1",
          ].join(" ")}
        >
          {sport.name}
        </h2>
      </div>

      <div
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0 p-6 text-white md:p-8",
          "translate-y-3 opacity-0 transition-[transform,opacity] duration-500 ease-out",
          "group-hover:translate-y-0 group-hover:opacity-100",
          "group-focus-within:translate-y-0 group-focus-within:opacity-100",
        ].join(" ")}
      >
        <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-sm">
          {sport.tag}
        </span>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/75">
          {sport.nameEn}
        </p>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/92 md:text-[15px]">
          {sport.description}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold tracking-wider">
          探索解决方案
          <span aria-hidden className="text-lg">
            →
          </span>
        </span>
      </div>

      <div
        className={[
          "pointer-events-none absolute bottom-6 right-6 md:bottom-8 md:right-8",
          "scale-90 opacity-0 transition-[transform,opacity] duration-500",
          "group-hover:scale-100 group-hover:opacity-100",
          "group-focus-within:scale-100 group-focus-within:opacity-100",
        ].join(" ")}
        aria-hidden
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/10 text-lg backdrop-blur-sm">
          →
        </span>
      </div>
    </m.article>
  );
}
