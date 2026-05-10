import { createClient, type Client } from '@libsql/client';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context, Next } from 'hono';

const SURAH_COUNT = 114;
const SOURCE_BASE_URL =
  'https://raw.githubusercontent.com/semarketir/quranjson/master/source';

const RECITERS = [
  {
    id: 'mishary',
    name: 'Mishary Rashid Alafasy',
    baseUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy',
  },
  {
    id: 'sudais',
    name: 'Abdurrahman Al-Sudais',
    baseUrl: 'https://cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    baseUrl: 'https://cdn.islamic.network/quran/audio/128/ar.husary',
  },
] as const;

const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49,
  62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28,
  28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5,
  6,
] as const;

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

const AVAILABLE_FONTS = [
  {
    id: 'uthmani',
    name: 'KFGQ Uthmanic Hafs',
    cssFamily: 'KFGQPC Uthmanic Script HAFS',
    cdnUrl:
      'https://fonts.qurancomplex.gov.sa/wp-content/uploads/2021/08/KFGQPC-HAFS-Uthmanic-Script.woff2',
  },
  {
    id: 'amiri',
    name: 'Amiri Quran',
    cssFamily: 'Amiri',
    cdnUrl:
      'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.woff2',
  },
  {
    id: 'scheherazade',
    name: 'Scheherazade New',
    cssFamily: 'Scheherazade New',
    cdnUrl:
      'https://fonts.gstatic.com/s/scheherazadenew/v17/4UaZrFhTvxVnHDvUkUiHg8jQkzM.woff2',
  },
] as const;

const DEFAULT_FONT_SETTINGS = {
  arabicFontId: 'uthmani',
  arabicFontSize: 28,
  translationFontSize: 16,
} as const;

const SURAH_TRANSLATED_NAMES = [
  'The Opening',
  'The Cow',
  'The Family of Imran',
  'The Women',
  'The Table Spread',
  'The Cattle',
  'The Heights',
  'The Spoils of War',
  'The Repentance',
  'Jonah',
  'Hud',
  'Joseph',
  'The Thunder',
  'Abraham',
  'The Rocky Tract',
  'The Bee',
  'The Night Journey',
  'The Cave',
  'Mary',
  'Ta-Ha',
  'The Prophets',
  'The Pilgrimage',
  'The Believers',
  'The Light',
  'The Criterion',
  'The Poets',
  'The Ant',
  'The Stories',
  'The Spider',
  'The Romans',
  'Luqman',
  'The Prostration',
  'The Confederates',
  'Sheba',
  'Originator',
  'Ya-Sin',
  'Those Who Set the Ranks',
  'The Letter Sad',
  'The Troops',
  'The Forgiver',
  'Explained in Detail',
  'The Consultation',
  'The Ornaments of Gold',
  'The Smoke',
  'The Crouching',
  'The Wind-Curved Sandhills',
  'Muhammad',
  'The Victory',
  'The Rooms',
  'The Letter Qaf',
  'The Winnowing Winds',
  'The Mount',
  'The Star',
  'The Moon',
  'The Beneficent',
  'The Inevitable',
  'The Iron',
  'The Pleading Woman',
  'The Exile',
  'She That Is to Be Examined',
  'The Ranks',
  'Friday',
  'The Hypocrites',
  'The Mutual Disillusion',
  'The Divorce',
  'The Prohibition',
  'The Sovereignty',
  'The Pen',
  'The Reality',
  'The Ascending Stairways',
  'Noah',
  'The Jinn',
  'The Enshrouded One',
  'The Cloaked One',
  'The Resurrection',
  'Man',
  'The Emissaries',
  'The Tidings',
  'Those Who Drag Forth',
  'He Frowned',
  'The Overthrowing',
  'The Cleaving',
  'The Defrauding',
  'The Splitting Open',
  'The Mansions of the Stars',
  'The Nightcomer',
  'The Most High',
  'The Overwhelming',
  'The Dawn',
  'The City',
  'The Sun',
  'The Night',
  'The Morning Hours',
  'The Relief',
  'The Fig',
  'The Clot',
  'The Power',
  'The Clear Proof',
  'The Earthquake',
  'The Chargers',
  'The Striking Calamity',
  'Rivalry in World Increase',
  'The Declining Day',
  'The Traducer',
  'The Elephant',
  'Quraysh',
  'The Small Kindnesses',
  'The Abundance',
  'The Disbelievers',
  'The Divine Support',
  'The Palm Fiber',
  'The Sincerity',
  'The Daybreak',
  'Mankind',
] as const;

