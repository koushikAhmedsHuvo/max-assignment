export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
}

export interface SurahData {
  surah: Surah;
  ayahs: Ayah[];
}

export interface FontSettings {
  arabicFontSize: number;
  translationFontSize: number;
  arabicFontFace: "KFGQ" | "Amiri" | "Scheherazade New";
  showTranslation: boolean;
}

export interface EditionAyah {
  number: number;
  numberInSurah: number;
  text: string;
}

export interface EditionData {
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  edition: {
    identifier: string;
  };
  ayahs: EditionAyah[];
}

export interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}
