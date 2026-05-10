"use client";

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
  console.log("🎵 AudioPlayer rendered for ayah:", ayahNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerEventName = "quran-active-audio-change";

  const onAudioEnded = useCallback(() => {
    setIsPlaying(false);
    if (activeAyahNumber === ayahNumber) {
      activeAyahNumber = null;
      window.dispatchEvent(
        new CustomEvent(playerEventName, { detail: { ayahNumber: null } }),
      );
    }
    onPause?.();
  }, [ayahNumber, onPause]);

  const handleTogglePlay = async () => {
    console.log("1️⃣ Button clicked, ayahNumber:", ayahNumber);
    try {
      console.log("2️⃣ Setting loading state...");
      setIsLoading(true);

      if (currentAudio && currentAudio !== audioRef.current) {
        console.log("3️⃣ Pausing previous audio");
        currentAudio.pause();
      }

      if (!audioRef.current) {
        console.log("4️⃣ Creating new audio element, calling getAyahAudioUrl");
        const url = getAyahAudioUrl(ayahNumber);
        console.log("5️⃣ Generated URL:", url);
        const audio = new Audio(url);
        audio.preload = "none";
        audio.addEventListener("ended", onAudioEnded);
        audioRef.current = audio;
        console.log("6️⃣ Audio element created");
      }
      currentAudio = audioRef.current;

      if (isPlaying) {
        console.log("7️⃣ Audio is playing, pausing...");
        audioRef.current.pause();
        setIsPlaying(false);
        if (activeAyahNumber === ayahNumber) {
          activeAyahNumber = null;
          window.dispatchEvent(
            new CustomEvent(playerEventName, { detail: { ayahNumber: null } }),
          );
        }
        onPause?.();
      } else {
        console.log("8️⃣ Audio paused, playing...");
        await audioRef.current.play();
        console.log("9️⃣ Audio playing");
        setIsPlaying(true);
        activeAyahNumber = ayahNumber;
        window.dispatchEvent(
          new CustomEvent(playerEventName, { detail: { ayahNumber } }),
        );
        onPlay?.(ayahNumber);
      }
    } catch (error) {
      console.error("❌ Error playing ayah audio:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : String(error),
      );
      setIsPlaying(false);
    } finally {
      console.log("🔟 Finally - setting loading to false");
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