type SurahMetadata = {
  place: string;
  count: number;
  title: string;
  titleAr: string;
  index: string;
};

type SurahMetadataFile = {
  value: SurahMetadata[];
  Count: number;
};

type SurahMetadataResponse = SurahMetadata[] | SurahMetadataFile;

type SurahFile = {
  index: string;
  name: string;
  verse: Record<string, string>;
  count: number;
};

type TranslationFile = {
  index: string;
  name: string;
  verse: Record<string, string>;
  count: number;
};

type SeedAyah = {
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
};

type SeedSurah = {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationPlace: 'Makkah' | 'Madinah';
  ayahCount: number;
  ayahs: SeedAyah[];
};

type Surah = {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationPlace: string;
  ayahCount: number;
};

type Ayah = {
  id: number;
  surahId: number;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
};

type SearchResult = {
  ayahId: number;
  surahId: number;
  surahName: string;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
  snippet: string;
};

type SearchLanguage = 'en' | 'ar';

type SearchIndexRow = {
  ayahId: number;
  surahId: number;
  surahName: string;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
  textArabicLower: string;
  textTranslationLower: string;
};

type InMemoryData = {
  surahs: Surah[];
  ayahsBySurah: Map<number, Ayah[]>;
  searchRows: SearchIndexRow[];
};

const OPENAPI_BASE_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Quran API',
    version: '1.0.0',
    description: 'Public API for Surah, Ayah, search, audio, and fonts.',
  },
  tags: [
    { name: 'Health' },
    { name: 'Surah' },
    { name: 'Ayah' },
    { name: 'Search' },
    { name: 'Audio' },
    { name: 'Font' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': { description: 'Service is healthy' },
        },
      },
    },
    '/healthz': {
      get: {
        tags: ['Health'],
        summary: 'Health check alias',
        responses: {
          '200': { description: 'Service is healthy' },
        },
      },
    },
    '/surahs': {
      get: {
        tags: ['Surah'],
        summary: 'Get all surahs',
        responses: {
          '200': { description: 'List of surahs' },
        },
      },
    },
    '/surahs/{id}': {
      get: {
        tags: ['Surah'],
        summary: 'Get surah by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 114 },
          },
        ],
        responses: {
          '200': { description: 'Surah details' },
          '404': { description: 'Surah not found' },
        },
      },
    },
    '/surahs/{surahId}/ayahs': {
      get: {
        tags: ['Ayah'],
        summary: 'Get paginated ayahs for a surah',
        parameters: [
          {
            name: 'surahId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 114 },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 286, default: 20 },
          },
        ],
        responses: {
          '200': { description: 'Paginated ayah list' },
        },
      },
    },
    '/surahs/{surahId}/ayahs/{ayahNumber}': {
      get: {
        tags: ['Ayah'],
        summary: 'Get a single ayah by surah and ayah number',
        parameters: [
          {
            name: 'surahId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 114 },
          },
          {
            name: 'ayahNumber',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': { description: 'Ayah details' },
          '404': { description: 'Ayah not found' },
        },
      },
    },
    '/search': {
      get: {
        tags: ['Search'],
        summary: 'Search ayahs by Arabic or translation text',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string', minLength: 2 },
          },
          {
            name: 'lang',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['en', 'ar'], default: 'en' },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
        ],
        responses: {
          '200': { description: 'Search results' },
        },
      },
    },
    '/audio/reciters': {
      get: {
        tags: ['Audio'],
        summary: 'Get available reciters',
        responses: {
          '200': { description: 'Reciter list' },
        },
      },
    },
    '/audio/surah/{surahId}/ayah/{ayahNumber}': {
      get: {
        tags: ['Audio'],
        summary: 'Get direct audio URL for an ayah',
        parameters: [
          {
            name: 'surahId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 114 },
          },
          {
            name: 'ayahNumber',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'reciter',
            in: 'query',
            required: false,
            schema: { type: 'string', default: 'mishary' },
          },
        ],
        responses: {
          '200': { description: 'Audio URL payload' },
        },
      },
    },
    '/audio/proxy/surah/{surahId}/ayah/{ayahNumber}': {
      get: {
        tags: ['Audio'],
        summary: 'Stream proxied audio for an ayah',
        parameters: [
          {
            name: 'surahId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 114 },
          },
          {
            name: 'ayahNumber',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'reciter',
            in: 'query',
            required: false,
            schema: { type: 'string', default: 'mishary' },
          },
        ],
        responses: {
          '200': { description: 'Audio stream' },
        },
      },
    },
    '/fonts': {
      get: {
        tags: ['Font'],
        summary: 'Get available Quran fonts and defaults',
        responses: {
          '200': { description: 'Font list and defaults' },
        },
      },
    },
    '/fonts/{id}': {
      get: {
        tags: ['Font'],
        summary: 'Get font details by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Font details' },
          '404': { description: 'Font not found' },
        },
      },
    },
  },
} as const;

