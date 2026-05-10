import {
  Surah,
  SurahData,
  Ayah,
} from './types';

type BackendResponse<T> = {
  success: boolean;
  data: T;
  timestamp: string;
};

type BackendSurah = {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationPlace: string;
  ayahCount: number;
};

type BackendAyah = {
  id: number;
  surahId: number;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
};

type BackendPaginatedAyahs = {
  items: BackendAyah[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://quran-web-app-1.onrender.com';

const CUMULATIVE_AYAH_COUNTS = [
  0, 7, 293, 493, 669, 789, 954, 1160, 1235, 1364, 1473, 1596, 1707, 1750,
  1802, 1901, 2029, 2140, 2250, 2348, 2483, 2595, 2673, 2791, 2855, 2932, 3159,
  3252, 3340, 3409, 3469, 3503, 3533, 3606, 3660, 3705, 3788, 3970, 4058, 4133,
  4218, 4272, 4325, 4414, 4473, 4510, 4545, 4583, 4612, 4630, 4675, 4735, 4784,
  4846, 4901, 4979, 5075, 5104, 5126, 5150, 5163, 5177, 5188, 5199, 5217, 5229,
  5241, 5271, 5323, 5375, 5419, 5447, 5475, 5495, 5551, 5591, 5622, 5672, 5712,
  5758, 5800, 5829, 5848, 5884, 5909, 5931, 5948, 5967, 5993, 6023, 6043, 6058,
  6079, 6090, 6098, 6106, 6125, 6130, 6138, 6146, 6157, 6168, 6176, 6179, 6188,
  6193, 6197, 6204, 6207, 6213, 6216, 6221, 6225, 6230,
] as const;

async function fetchWithRetry(
  input: string,
  init?: RequestInit & { next?: { revalidate: number } },
  retries = 3
): Promise<Response> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (response.ok) return response;
      lastError = new Error(`Request failed with ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed.');
}

export async function getSurahList(): Promise<Surah[]> {
  const response = await fetchWithRetry(`${API_BASE}/surahs`, {
    next: { revalidate: 86400 },
  });
  const payload = (await response.json()) as BackendResponse<BackendSurah[]>;

  return payload.data.map((surah) => ({
    number: surah.id,
    name: surah.nameArabic,
    englishName: surah.nameEnglish,
    englishNameTranslation: surah.nameTranslation,
    numberOfAyahs: surah.ayahCount,
    revelationType: surah.revelationPlace,
  }));
}

export async function getSurahWithTranslation(
  id: number
): Promise<SurahData> {
  const [surahRes, ayahsRes] = await Promise.all([
    fetchWithRetry(`${API_BASE}/surahs/${id}`, { next: { revalidate: 86400 } }),
    fetchWithRetry(`${API_BASE}/surahs/${id}/ayahs?page=1&limit=286`, {
      next: { revalidate: 86400 },
    }),
  ]);

  const surahPayload = (await surahRes.json()) as BackendResponse<BackendSurah>;
  const ayahsPayload =
    (await ayahsRes.json()) as BackendResponse<BackendPaginatedAyahs>;

  const surah: Surah = {
    number: surahPayload.data.id,
    name: surahPayload.data.nameArabic,
    englishName: surahPayload.data.nameEnglish,
    englishNameTranslation: surahPayload.data.nameTranslation,
    numberOfAyahs: surahPayload.data.ayahCount,
    revelationType: surahPayload.data.revelationPlace,
  };

  const ayahs: Ayah[] = ayahsPayload.data.items.map((ayah) => ({
    number: ayah.id,
    numberInSurah: ayah.ayahNumber,
    text: ayah.textArabic,
    translation: ayah.textTranslation,
  }));

  return { surah, ayahs };
}

export function getAyahAudioUrl(verseNumber: number): string {
  const reference = getSurahAyahFromGlobal(verseNumber);
  return `${API_BASE}/audio/proxy/surah/${reference.surahId}/ayah/${reference.ayahNumber}`;
}

function getSurahAyahFromGlobal(globalAyahNumber: number): {
  surahId: number;
  ayahNumber: number;
} {
  if (globalAyahNumber < 1 || globalAyahNumber > CUMULATIVE_AYAH_COUNTS[CUMULATIVE_AYAH_COUNTS.length - 1]) {
    throw new Error('Invalid global ayah number for audio URL');
  }

  for (let surahId = 1; surahId < CUMULATIVE_AYAH_COUNTS.length; surahId += 1) {
    const start = CUMULATIVE_AYAH_COUNTS[surahId - 1] + 1;
    const end = CUMULATIVE_AYAH_COUNTS[surahId];

    if (globalAyahNumber >= start && globalAyahNumber <= end) {
      return {
        surahId,
        ayahNumber: globalAyahNumber - CUMULATIVE_AYAH_COUNTS[surahId - 1],
      };
    }
  }

  throw new Error('Unable to resolve global ayah number');
}

