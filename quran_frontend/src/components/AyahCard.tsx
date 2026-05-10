'use client';

import { Bookmark, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Ayah, FontSettings } from "@/src/lib/types";
import { AudioPlayer } from "./AudioPlayer";

interface AyahCardProps {
  ayah: Ayah;
  surahNumber: number;
  fontSettings: FontSettings;
  isDark?: boolean;
}

export function AyahCard({
  ayah,
  surahNumber,
  fontSettings,
  isDark = false,
}: AyahCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const arabicFontFamily = (() => {
    switch (fontSettings.arabicFontFace) {
      case "Amiri":
        return "var(--font-amiri), serif";
      case "Scheherazade New":
        return "var(--font-scheherazade), serif";
      default:
        return '"KFGQ", serif';
    }
  })();

  const arabicFontWeight = (() => {
    switch (fontSettings.arabicFontFace) {
      case "Amiri":
        return 400;
      case "Scheherazade New":
        return 500;
      default:
        return 600;
    }
  })();

  const arabicLetterSpacing = fontSettings.arabicFontFace === "Scheherazade New" ? "0.01em" : "0em";

  return (
    <article className={`border-b py-8 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
      <div className="flex items-start gap-5">
        <div className="flex min-w-[72px] flex-col items-center gap-2">
          <span className="text-sm font-semibold text-primary">
            {surahNumber}:{ayah.numberInSurah}
          </span>
          <AudioPlayer ayahNumber={ayah.number} isDark={isDark} />
          <button
            onClick={() => setIsBookmarked((value) => !value)}
            aria-label="Bookmark ayah"
            className={`rounded-md border p-2 transition ${
              isBookmarked
                ? "border-primary text-primary"
                : isDark
                  ? "border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Bookmark size={16} />
          </button>
          <button
            aria-label="Ayah menu"
            className={`rounded-md border p-2 transition ${
              isDark
                ? "border-zinc-700 text-zinc-400 hover:text-zinc-200"
                : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className="flex-1">
          <p
            className={`text-right leading-[2.1] ${
              isDark ? "text-zinc-100" : "text-zinc-900"
            }`}
            style={{
              fontSize: `${fontSettings.arabicFontSize}px`,
              fontFamily: arabicFontFamily,
              fontWeight: arabicFontWeight,
              letterSpacing: arabicLetterSpacing,
            }}
          >
            {ayah.text}
          </p>
          {fontSettings.showTranslation && (
            <div className="mt-6">
              <p
                className={`text-[11px] uppercase tracking-[0.18em] ${
                  isDark ? "text-zinc-500" : "text-zinc-500"
                }`}
              >
                SAHEEH INTERNATIONAL
              </p>
              <p
                className={`mt-2 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
                style={{ fontSize: `${fontSettings.translationFontSize}px` }}
              >
                {ayah.translation}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
