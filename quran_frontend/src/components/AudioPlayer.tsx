'use client';

import { Loader2, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAyahAudioUrl } from "@/src/lib/api";

interface AudioPlayerProps {
  ayahNumber: number;
  onPlay?: (ayahNumber: number) => void;
  onPause?: () => void;
  isDark?: boolean;
}

let currentAudio: HTMLAudioElement | null = null;
let activeAyahNumber: number | null = null;

export function AudioPlayer({
  ayahNumber,
  onPlay,
  onPause,
  isDark = false,
}: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerEventName = "quran-active-audio-change";

  const onAudioEnded = useCallback(() => {
    setIsPlaying(false);
    if (activeAyahNumber === ayahNumber) {
      activeAyahNumber = null;
      window.dispatchEvent(
        new CustomEvent(playerEventName, { detail: { ayahNumber: null } })
      );
    }
    onPause?.();
  }, [ayahNumber, onPause]);

  const handleTogglePlay = async () => {
    try {
      setIsLoading(true);

      if (currentAudio && currentAudio !== audioRef.current) {
        currentAudio.pause();
      }

      if (!audioRef.current) {
        const audio = new Audio(getAyahAudioUrl(ayahNumber));
        audio.preload = "none";
        audio.addEventListener("ended", onAudioEnded);
        audioRef.current = audio;
      }
      currentAudio = audioRef.current;

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (activeAyahNumber === ayahNumber) {
          activeAyahNumber = null;
          window.dispatchEvent(
            new CustomEvent(playerEventName, { detail: { ayahNumber: null } })
          );
        }
        onPause?.();
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        activeAyahNumber = ayahNumber;
        window.dispatchEvent(
          new CustomEvent(playerEventName, { detail: { ayahNumber } })
        );
        onPlay?.(ayahNumber);
      }
    } catch (error) {
      console.error("Error playing ayah audio:", error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleActiveAudioChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ ayahNumber: number | null }>;
      const nextAyah = customEvent.detail?.ayahNumber ?? null;
      if (nextAyah !== ayahNumber && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener(playerEventName, handleActiveAudioChange);
    return () => {
      window.removeEventListener(playerEventName, handleActiveAudioChange);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", onAudioEnded);
      }
      if (activeAyahNumber === ayahNumber) {
        activeAyahNumber = null;
      }
    };
  }, [ayahNumber, isPlaying, onAudioEnded]);

  return (
    <button
      onClick={handleTogglePlay}
      disabled={isLoading}
      className={`rounded-lg border p-2 transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isDark
          ? "border-zinc-700 text-zinc-200 hover:border-primary hover:text-white"
          : "border-zinc-200 text-zinc-600 hover:border-primary hover:text-primary"
      }`}
      aria-label="Play audio"
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isPlaying ? (
        <Pause size={18} />
      ) : (
        <Play size={18} />
      )}
    </button>
  );
}
