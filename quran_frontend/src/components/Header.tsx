'use client';

import { Heart, Menu, Moon, Search, Settings, Sun } from "lucide-react";

interface HeaderProps {
  onSearchClick: () => void;
  onSettingsClick: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onMobileDrawerToggle: () => void;
}

export function Header({
  onSearchClick,
  onSettingsClick,
  isDark,
  onThemeToggle,
  onMobileDrawerToggle,
}: HeaderProps) {
  return (
    <div
      className={`fixed left-0 top-0 z-50 h-12 w-full border-b px-3 py-1.5 backdrop-blur md:left-14 md:h-16 md:w-[calc(100%-56px)] ${
        isDark
          ? "border-zinc-800 bg-dark-bg/95"
          : "border-zinc-200 bg-white/95"
      }`}
    >
      <div className="flex h-full items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileDrawerToggle}
            className={`rounded-md p-2 md:hidden ${
              isDark
                ? "text-zinc-300 hover:bg-zinc-800"
                : "text-zinc-500 hover:bg-zinc-100"
            }`}
            aria-label="Open surah drawer"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:block">
            <p
              className={`text-[28px] font-semibold leading-none ${
                isDark ? "text-zinc-100" : "text-zinc-800"
              }`}
            >
              Quran Mazid
            </p>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Read, Study, and Learn The Quran
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={onSearchClick}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              isDark
                ? "bg-transparent text-zinc-300 hover:bg-zinc-800"
                : "bg-transparent text-primary hover:bg-zinc-100"
            }`}
            aria-label="Open search"
          >
            <Search size={16} />
          </button>
          <button
            onClick={onThemeToggle}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              isDark
                ? "bg-transparent text-zinc-300 hover:bg-zinc-800"
                : "bg-transparent text-primary hover:bg-zinc-100"
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={onSettingsClick}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              isDark
                ? "bg-transparent text-zinc-300 hover:bg-zinc-800"
                : "bg-transparent text-primary hover:bg-zinc-100"
            }`}
            aria-label="Open settings"
          >
            <Settings size={16} />
          </button>
          <button
            className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white transition ${
              isDark
                ? "bg-primary hover:bg-primary-light"
                : "bg-primary hover:bg-primary-light"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              Support Us
              <Heart size={14} fill="currentColor" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
