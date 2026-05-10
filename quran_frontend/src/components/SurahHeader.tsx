"use client";

import { FontSettings, Surah } from "@/src/lib/types";

interface SurahHeaderProps {
  surah: Surah;
  isDark?: boolean;
  arabicFontFace: FontSettings["arabicFontFace"];
}

export function SurahHeader({
  surah,
  isDark = false,
  arabicFontFace,
}: SurahHeaderProps) {
  const arabicFontFamily = (() => {
    switch (arabicFontFace) {
      case "Amiri":
        return "var(--font-amiri), serif";
      case "Scheherazade New":
        return "var(--font-scheherazade), serif";
      default:
        return '"KFGQ", serif';
    }
  })();

  const arabicFontWeight = (() => {
    switch (arabicFontFace) {
      case "Amiri":
        return 400;
      case "Scheherazade New":
        return 500;
      default:
        return 600;
    }
  })();

  const arabicLetterSpacing = arabicFontFace === "Scheherazade New" ? "0.01em" : "0em";

  return (
    <div
      className={`border-b px-6 py-6 text-center ${
        isDark ? "border-zinc-800" : "border-zinc-200"
      }`}
    >
      <div className="mb-4 flex justify-center">
        <svg
          className={`h-16 w-20 ${isDark ? "text-primary/60" : "text-zinc-300"}`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 10 L80 35 L80 75 Q80 85 70 85 L30 85 Q20 85 20 75 L20 35 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
            opacity="0.2"
          />
          <path
            d="M50 10 L80 35 L80 75 Q80 85 70 85 L30 85 Q20 85 20 75 L20 35 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <rect x="35" y="45" width="30" height="25" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      <h1
        className={`text-4xl font-bold md:text-5xl ${
          isDark ? "text-zinc-100" : "text-zinc-900"
        }`}
      >
        {surah.englishName}
      </h1>
      <h2
        className="mt-2 text-4xl text-primary"
        style={{
          fontFamily: arabicFontFamily,
          fontWeight: arabicFontWeight,
          letterSpacing: arabicLetterSpacing,
        }}
      >
        {surah.name}
      </h2>
      <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
        Ayah {surah.numberOfAyahs} · {surah.revelationType === "Meccan" ? "Makkah" : "Madinah"}
      </p>
    </div>
  );
}
