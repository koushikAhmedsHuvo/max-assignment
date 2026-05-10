'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { FontSettings } from '@/src/lib/types';

const DEFAULT_FONT_SETTINGS: FontSettings = {
  arabicFontSize: 30,
  translationFontSize: 17,
  arabicFontFace: 'KFGQ',
  showTranslation: true,
};

interface FontSettingsContextType {
  fontSettings: FontSettings;
  setFontSettings: React.Dispatch<React.SetStateAction<FontSettings>>;
  updateFontSize: (type: 'arabic' | 'translation', size: number) => void;
  updateFontFace: (face: FontSettings['arabicFontFace']) => void;
  updateShowTranslation: (show: boolean) => void;
}

const FontSettingsContext = createContext<FontSettingsContextType | undefined>(
  undefined
);

export function FontSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontSettings, setFontSettings] =
    useState<FontSettings>(DEFAULT_FONT_SETTINGS);
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('quran-font-settings');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<FontSettings>;
        setFontSettings({
          arabicFontSize:
            typeof parsed.arabicFontSize === 'number'
              ? parsed.arabicFontSize
              : DEFAULT_FONT_SETTINGS.arabicFontSize,
          translationFontSize:
            typeof parsed.translationFontSize === 'number'
              ? parsed.translationFontSize
              : DEFAULT_FONT_SETTINGS.translationFontSize,
          arabicFontFace:
            parsed.arabicFontFace === 'Amiri' ||
            parsed.arabicFontFace === 'Scheherazade New' ||
            parsed.arabicFontFace === 'KFGQ'
              ? parsed.arabicFontFace
              : DEFAULT_FONT_SETTINGS.arabicFontFace,
          showTranslation:
            typeof parsed.showTranslation === 'boolean'
              ? parsed.showTranslation
              : DEFAULT_FONT_SETTINGS.showTranslation,
        });
      }
    } catch (error) {
      console.error('Failed to load font settings:', error);
    } finally {
      setSettingsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!settingsInitialized) return;

    try {
      localStorage.setItem('quran-font-settings', JSON.stringify(fontSettings));
    } catch (error) {
      console.error('Failed to save font settings:', error);
    }
  }, [fontSettings, settingsInitialized]);

  const updateFontSize = (type: 'arabic' | 'translation', size: number) => {
    setFontSettings((prev) => ({
      ...prev,
      arabicFontSize:
        type === 'arabic'
          ? Math.max(16, Math.min(48, size))
          : prev.arabicFontSize,
      translationFontSize:
        type === 'translation'
          ? Math.max(12, Math.min(28, size))
          : prev.translationFontSize,
    }));
  };

  const updateFontFace = (face: FontSettings['arabicFontFace']) => {
    setFontSettings((prev) => ({ ...prev, arabicFontFace: face }));
  };

  const updateShowTranslation = (show: boolean) => {
    setFontSettings((prev) => ({ ...prev, showTranslation: show }));
  };

  return (
    <FontSettingsContext.Provider
      value={{
        fontSettings,
        setFontSettings,
        updateFontSize,
        updateFontFace,
        updateShowTranslation,
      }}
    >
      {children}
    </FontSettingsContext.Provider>
  );
}

export function useFontSettings(): FontSettingsContextType {
  const context = useContext(FontSettingsContext);
  if (context === undefined) {
    throw new Error(
      'useFontSettings must be used within FontSettingsProvider'
    );
  }
  return context;
}
