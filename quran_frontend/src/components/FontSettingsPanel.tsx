"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFontSettings } from "@/src/context/FontSettingsContext";

interface FontSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export function FontSettingsPanel({
  open,
  onClose,
  isDark = false,
}: FontSettingsPanelProps) {
  const {
    fontSettings,
    updateFontFace,
    updateFontSize,
    updateShowTranslation,
  } = useFontSettings();
  const [readingOpen, setReadingOpen] = useState(false);
  const [fontSectionOpen, setFontSectionOpen] = useState(true);
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), 280);
    return () => window.clearTimeout(timeout);
  }, [open]);

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

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close settings panel"
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md rounded-l-[28px] border-l p-4 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible ? "translate-x-0" : "translate-x-6"
        } ${
          isDark
            ? "border-zinc-800 bg-dark-sidebar"
            : "border-zinc-200 bg-white"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>Settings</h2>
          <button
            aria-label="Close settings"
            onClick={onClose}
            className={`rounded-md p-2 ${
              isDark
                ? "text-zinc-300 hover:bg-zinc-800"
                : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={`mb-4 flex rounded-lg p-1 ${
            isDark ? "bg-zinc-900" : "bg-zinc-100"
          }`}
        >
          <button
            onClick={() => updateShowTranslation(true)}
            className={`flex-1 rounded-md py-2 text-sm ${
              fontSettings.showTranslation
                ? "bg-primary text-white"
                : isDark
                  ? "text-zinc-400 hover:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Translation
          </button>
          <button
            onClick={() => updateShowTranslation(false)}
            className={`flex-1 rounded-md py-2 text-sm ${
              !fontSettings.showTranslation
                ? "bg-primary text-white"
                : isDark
                  ? "text-zinc-400 hover:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Reading
          </button>
        </div>

        <div className="space-y-3">
          <section
            className={`rounded-lg border ${
              isDark
                ? "border-zinc-800 bg-zinc-900/50"
                : "border-zinc-200 bg-zinc-50"
            }`}
          >
            <button
              className={`w-full px-4 py-3 text-left text-sm font-medium ${
                isDark ? "text-zinc-200" : "text-zinc-700"
              }`}
              onClick={() => setReadingOpen((prev) => !prev)}
            >
              Reading Settings
            </button>
            {readingOpen && (
              <div
                className={`border-t px-4 py-3 text-sm ${
                  isDark
                    ? "border-zinc-800 text-zinc-400"
                    : "border-zinc-200 text-zinc-500"
                }`}
              >
                Reader mode and tafsir controls can be added here.
              </div>
            )}
          </section>

          <section
            className={`rounded-lg border ${
              isDark
                ? "border-zinc-800 bg-zinc-900/50"
                : "border-zinc-200 bg-zinc-50"
            }`}
          >
            <button
              className={`w-full px-4 py-3 text-left text-sm font-medium ${
                isDark ? "text-zinc-200" : "text-zinc-700"
              }`}
              onClick={() => setFontSectionOpen((prev) => !prev)}
            >
              Font Settings
            </button>
            {fontSectionOpen && (
              <div
                className={`space-y-5 border-t px-4 py-4 ${
                  isDark ? "border-zinc-800" : "border-zinc-200"
                }`}
              >
                <div>
                  <div
                    className={`mb-2 flex justify-between text-sm ${
                      isDark ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    <span>Arabic Font Size</span>
                    <span>{fontSettings.arabicFontSize}</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={48}
                    value={fontSettings.arabicFontSize}
                    aria-label="Arabic font size"
                    onChange={(event) =>
                      updateFontSize("arabic", Number(event.target.value))
                    }
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <div
                    className={`mb-2 flex justify-between text-sm ${
                      isDark ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    <span>Translation Font Size</span>
                    <span>{fontSettings.translationFontSize}</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={28}
                    value={fontSettings.translationFontSize}
                    aria-label="Translation font size"
                    onChange={(event) =>
                      updateFontSize("translation", Number(event.target.value))
                    }
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <label
                    className={`mb-1 block text-sm ${
                      isDark ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    Arabic Font Face
                  </label>
                  <select
                    value={fontSettings.arabicFontFace}
                    aria-label="Arabic font face"
                    onChange={(event) =>
                      updateFontFace(
                        event.target.value as
                          | "KFGQ"
                          | "Amiri"
                          | "Scheherazade New"
                      )
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary ${
                      isDark
                        ? "border-zinc-700 bg-zinc-950 text-zinc-100"
                        : "border-zinc-200 bg-white text-zinc-900"
                    }`}
                  >
                    <option value="KFGQ">KFGQ</option>
                    <option value="Amiri">Amiri</option>
                    <option value="Scheherazade New">Scheherazade New</option>
                  </select>
                </div>

                <div
                  className={`rounded-lg border px-3 py-3 ${
                    isDark
                      ? "border-zinc-700 bg-zinc-950"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <p className={`mb-2 text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Preview ({fontSettings.arabicFontFace})
                  </p>
                  <p
                    className={`text-right ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
                    style={{
                      fontFamily: arabicFontFamily,
                      fontSize: "28px",
                      lineHeight: 1.8,
                      fontWeight: arabicFontWeight,
                      letterSpacing: arabicLetterSpacing,
                    }}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
