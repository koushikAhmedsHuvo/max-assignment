'use client';

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Surah } from "@/src/lib/types";

interface SurahSidebarProps {
  surahs: Surah[];
  activeSurahId: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isDark?: boolean;
}

export function SurahSidebar({
  surahs,
  activeSurahId,
  mobileOpen = false,
  onCloseMobile,
  isDark = true,
}: SurahSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Surah" | "Juz" | "Page">("Surah");

  const filteredSurahs = useMemo(() => {
    if (!searchQuery) return surahs;
    return surahs.filter(
      (surah) =>
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name.includes(searchQuery) ||
        surah.number.toString().includes(searchQuery)
    );
  }, [surahs, searchQuery]);

  const sidebarClasses = `fixed top-12 z-40 h-[calc(100vh-48px)] w-[272px] border-r transition-transform md:left-14 md:top-16 md:h-[calc(100vh-64px)] md:translate-x-0 ${
    isDark ? "border-zinc-800 bg-dark-sidebar" : "border-zinc-200 bg-white"
  } ${
    mobileOpen ? "left-0 translate-x-0" : "-translate-x-full md:translate-x-0"
  }`;

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          aria-label="Close surah drawer"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}
      <aside className={`${sidebarClasses} flex flex-col`}>
        <div
          className={`flex items-center justify-between border-b p-3 md:hidden ${
            isDark ? "border-zinc-800" : "border-zinc-200"
          }`}
        >
          <h2
            className={`text-base font-semibold ${
              isDark ? "text-zinc-100" : "text-zinc-900"
            }`}
          >
            Surahs
          </h2>
          <button
            onClick={onCloseMobile}
            aria-label="Close drawer"
            className={`rounded-md p-1.5 ${
              isDark
                ? "text-zinc-300 hover:bg-zinc-800"
                : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className={`p-4 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
          <div className={`${isDark ? "bg-zinc-900" : "bg-zinc-200/70"} flex rounded-full p-1`}>
          {(["Surah", "Juz", "Page"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium ${
                activeTab === tab
                  ? isDark
                    ? "bg-primary/20 text-primary"
                    : "bg-white text-zinc-800 shadow-sm"
                  : isDark
                    ? "text-zinc-400 hover:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {tab}
            </button>
          ))}
          </div>
        </div>

        <div className="px-4 pb-3">
          <label htmlFor="surah-search" className="sr-only">
            Search Surah
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              id="surah-search"
              type="text"
              placeholder="Search Surah"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`w-full rounded-full border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary ${
                isDark
                  ? "border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
                  : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400"
              }`}
            />
          </div>
        </div>

        <div className="surah-scroll flex-1 overflow-y-scroll px-4 pb-4">
          {filteredSurahs.map((surah) => {
            const active = surah.number === activeSurahId;
            return (
              <Link
                key={surah.number}
                href={`/surah/${surah.number}`}
                onClick={onCloseMobile}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                  active
                    ? isDark
                      ? "bg-primary/20"
                      : "bg-primary/10"
                    : isDark
                      ? "hover:bg-zinc-900/70"
                      : "hover:bg-zinc-100"
                }`}
              >
                <div
                  className={`relative flex h-10 w-10 shrink-0 rotate-45 items-center justify-center rounded-[10px] ${
                    active
                      ? "bg-primary"
                      : isDark
                        ? "bg-primary/60"
                        : "bg-zinc-100"
                  }`}
                >
                  <span className={`-rotate-45 text-xs font-semibold ${active || isDark ? "text-white" : "text-zinc-500"}`}>
                    {surah.number}
                  </span>
                </div>
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-semibold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}
                  >
                    {surah.englishName}
                  </p>
                  <p
                    className={`truncate text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {surah.englishNameTranslation}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
