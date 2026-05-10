"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Ayah, FontSettings, Surah } from "@/src/lib/types";
import { useFontSettings } from "@/src/context/FontSettingsContext";
import { FontSettingsPanel } from "./FontSettingsPanel";
import { Header } from "./Header";
import { LeftIconSidebar } from "./LeftIconSidebar";
import { SearchModal } from "./SearchModal";
import { SurahHeader } from "./SurahHeader";
import { SurahSidebar } from "./SurahSidebar";
import { AyahCard } from "./AyahCard";

interface SurahReaderClientProps {
  surahs: Surah[];
  surah: Surah;
  ayahs: Ayah[];
}

export function SurahReaderClient({
  surahs,
  surah,
  ayahs,
}: SurahReaderClientProps) {
  const { fontSettings } = useFontSettings();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeInitialized, setThemeInitialized] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const styleVars = useMemo(
    () =>
      ({
        "--arabic-font-size": `${fontSettings.arabicFontSize}px`,
        "--translation-font-size": `${fontSettings.translationFontSize}px`,
      }) as CSSProperties,
    [fontSettings]
  );

  const isDark = theme === "dark";

  // Load persisted theme once on mount.
  useEffect(() => {
    let nextTheme: "dark" | "light" = "dark";
    try {
      const stored = localStorage.getItem("quran-theme");
      if (stored === "light" || stored === "dark") {
        nextTheme = stored;
      }
    } catch {
      // ignore
    }

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    setThemeInitialized(true);
  }, []);

  // Persist theme only after initialization to avoid overwriting stored value.
  useEffect(() => {
    if (!themeInitialized) return;

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("quran-theme", theme);
  }, [theme, themeInitialized]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const pageTheme = isDark
    ? "bg-dark-bg text-white"
    : "bg-white text-zinc-900";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageTheme}`} style={styleVars}>
      <LeftIconSidebar activeIcon="home" isDark={isDark} />
      <SurahSidebar
        surahs={surahs}
        activeSurahId={surah.number}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
        isDark={isDark}
      />

      <Header
        onSearchClick={() => setSearchOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        onMobileDrawerToggle={() => setMobileDrawerOpen(true)}
      />

      <main className="pt-12 md:ml-[328px] md:pt-16">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-10">
          <SurahHeader
            surah={surah}
            isDark={isDark}
            arabicFontFace={fontSettings.arabicFontFace}
          />
          <section>
            {ayahs.map((ayah) => (
              <AyahCard
                key={ayah.number}
                ayah={ayah}
                surahNumber={surah.number}
                fontSettings={fontSettings as FontSettings}
                isDark={isDark}
              />
            ))}
          </section>
        </div>
      </main>

      <FontSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDark={isDark}
      />
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        isDark={isDark}
        surahs={surahs}
        currentSurahNumber={surah.number}
        currentAyahs={ayahs}
      />
    </div>
  );
}
