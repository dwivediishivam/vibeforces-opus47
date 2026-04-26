"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VoicePlayer({
  src,
  playsAllowed = 1,
}: {
  src: string;
  playsAllowed?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [plays, setPlays] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const remainingPlays = Math.max(0, playsAllowed - plays);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setPlays((count) => count + 1);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const label = useMemo(() => {
    if (remainingPlays <= 0) return "Voice note played. You may not replay.";
    if (playsAllowed > 1) return `Listen carefully — ${remainingPlays} play${remainingPlays > 1 ? "s" : ""} remaining`;
    return "Listen carefully — one play only";
  }, [playsAllowed, remainingPlays]);

  return (
    <div className="surface-card rounded-2xl p-6">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          disabled={remainingPlays <= 0 || isPlaying}
          className="size-14 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9]"
          onClick={() => {
            if (!audioRef.current || remainingPlays <= 0) return;
            audioRef.current.currentTime = 0;
            void audioRef.current.play();
            setCurrentTime(0);
            setIsPlaying(true);
          }}
        >
          {remainingPlays <= 0 ? (
            <Check className="size-6" />
          ) : (
            <Play className="size-6" />
          )}
        </Button>
        <div className="flex-1">
          <div className="mb-2 h-1 overflow-hidden rounded-full bg-[#1e293b]">
            <div
              className="h-full rounded-full bg-[#7c3aed] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm font-mono-ui text-[#94a3b8]">
            <span>{label}</span>
            <span>
              {Math.floor(currentTime)}s / {Math.floor(duration || 0)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
