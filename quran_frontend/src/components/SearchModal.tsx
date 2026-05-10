"use client";

import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Surah, Ayah } from "@/src/lib/types";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  surahs?: Surah[];
  currentSurahNumber?: number;
  currentAyahs?: Ayah[];
  isDark?: boolean;
}

interface AyahSearchItem {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  translation: string;
}

type SearchResult =
  | { type: "surah"; surah: Surah }
  | { type: "ayah"; item: AyahSearchItem };

export function SearchModal({
  open,
  onClose,
  surahs = [],
  currentSurahNumber,
  currentAyahs = [],
  isDark = false,
}: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const currentSurahName = useMemo(
    () => surahs.find((s) => s.number === currentSurahNumber)?.englishName ?? "",
    [surahs, currentSurahNumber]
  );

  // Fuse index for surah name search (instant)
  const surahFuse = useMemo(
    () =>
      new Fuse(surahs, {
        keys: ["englishName", "name", "englishNameTranslation"],
        includeScore: true,
        threshold: 0.35,
      }),
    [surahs]
  );

  // Fuse index for ayah translation search (current surah – instant)
  const ayahItems = useMemo<AyahSearchItem[]>(
    () =>
      currentAyahs.map((ayah) => ({
        surahNumber: currentSurahNumber ?? 0,
        surahName: currentSurahName,
        ayahNumber: ayah.numberInSurah,
        translation: ayah.translation,
      })),
    [currentAyahs, currentSurahNumber, currentSurahName]
  );

  const ayahFuse = useMemo(
    () =>
      new Fuse(ayahItems, {
        keys: ["translation"],
        includeScore: true,
        threshold: 0.35,
      }),
    [ayahItems]
  );

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const surahResults: SearchResult[] = surahFuse
      .search(query)
      .slice(0, 10)
      .map((entry) => ({ type: "surah" as const, surah: entry.item }));

    const ayahResults: SearchResult[] = ayahFuse
      .search(query)
      .slice(0, 30)
      .map((entry) => ({ type: "ayah" as const, item: entry.item }));

    return [...surahResults, ...ayahResults];
  }, [surahFuse, ayahFuse, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 md:p-8">
      <div
        className={`w-full max-w-4xl rounded-2xl border ${
          isDark ? "border-zinc-800 bg-dark-sidebar" : "border-zinc-200 bg-white"
        }`}
      >
        {/* Search input */}
        <div
          className={`flex items-center gap-2 border-b p-4 ${
            isDark ? "border-zinc-800" : "border-zinc-200"
          }`}
        >
          <Search size={18} className="text-zinc-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search surahs or ayah translations…"
            className={`flex-1 bg-transparent outline-none ${
              isDark
                ? "text-zinc-100 placeholder:text-zinc-500"
                : "text-zinc-900 placeholder:text-zinc-400"
            }`}
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className={`rounded-md p-2 ${
              isDark
                ? "text-zinc-300 hover:bg-zinc-800"
                : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[70vh] overflow-y-auto p-3">
          {results.length === 0 ? (
            <p
              className={`px-2 py-4 text-sm ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              {query
                ? "No results found."
                : "Search by surah name, or search translations in the current surah."}
            </p>
          ) : (
            results.map((result, index) => {
              if (result.type === "surah") {
                const s = result.surah;
                return (
                  <button
                    key={`surah-${s.number}-${index}`}
                    onClick={() => {
                      router.push(`/surah/${s.number}`);
                      onClose();
                    }}
                    className={`mb-1 w-full rounded-lg border border-transparent p-3 text-left ${
                      isDark
                        ? "hover:border-zinc-700 hover:bg-zinc-900"
                        : "hover:border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                        Surah
                      </span>
                      <p
                        className={`text-sm font-semibold ${
                          isDark ? "text-zinc-100" : "text-zinc-900"
                        }`}
                      >
                        {s.number}. {s.englishName}
                      </p>
                    </div>
                    <p
                      className={`mt-1 text-sm ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {s.englishNameTranslation} · {s.numberOfAyahs} Ayahs ·{" "}
                      {s.revelationType}
                    </p>
                  </button>
                );
              }

              const a = result.item;
              return (
                <button
                  key={`ayah-${a.surahNumber}-${a.ayahNumber}-${index}`}
                  onClick={() => {
                    router.push(`/surah/${a.surahNumber}?ayah=${a.ayahNumber}`);
                    onClose();
                  }}
                  className={`mb-1 w-full rounded-lg border border-transparent p-3 text-left ${
                    isDark
                      ? "hover:border-zinc-700 hover:bg-zinc-900"
                      : "hover:border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}
                  >
                    {a.surahName} – Ayah {a.ayahNumber}
                  </p>
                  <p
                    className={`mt-1 line-clamp-2 text-sm ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {a.translation}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