class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

class Database {
  private readonly db?: Client;
  public readonly enabled: boolean;

  constructor() {
    const dbUrl = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!dbUrl) {
      this.enabled = false;
      return;
    }

    this.enabled = true;

    this.db = createClient({
      url: dbUrl,
      authToken,
    });
  }

  async init(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    await this.createTables();
    await this.seedIfEmpty();
  }

  async execute<T = unknown>(
    sql: string,
    params: Record<string, unknown> = {},
  ): Promise<T[]> {
    const result = await this.client.execute({
      sql,
      args: this.paramsToArray(params) as any[],
    });

    return (result.rows || []) as T[];
  }

  async executeOne<T = unknown>(
    sql: string,
    params: Record<string, unknown> = {},
  ): Promise<T | undefined> {
    const rows = await this.execute<T>(sql, params);
    return rows[0];
  }

  async run(sql: string, params: Record<string, unknown> = {}): Promise<void> {
    await this.client.execute({
      sql,
      args: this.paramsToArray(params) as any[],
    });
  }

  async close(): Promise<void> {
    this.db?.close();
  }

  private get client(): Client {
    if (!this.db) {
      throw new Error('Database is not configured');
    }

    return this.db;
  }

  private paramsToArray(params: Record<string, unknown>): unknown[] {
    return Object.values(params);
  }

  private async createTables(): Promise<void> {
    const statements = [
      `
      CREATE TABLE IF NOT EXISTS surahs (
        id INTEGER PRIMARY KEY,
        name_arabic TEXT NOT NULL,
        name_english TEXT NOT NULL,
        name_translation TEXT NOT NULL,
        revelation_place TEXT NOT NULL,
        ayah_count INTEGER NOT NULL
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS ayahs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ayah_id INTEGER,
        surah_id INTEGER NOT NULL REFERENCES surahs(id),
        ayah_number INTEGER NOT NULL,
        text_arabic TEXT NOT NULL,
        text_translation TEXT NOT NULL,
        UNIQUE(surah_id, ayah_number)
      )
      `,
      `
      CREATE VIRTUAL TABLE IF NOT EXISTS ayahs_fts USING fts5(
        ayah_id UNINDEXED,
        surah_id UNINDEXED,
        ayah_number UNINDEXED,
        text_arabic,
        text_translation,
        content='ayahs',
        content_rowid='id'
      )
      `,
    ];

    for (const sql of statements) {
      await this.client.execute(sql);
    }

    await this.ensureAyahIdColumn();
  }

  private async ensureAyahIdColumn(): Promise<void> {
    try {
      const columns = await this.execute<{ name: string }>('PRAGMA table_info(ayahs)');
      const hasAyahId = columns.some((column) => column.name === 'ayah_id');

      if (!hasAyahId) {
        await this.client.execute('ALTER TABLE ayahs ADD COLUMN ayah_id INTEGER;');
      }
    } catch {
      console.debug('Column check skipped.');
    }
  }

  private async seedIfEmpty(): Promise<void> {
    try {
      const row = await this.executeOne<{ count: number }>('SELECT COUNT(*) AS count FROM surahs');

      if (row && Number(row.count) > 0) {
        return;
      }

      const metadata = await this.fetchJson<SurahMetadataResponse>(
        `${SOURCE_BASE_URL}/surah.json`,
      );
      const surahs = await this.fetchSurahs(this.toMetadataItems(metadata));
      await this.insertSeedData(surahs);
      console.log('Quran database seed completed.');
    } catch (error) {
      console.error(
        `Failed to seed Quran database: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private async fetchSurahs(metadataItems: SurahMetadata[]): Promise<SeedSurah[]> {
    const surahs: SeedSurah[] = [];

    for (let surahNumber = 1; surahNumber <= SURAH_COUNT; surahNumber += 1) {
      console.log(`Seeding surah ${surahNumber}/${SURAH_COUNT}...`);

      const [surahFile, translationFile] = await Promise.all([
        this.fetchJson<SurahFile>(`${SOURCE_BASE_URL}/surah/surah_${surahNumber}.json`),
        this.fetchJson<TranslationFile>(
          `${SOURCE_BASE_URL}/translation/en/en_translation_${surahNumber}.json`,
        ),
      ]);

      const metadata = metadataItems.find(
        (item) => Number(item.index) === surahNumber,
      );

      if (!metadata) {
        throw new Error(`Missing metadata for surah ${surahNumber}`);
      }

      surahs.push(this.toSeedSurah(surahNumber, metadata, surahFile, translationFile));
    }

    return surahs;
  }

  private toMetadataItems(response: SurahMetadataResponse): SurahMetadata[] {
    return Array.isArray(response) ? response : response.value;
  }

  private toSeedSurah(
    surahNumber: number,
    metadata: SurahMetadata,
    surahFile: SurahFile,
    translationFile: TranslationFile,
  ): SeedSurah {
    const ayahCount = metadata.count || surahFile.count;
    const ayahs: SeedAyah[] = [];

    for (let ayahNumber = 1; ayahNumber <= ayahCount; ayahNumber += 1) {
      const verseKey = `verse_${ayahNumber}`;
      const textArabic = surahFile.verse[verseKey];
      const textTranslation = translationFile.verse[verseKey];

      if (!textArabic || !textTranslation) {
        throw new Error(`Missing ayah ${ayahNumber} data for surah ${surahNumber}`);
      }

      ayahs.push({
        ayahNumber,
        textArabic: textArabic.replace(/^\uFEFF/, ''),
        textTranslation,
      });
    }

    return {
      id: surahNumber,
      nameArabic: metadata.titleAr,
      nameEnglish: metadata.title || surahFile.name || translationFile.name,
      nameTranslation: SURAH_TRANSLATED_NAMES[surahNumber - 1],
      revelationPlace: metadata.place === 'Medina' ? 'Madinah' : 'Makkah',
      ayahCount,
      ayahs,
    };
  }

  private async insertSeedData(surahs: SeedSurah[]): Promise<void> {
    for (const surah of surahs) {
      await this.run(
        `
        INSERT INTO surahs (
          id,
          name_arabic,
          name_english,
          name_translation,
          revelation_place,
          ayah_count
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        {
          id: surah.id,
          nameArabic: surah.nameArabic,
          nameEnglish: surah.nameEnglish,
          nameTranslation: surah.nameTranslation,
          revelationPlace: surah.revelationPlace,
          ayahCount: surah.ayahCount,
        },
      );

      for (const ayah of surah.ayahs) {
        await this.run(
          `
          INSERT INTO ayahs (
            surah_id,
            ayah_number,
            text_arabic,
            text_translation
          )
          VALUES (?, ?, ?, ?)
          `,
          {
            surahId: surah.id,
            ayahNumber: ayah.ayahNumber,
            textArabic: ayah.textArabic,
            textTranslation: ayah.textTranslation,
          },
        );
      }
    }

    await this.client.execute('UPDATE ayahs SET ayah_id = id WHERE ayah_id IS NULL;');
    await this.populateFtsTable();
  }

  private async populateFtsTable(): Promise<void> {
    try {
      await this.client.execute("INSERT INTO ayahs_fts(ayahs_fts) VALUES ('rebuild');");
    } catch {
      console.debug('FTS rebuild skipped.');
    }
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Fetch failed for ${url}: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}

const db = new Database();
let inMemoryData: InMemoryData | null = null;
const app = new Hono();

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getTimestamp(): string {
  return new Date().toISOString();
}

function jsonSuccess(c: Context, data: unknown, status = 200): Response {
  c.status(status as any);
  return c.json({
    success: true,
    data,
    timestamp: getTimestamp(),
  });
}

function jsonError(c: Context, statusCode: number, message: string): Response {
  c.status(statusCode as any);
  return c.json({
    success: false,
    statusCode,
    message,
    timestamp: getTimestamp(),
    path: c.req.path,
  });
}

function parseIntParam(
  value: string,
  fieldName: string,
  min?: number,
  max?: number,
): number {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new HttpError(400, `${fieldName} must be an integer`);
  }

  if (min !== undefined && parsed < min) {
    throw new HttpError(400, `${fieldName} must be greater than or equal to ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new HttpError(400, `${fieldName} must be less than or equal to ${max}`);
  }

  return parsed;
}

function sanitizeQuery(q: string): string {
  return q.replace(/[*"']/g, '').trim();
}

function getGlobalAyahNumber(surahId: number, ayahNumber: number): number {
  const ayahCount = AYAH_COUNTS[surahId - 1];

  if (!ayahCount) {
    throw new HttpError(400, 'Surah id must be between 1 and 114');
  }

  if (ayahNumber < 1 || ayahNumber > ayahCount) {
    throw new HttpError(
      400,
      `Ayah number must be between 1 and ${ayahCount} for this surah`,
    );
  }

  return CUMULATIVE_AYAH_COUNTS[surahId - 1] + ayahNumber;
}

function getReciter(reciterId: string): (typeof RECITERS)[number] {
  const reciter = RECITERS.find((item) => item.id === reciterId);

  if (!reciter) {
    throw new HttpError(400, 'Unsupported reciter');
  }

  return reciter;
}

async function loadInMemoryData(): Promise<InMemoryData> {
  const metadataResponse = await fetch(`${SOURCE_BASE_URL}/surah.json`);

  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch surah metadata: ${metadataResponse.status}`);
  }

  const metadataJson = (await metadataResponse.json()) as SurahMetadataResponse;
  const metadataItems = Array.isArray(metadataJson)
    ? metadataJson
    : metadataJson.value;

  const surahs: Surah[] = [];
  const ayahsBySurah = new Map<number, Ayah[]>();
  const searchRows: SearchIndexRow[] = [];
  let ayahId = 1;

  for (let surahNumber = 1; surahNumber <= SURAH_COUNT; surahNumber += 1) {
    console.log(`Loading in-memory surah ${surahNumber}/${SURAH_COUNT}...`);

    const [surahResponse, translationResponse] = await Promise.all([
      fetch(`${SOURCE_BASE_URL}/surah/surah_${surahNumber}.json`),
      fetch(`${SOURCE_BASE_URL}/translation/en/en_translation_${surahNumber}.json`),
    ]);

    if (!surahResponse.ok || !translationResponse.ok) {
      throw new Error(`Failed to load surah ${surahNumber} data`);
    }

    const surahFile = (await surahResponse.json()) as SurahFile;
    const translationFile = (await translationResponse.json()) as TranslationFile;
    const metadata = metadataItems.find((item) => Number(item.index) === surahNumber);

    if (!metadata) {
      throw new Error(`Missing metadata for surah ${surahNumber}`);
    }

    const ayahCount = metadata.count || surahFile.count;
    const surah: Surah = {
      id: surahNumber,
      nameArabic: metadata.titleAr,
      nameEnglish: metadata.title || surahFile.name || translationFile.name,
      nameTranslation: SURAH_TRANSLATED_NAMES[surahNumber - 1],
      revelationPlace: metadata.place === 'Medina' ? 'Madinah' : 'Makkah',
      ayahCount,
    };

    const ayahs: Ayah[] = [];

    for (let ayahNumber = 1; ayahNumber <= ayahCount; ayahNumber += 1) {
      const verseKey = `verse_${ayahNumber}`;
      const textArabic = surahFile.verse[verseKey]?.replace(/^\uFEFF/, '');
      const textTranslation = translationFile.verse[verseKey];

      if (!textArabic || !textTranslation) {
        throw new Error(`Missing ayah ${ayahNumber} data for surah ${surahNumber}`);
      }

      const ayah: Ayah = {
        id: ayahId,
        surahId: surahNumber,
        ayahNumber,
        textArabic,
        textTranslation,
      };

      ayahs.push(ayah);
      searchRows.push({
        ayahId,
        surahId: surahNumber,
        surahName: surah.nameEnglish,
        ayahNumber,
        textArabic,
        textTranslation,
        textArabicLower: textArabic.toLowerCase(),
        textTranslationLower: textTranslation.toLowerCase(),
      });

      ayahId += 1;
    }

    surahs.push(surah);
    ayahsBySurah.set(surahNumber, ayahs);
  }

  return {
    surahs,
    ayahsBySurah,
    searchRows,
  };
}

