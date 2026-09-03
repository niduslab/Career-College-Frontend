"use client";

import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  PictureInPicture2,
  Settings,
  Check,
  Maximize2,
  Minimize2,
  Gauge,
  Monitor,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { SPEEDS } from "./data";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CtrlBtn({
  onClick,
  children,
  className = "",
  title,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`text-white/80 hover:text-white transition-colors flex items-center justify-center disabled:opacity-30 disabled:hover:text-white/80 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export default function VideoPlayer({
  moduleLabel,
  src,
  startAtSeconds = 0,
  onProgress,
  onPrevLesson,
  onNextLesson,
  nextLocked = false,
}: {
  moduleLabel: string;
  src?: string;
  startAtSeconds?: number;

  onProgress?: (
    watchedSeconds: number,
    durationSeconds: number,
  ) => void | Promise<unknown>;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;

  nextLocked?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const volTrackRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [looping, setLooping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState<
    "main" | "speed" | "quality"
  >("main");
  const [showVolSlider, setShowVolSlider] = useState(false);
  const [levels, setLevels] = useState<{ index: number; height: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto

  const closeSettings = () => {
    setSettingsOpen(false);
    setSettingsMenu("main");
  };

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      )
        closeSettings();
    };
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, []);

  // Load the HLS source for the active lecture. No fallback clip — a
  // lecture with no video yet (still processing, or never uploaded) shows
  // the empty state below instead of a placeholder video.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;

    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Playback is authorized by the CloudFront-* signed cookies the
        // stream-URL endpoint set. Segment requests are cross-site, so they
        // only carry those cookies with credentials enabled — without this
        // CloudFront answers 403 and the browser reports it as a CORS error.
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
        },
      });
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        setLevels(
          data.levels.map((lvl, index) => ({ index, height: lvl.height })),
        );
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_evt, data) => {
        setCurrentLevel(data.level);
      });
      hls.loadSource(src);
      hls.attachMedia(v);
    } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = src;
    } else {
      v.src = src;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = levelIndex;
    closeSettings();
  };

  // Resume from the learner's last saved position once metadata is ready.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !startAtSeconds) return;
    const onLoaded = () => {
      v.currentTime = startAtSeconds;
    };
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, [src, startAtSeconds]);

  // Report progress periodically while playing.
  useEffect(() => {
    if (!onProgress) return;
    const id = setInterval(() => {
      const v = videoRef.current;
      if (!v || v.paused || !v.duration) return;
      onProgress(v.currentTime, v.duration);
    }, 5000);
    return () => clearInterval(id);
  }, [onProgress]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      setShowOverlay(false);
    } else {
      v.pause();
      setPlaying(false);
      setShowOverlay(true);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.volume = pct;
    setVolume(pct);
    v.muted = pct === 0;
    setMuted(pct === 0);
  };

  const skip = (sec: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(durationSec, v.currentTime + sec));
    setCurrentSec(v.currentTime);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !durationSec) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * durationSec;
    setCurrentSec(v.currentTime);
  };

  const changeSpeed = (s: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = s;
    setSpeed(s);
    closeSettings();
  };

  const toggleLoop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.loop = !v.loop;
    setLooping(v.loop);
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await v.requestPictureInPicture().catch(() => {});
  };

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const pct = durationSec > 0 ? (currentSec / durationSec) * 100 : 0;
  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  if (!src) {
    return (
      <div
        className="relative flex w-full items-center justify-center bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        <p className="px-6 text-center text-[14px] text-white/50">
          This lecture&apos;s video isn&apos;t ready yet.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full  bg-black group/player"
      style={{
        aspectRatio: "16/9",
        background:
          "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.024) 0px, rgba(255, 255, 255, 0.024) 14px, transparent 14px, transparent 28px)",
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        // Safari's native HLS path loads the playlist itself; it needs the
        // same credentialed requests hls.js gets via xhrSetup. Ignored on the
        // hls.js path, where the element's source is a blob: URL.
        crossOrigin="use-credentials"
        className="absolute inset-0 w-full h-full object-contain"
        onTimeUpdate={() =>
          videoRef.current && setCurrentSec(videoRef.current.currentTime)
        }
        onLoadedMetadata={() =>
          videoRef.current && setDurationSec(videoRef.current.duration)
        }
        onEnded={async () => {
          setPlaying(false);
          setShowOverlay(true);
          const v = videoRef.current;
          if (v && onProgress && v.duration) {
            try {
              await onProgress(v.duration, v.duration);
            } catch {}
          }
          onNextLesson?.();
        }}
        onPlay={() => {
          setPlaying(true);
          setShowOverlay(false);
        }}
        onPause={() => {
          setPlaying(false);
          setShowOverlay(true);
        }}
        muted={muted}
        preload="metadata"
      />

      {/* Lesson label */}
      {/* <div className="absolute top-2 sm:top-3 left-3 sm:left-4 z-10 flex items-center gap-2 pointer-events-none max-w-[calc(100%-1.5rem)] bg-black/60 backdrop-blur-sm rounded-full pl-2 pr-3 py-1">
        <span className="text-[12px] text-white font-medium truncate">
          {moduleLabel}
        </span>
      </div> */}

      {/* Centre overlay */}
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={togglePlay}
            className="w-12 h-12 cursor-pointer sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <Play className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-current ml-0.5 sm:ml-1" />
          </button>
        </div>
      )}
      {!showOverlay && (
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={togglePlay}
        />
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-4 pt-6 pb-2.5 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/player:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
        {/* Seek bar */}
        <div
          className="w-full h-1 rounded-full bg-white/30 mb-3 cursor-pointer group/seek"
          onClick={handleSeek}
        >
          <div
            className="h-1 rounded-full bg-(--primary-500) relative transition-none"
            style={{ width: `${pct}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow scale-0 group-hover/seek:scale-100 transition-transform" />
          </div>
        </div>

        {/* Buttons row */}
        <div className="flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-1 sm:gap-2">
            <CtrlBtn
              onClick={onPrevLesson}
              disabled={!onPrevLesson}
              title="Previous lesson"
              className="cursor-pointer"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </CtrlBtn>

            <CtrlBtn
              onClick={() => skip(-10)}
              title="Rewind 10s"
              className="hidden sm:flex cursor-pointer"
            >
              <div className="relative">
                <RotateCcw className="w-4 h-4" />
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold mt-0.5">
                  10
                </span>
              </div>
            </CtrlBtn>

            <CtrlBtn
              onClick={togglePlay}
              title={playing ? "Pause" : "Play"}
              className="cursor-pointer"
            >
              {playing ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              )}
            </CtrlBtn>

            <CtrlBtn
              onClick={() => skip(10)}
              title="Forward 10s"
              className="hidden sm:flex cursor-pointer"
            >
              <div className="relative">
                <RotateCw className="w-4 h-4" />
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold mt-0.5">
                  10
                </span>
              </div>
            </CtrlBtn>

            <CtrlBtn
              onClick={onNextLesson}
              disabled={!onNextLesson || nextLocked}
              title={
                nextLocked
                  ? "Complete this lesson to unlock the next one"
                  : "Next lesson"
              }
              className="cursor-pointer"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </CtrlBtn>

            {/* Volume */}
            <div
              className="flex items-center gap-1.5"
              onMouseEnter={() => setShowVolSlider(true)}
              onMouseLeave={() => setShowVolSlider(false)}
            >
              <CtrlBtn
                onClick={toggleMute}
                title={muted ? "Unmute" : "Mute"}
                className="cursor-pointer"
              >
                <VolumeIcon className="w-4 h-4" />
              </CtrlBtn>
              <div
                className={`overflow-hidden transition-all duration-200 ${showVolSlider ? "w-16 sm:w-20 opacity-100" : "w-0 opacity-0"}`}
              >
                <div
                  ref={volTrackRef}
                  className="w-full h-1 rounded-full bg-white/30 cursor-pointer"
                  onClick={handleVolumeChange}
                >
                  <div
                    className="h-1 rounded-full bg-white"
                    style={{ width: `${muted ? 0 : volume * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Time */}
            <span className="text-[11px] sm:text-[12px] text-white/80 tabular-nums whitespace-nowrap ml-1">
              {fmt(currentSec)} / {fmt(durationSec)}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            <CtrlBtn
              onClick={toggleLoop}
              title="Loop"
              className={`hidden cursor-pointer sm:flex ${looping ? "text-white" : ""}`}
            >
              <Repeat className="w-4 h-4" />
            </CtrlBtn>

            <CtrlBtn
              onClick={togglePiP}
              title="Picture in Picture"
              className="hidden cursor-pointer sm:flex"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </CtrlBtn>

            {/* Settings */}
            <div ref={settingsRef} className="relative ">
              <CtrlBtn
                onClick={() => {
                  setSettingsOpen((v) => !v);
                  setSettingsMenu("main");
                }}
                title="Settings"
                className={`cursor-pointer ${settingsOpen ? "text-white" : ""}`}
              >
                <Settings className="w-4 h-4" />
              </CtrlBtn>
              {settingsOpen && (
                <div className="absolute bottom-8 right-0 bg-black/90 backdrop-blur-sm rounded-xl border border-white/10 py-1.5 w-44 z-30">
                  {settingsMenu === "main" && (
                    <>
                      <button
                        onClick={() => setSettingsMenu("speed")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Gauge className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left">Playback speed</span>
                        <span className="text-white/40">
                          {speed === 1 ? "Normal" : `${speed}×`}
                        </span>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      </button>
                      {levels.length > 0 && (
                        <button
                          onClick={() => setSettingsMenu("quality")}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Monitor className="w-4 h-4 shrink-0" />
                          <span className="flex-1 text-left">Resolution</span>
                          <span className="text-white/40">
                            {currentLevel === -1
                              ? "Auto"
                              : `${levels.find((l) => l.index === currentLevel)?.height ?? ""}p`}
                          </span>
                          <ChevronRightIcon className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        </button>
                      )}
                    </>
                  )}

                  {settingsMenu === "speed" && (
                    <>
                      <button
                        onClick={() => setSettingsMenu("main")}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10 mb-1"
                      >
                        <ChevronLeftIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold">Playback speed</span>
                      </button>
                      {SPEEDS.map((s) => (
                        <button
                          key={s}
                          onClick={() => changeSpeed(s)}
                          className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <span>{s === 1 ? "Normal" : `${s}×`}</span>
                          {speed === s && (
                            <Check className="w-3.5 h-3.5 text-(--primary-400)" />
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {settingsMenu === "quality" && (
                    <>
                      <button
                        onClick={() => setSettingsMenu("main")}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10 mb-1"
                      >
                        <ChevronLeftIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold">Resolution</span>
                      </button>
                      <button
                        onClick={() => changeQuality(-1)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <span>Auto</span>
                        {currentLevel === -1 && (
                          <Check className="w-3.5 h-3.5 text-(--primary-400)" />
                        )}
                      </button>
                      {levels
                        .slice()
                        .sort((a, b) => b.height - a.height)
                        .map((lvl) => (
                          <button
                            key={lvl.index}
                            onClick={() => changeQuality(lvl.index)}
                            className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <span>{lvl.height}p</span>
                            {currentLevel === lvl.index && (
                              <Check className="w-3.5 h-3.5 text-(--primary-400)" />
                            )}
                          </button>
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <CtrlBtn
              className="cursor-pointer"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </CtrlBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
