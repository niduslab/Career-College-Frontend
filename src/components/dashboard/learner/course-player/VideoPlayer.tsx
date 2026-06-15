"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { ACTIVE_LESSON, SPEEDS, VIDEO_SRC } from "./data";

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
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`text-white/80 hover:text-white transition-colors flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  );
}

export default function VideoPlayer({ moduleLabel }: { moduleLabel: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const volTrackRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

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
  const [showVolSlider, setShowVolSlider] = useState(false);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      )
        setSettingsOpen(false);
    };
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
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
    setSettingsOpen(false);
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
        className="absolute inset-0 w-full h-full object-contain"
        onTimeUpdate={() =>
          videoRef.current && setCurrentSec(videoRef.current.currentTime)
        }
        onLoadedMetadata={() =>
          videoRef.current && setDurationSec(videoRef.current.duration)
        }
        onEnded={() => {
          setPlaying(false);
          setShowOverlay(true);
        }}
        muted={muted}
        preload="metadata"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Lesson label */}
      <div className="absolute top-2 sm:top-3 left-3 sm:left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span className="text-[12px]  text-white/80 font-medium truncate drop-shadow">
          {moduleLabel}
        </span>
      </div>

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
              onClick={() => {}}
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
              onClick={() => {}}
              title="Next lesson"
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
              {fmt(currentSec)} /{" "}
              {durationSec > 0 ? fmt(durationSec) : ACTIVE_LESSON.duration}
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
                onClick={() => setSettingsOpen((v) => !v)}
                title="Settings"
                className={`cursor-pointer ${settingsOpen ? "text-white" : ""}`}
              >
                <Settings className="w-4 h-4" />
              </CtrlBtn>
              {settingsOpen && (
                <div className="absolute bottom-8 right-0 bg-black/90 backdrop-blur-sm rounded-xl border border-white/10 py-2 w-40 z-30">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest px-3 pb-1.5">
                    Playback speed
                  </p>
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