async function getAllSurahs(): Promise<Surah[]> {
  if (db.enabled) {
    return db.execute<Surah>(
      `
        SELECT
          id,
          name_arabic AS nameArabic,
          name_english AS nameEnglish,
          name_translation AS nameTranslation,
          revelation_place AS revelationPlace,
          ayah_count AS ayahCount
        FROM surahs
        ORDER BY id ASC
      `,
    );
  }

  return inMemoryData?.surahs ?? [];
}

async function getSurahById(id: number): Promise<Surah | undefined> {
  if (db.enabled) {
    return db.executeOne<Surah>(
      `
        SELECT
          id,
          name_arabic AS nameArabic,
          name_english AS nameEnglish,
          name_translation AS nameTranslation,
          revelation_place AS revelationPlace,
          ayah_count AS ayahCount
        FROM surahs
        WHERE id = ?
      `,
      { id },
    );
  }

  return inMemoryData?.surahs.find((surah) => surah.id === id);
}

async function getAyahsBySurah(
  surahId: number,
  page: number,
  limit: number,
): Promise<{ items: Ayah[]; total: number }> {
  if (db.enabled) {
    const countRow = await db.executeOne<{ count: number }>(
      'SELECT COUNT(*) AS count FROM ayahs WHERE surah_id = ?',
      { surahId },
    );
    const total = Number(countRow?.count ?? 0);
    const offset = (page - 1) * limit;
    const items = await db.execute<Ayah>(
      `
        SELECT
          id,
          surah_id AS surahId,
          ayah_number AS ayahNumber,
          text_arabic AS textArabic,
          text_translation AS textTranslation
        FROM ayahs
        WHERE surah_id = ?
        ORDER BY ayah_number ASC
        LIMIT ? OFFSET ?
      `,
      { surahId, limit, offset },
    );

    return { items, total };
  }

  const allAyahs = inMemoryData?.ayahsBySurah.get(surahId) ?? [];
  const total = allAyahs.length;
  const offset = (page - 1) * limit;

  return {
    items: allAyahs.slice(offset, offset + limit),
    total,
  };
}

async function getAyahById(
  surahId: number,
  ayahNumber: number,
): Promise<Ayah | undefined> {
  if (db.enabled) {
    return db.executeOne<Ayah>(
      `
        SELECT
          id,
          surah_id AS surahId,
          ayah_number AS ayahNumber,
          text_arabic AS textArabic,
          text_translation AS textTranslation
        FROM ayahs
        WHERE surah_id = ? AND ayah_number = ?
      `,
      { surahId, ayahNumber },
    );
  }

  return inMemoryData?.ayahsBySurah
    .get(surahId)
    ?.find((ayah) => ayah.ayahNumber === ayahNumber);
}

async function searchAyahs(
  q: string,
  lang: SearchLanguage,
  page: number,
  limit: number,
): Promise<{ items: SearchResult[]; total: number }> {
  if (db.enabled) {
    const offset = (page - 1) * limit;
    const columnIndex = lang === 'en' ? 4 : 3;
    const matchPrefix = lang === 'en' ? 'text_translation:' : 'text_arabic:';
    const countRow = await db.executeOne<{ count: number }>(
      `
        SELECT COUNT(*) AS count
        FROM ayahs_fts
        WHERE ayahs_fts MATCH ?
      `,
      { query: matchPrefix + q },
    );
    const total = Number(countRow?.count ?? 0);
    const items = await db.execute<SearchResult>(
      `
        SELECT
          ayahs.id AS ayahId,
          ayahs.surah_id AS surahId,
          surahs.name_english AS surahName,
          ayahs.ayah_number AS ayahNumber,
          ayahs.text_arabic AS textArabic,
          ayahs.text_translation AS textTranslation,
          snippet(ayahs_fts, ${columnIndex}, '<mark>', '</mark>', '...', 20) AS snippet
        FROM ayahs_fts
        JOIN ayahs ON ayahs.id = ayahs_fts.rowid
        JOIN surahs ON surahs.id = ayahs.surah_id
        WHERE ayahs_fts MATCH ?
        ORDER BY rank
        LIMIT ? OFFSET ?
      `,
      { query: matchPrefix + q, limit, offset },
    );

    return { items, total };
  }

  const needle = q.toLowerCase();
  const rows = inMemoryData?.searchRows ?? [];
  const filtered = rows.filter((row) =>
    lang === 'en'
      ? row.textTranslationLower.includes(needle)
      : row.textArabicLower.includes(needle),
  );
  const total = filtered.length;
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit).map((row) => {
    const sourceText = lang === 'en' ? row.textTranslation : row.textArabic;
    const sourceLower = lang === 'en' ? row.textTranslationLower : row.textArabicLower;
    const matchStart = sourceLower.indexOf(needle);
    const snippet =
      matchStart >= 0
        ? `${sourceText.slice(Math.max(0, matchStart - 20), matchStart)}<mark>${sourceText.slice(matchStart, matchStart + needle.length)}</mark>${sourceText.slice(matchStart + needle.length, matchStart + needle.length + 20)}`
        : sourceText.slice(0, 40);

    return {
      ayahId: row.ayahId,
      surahId: row.surahId,
      surahName: row.surahName,
      ayahNumber: row.ayahNumber,
      textArabic: row.textArabic,
      textTranslation: row.textTranslation,
      snippet,
    };
  });

  return { items, total };
}

async function ensureSurahExists(surahId: number): Promise<void> {
  const surah = await getSurahById(surahId);

  if (!surah) {
    throw new HttpError(404, 'Surah not found');
  }
}

app.use('*', cors());

app.use('*', async (c: Context, next: Next) => {
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() || 'unknown' : 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + 60_000 });
    await next();
    return;
  }

  if (entry.count >= 100) {
    c.header('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    throw new HttpError(429, 'Too many requests');
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  await next();
});

app.get('/', (c) => jsonSuccess(c, { name: 'Quran API', runtime: 'hono-bun' }));

app.get('/health', async (c) => {
  const dbStatus: 'connected' | 'error' = db.enabled ? 'connected' : 'error';

  return jsonSuccess(c, {
    status: 'ok',
    db: dbStatus,
    uptime: process.uptime(),
    timestamp: getTimestamp(),
  });
});

app.get('/healthz', async (c) => {
  const dbStatus: 'connected' | 'error' = db.enabled ? 'connected' : 'error';

  return jsonSuccess(c, {
    status: 'ok',
    db: dbStatus,
    uptime: process.uptime(),
    timestamp: getTimestamp(),
  });
});

app.get('/docs/openapi.json', (c) => {
  const openApiSpec = {
    ...OPENAPI_BASE_SPEC,
    servers: [{ url: c.req.url.split(c.req.path)[0] }],
  };

  return c.json(openApiSpec);
});

app.get('/docs', (c) => {
  const title = 'Quran API Docs';

  return c.html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      body { margin: 0; background: #fafafa; }
      #swagger-ui { max-width: 1100px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>`);
});

app.get('/surahs', async (c) => {
  const surahs = await getAllSurahs();

  return jsonSuccess(c, surahs);
});

app.get('/surahs/:id', async (c) => {
  const id = parseIntParam(c.req.param('id'), 'Surah id', 1, 114);
  const surah = await getSurahById(id);

  if (!surah) {
    throw new HttpError(404, 'Surah not found');
  }

  return jsonSuccess(c, surah);
});

app.get('/surahs/:surahId/ayahs', async (c) => {
  const surahId = parseIntParam(c.req.param('surahId'), 'surahId', 1, 114);
  const page = parseIntParam(c.req.query('page') ?? '1', 'page', 1);
  const limit = parseIntParam(c.req.query('limit') ?? '20', 'limit', 1, 286);

  await ensureSurahExists(surahId);

  const { items: ayahs, total } = await getAyahsBySurah(surahId, page, limit);

  return jsonSuccess(c, {
    items: ayahs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

app.get('/surahs/:surahId/ayahs/:ayahNumber', async (c) => {
  const surahId = parseIntParam(c.req.param('surahId'), 'surahId', 1, 114);
  const ayahNumber = parseIntParam(c.req.param('ayahNumber'), 'ayahNumber', 1);

  await ensureSurahExists(surahId);

  const ayah = await getAyahById(surahId, ayahNumber);

  if (!ayah) {
    throw new HttpError(404, 'Ayah not found');
  }

  return jsonSuccess(c, ayah);
});

app.get('/audio/reciters', (c) => {
  return jsonSuccess(
    c,
    RECITERS.map(({ id, name }) => ({ id, name })),
  );
});

app.get('/audio/surah/:surahId/ayah/:ayahNumber', (c) => {
  const surahId = parseIntParam(c.req.param('surahId'), 'surahId', 1, 114);
  const ayahNumber = parseIntParam(c.req.param('ayahNumber'), 'ayahNumber', 1);
  const reciterId = c.req.query('reciter') ?? 'mishary';
  const reciter = getReciter(reciterId);
  const globalAyahNumber = getGlobalAyahNumber(surahId, ayahNumber);

  return jsonSuccess(c, {
    surahId,
    ayahNumber,
    reciter: reciter.id,
    audioUrl: `${reciter.baseUrl}/${globalAyahNumber}.mp3`,
  });
});

app.get('/audio/proxy/surah/:surahId/ayah/:ayahNumber', async (c) => {
  const surahId = parseIntParam(c.req.param('surahId'), 'surahId', 1, 114);
  const ayahNumber = parseIntParam(c.req.param('ayahNumber'), 'ayahNumber', 1);
  const reciterId = c.req.query('reciter') ?? 'mishary';
  const reciter = getReciter(reciterId);
  const globalAyahNumber = getGlobalAyahNumber(surahId, ayahNumber);

  const audioUrl = `${reciter.baseUrl}/${globalAyahNumber}.mp3`;
  const cdnResponse = await fetch(audioUrl);

  if (!cdnResponse.ok || !cdnResponse.body) {
    c.status((cdnResponse.status || 502) as any);
    return c.json({ message: 'Unable to stream audio' });
  }

  const headers = new Headers();
  headers.set('Content-Type', 'audio/mpeg');
  headers.set('Accept-Ranges', 'bytes');

  const contentLength = cdnResponse.headers.get('content-length');

  if (contentLength) {
    headers.set('Content-Length', contentLength);
  }

  return new Response(cdnResponse.body, {
    status: 200,
    headers,
  });
});

app.get('/search', async (c) => {
  const q = sanitizeQuery(c.req.query('q') ?? '');

  if (q.length < 2) {
    throw new HttpError(400, 'Search query must be at least 2 characters');
  }

  const page = parseIntParam(c.req.query('page') ?? '1', 'page', 1);
  const limit = parseIntParam(c.req.query('limit') ?? '20', 'limit', 1, 50);
  const langQuery = c.req.query('lang') ?? 'en';
  const lang: SearchLanguage = langQuery === 'ar' ? 'ar' : 'en';
  const { items: results, total } = await searchAyahs(q, lang, page, limit);

  return jsonSuccess(c, {
    items: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

app.get('/fonts', (c) => {
  return jsonSuccess(c, {
    fonts: AVAILABLE_FONTS,
    defaults: DEFAULT_FONT_SETTINGS,
  });
});

app.get('/fonts/:id', (c) => {
  const id = c.req.param('id');
  const font = AVAILABLE_FONTS.find((item) => item.id === id);

  if (!font) {
    throw new HttpError(404, 'Font not found');
  }

  return jsonSuccess(c, font);
});

app.notFound((c) => jsonError(c, 404, 'Not found'));

app.onError((error, c) => {
  if (error instanceof HttpError) {
    return jsonError(c, error.statusCode, error.message);
  }

  console.error(error);
  return jsonError(c, 500, 'Internal server error');
});

const port = Number(process.env.PORT ?? 3000);

const bootstrap = async (): Promise<void> => {
  if (db.enabled) {
    await db.init();
  } else {
    console.log('TURSO_CONNECTION_URL not set. Starting in-memory mode.');
    inMemoryData = await loadInMemoryData();
  }

  const bunRuntime = (globalThis as typeof globalThis & {
    Bun?: {
      serve: (options: {
        fetch: (request: Request) => Response | Promise<Response>;
        port: number;
      }) => void;
    };
  }).Bun;

  if (bunRuntime) {
    bunRuntime.serve({ fetch: app.fetch, port });
    console.log(
      `Quran API running with Bun + Hono on http://localhost:${port} (${db.enabled ? 'database mode' : 'in-memory mode'})`,
    );
  } else {
    const nodeServer = await import('@hono/node-server');
    nodeServer.serve({ fetch: app.fetch, port });
    console.log(
      `Quran API running with Node + Hono on http://localhost:${port} (${db.enabled ? 'database mode' : 'in-memory mode'})`,
    );
  }
};

void bootstrap();

const cleanup = async (): Promise<void> => {
  await db.close();
  process.exit(0);
};

process.once('SIGINT', () => {
  void cleanup();
});
process.once('SIGTERM', () => {
  void cleanup();
});
