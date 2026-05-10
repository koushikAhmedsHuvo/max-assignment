import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client } from '@libsql/client';

const SURAH_COUNT = 114;
const SOURCE_BASE_URL =
  'https://raw.githubusercontent.com/semarketir/quranjson/master/source';

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

type VerseMap = Record<string, string>;

type SurahFile = {
  index: string;
  name: string;
  verse: VerseMap;
  count: number;
};

type TranslationFile = {
  index: string;
  name: string;
  verse: VerseMap;
  count: number;
};

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

type CountRow = {
  count: number;
};

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  public db!: Client;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const dbUrl = this.configService.get<string>('TURSO_CONNECTION_URL');
    const authToken = this.configService.get<string>('TURSO_AUTH_TOKEN');

    if (!dbUrl) {
      throw new Error('TURSO_CONNECTION_URL environment variable is not set');
    }

    this.db = createClient({
      url: dbUrl,
      authToken: authToken,
    });

    await this.createTables();
    await this.seedIfEmpty();
  }

  async execute<T = unknown>(
    sql: string,
    params: Record<string, unknown> = {},
  ): Promise<T[]> {
    const result = await this.db.execute({
      sql,
      args: this.paramsToArray(sql, params) as any[],
    });
    return (result.rows || []) as T[];
  }

  async executeOne<T = unknown>(
    sql: string,
    params: Record<string, unknown> = {},
  ): Promise<T | undefined> {
    const results = await this.execute<T>(sql, params);
    return results[0];
  }

  async run(sql: string, params: Record<string, unknown> = {}): Promise<void> {
    await this.db.execute({
      sql,
      args: this.paramsToArray(sql, params) as any[],
    });
  }

  private paramsToArray(sql: string, params: Record<string, unknown>): unknown[] {
    const keys = Object.keys(params);
    return keys.map((key) => params[key]);
  }

  onModuleDestroy(): void {
    if (this.db) {
      this.db.close();
    }
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
      await this.db.execute(sql);
    }

    await this.ensureAyahIdColumn();
  }

  private async ensureAyahIdColumn(): Promise<void> {
    try {
      const columns = await this.execute<{ name: string }>(
        'PRAGMA table_info(ayahs)',
      );
      const hasAyahId = columns.some((column) => column.name === 'ayah_id');

      if (!hasAyahId) {
        await this.db.execute('ALTER TABLE ayahs ADD COLUMN ayah_id INTEGER;');
      }
    } catch (error) {
      // Column might already exist
      this.logger.debug('Column check skipped');
    }
  }

  private async seedIfEmpty(): Promise<void> {
    try {
      const row = await this.executeOne<CountRow>(
        'SELECT COUNT(*) AS count FROM surahs',
      );

      if (row && row.count > 0) {
        return;
      }

      try {
        const metadata = await this.fetchJson<SurahMetadataResponse>(
          `${SOURCE_BASE_URL}/surah.json`,
        );
        const surahs = await this.fetchSurahs(this.toMetadataItems(metadata));
        await this.insertSeedData(surahs);
        this.logger.log('Quran database seed completed.');
      } catch (error) {
        this.logger.error(
          `Failed to seed Quran database: ${this.getErrorMessage(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    } catch (error) {
      this.logger.debug('Seed check skipped on first run');
    }
  }

  private async fetchSurahs(
    metadataItems: SurahMetadata[],
  ): Promise<SeedSurah[]> {
    const surahs: SeedSurah[] = [];

    for (let surahNumber = 1; surahNumber <= SURAH_COUNT; surahNumber += 1) {
      this.logger.log(`Seeding surah ${surahNumber}/${SURAH_COUNT}...`);

      const [surahFile, translationFile] = await Promise.all([
        this.fetchJson<SurahFile>(
          `${SOURCE_BASE_URL}/surah/surah_${surahNumber}.json`,
        ),
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

      surahs.push(
        this.toSeedSurah(surahNumber, metadata, surahFile, translationFile),
      );
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
        throw new Error(
          `Missing ayah ${ayahNumber} data for surah ${surahNumber}`,
        );
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
        VALUES (
          ?, ?, ?, ?, ?, ?
        )
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
          VALUES (
            ?, ?, ?, ?
          )
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

    await this.db.execute(
      "UPDATE ayahs SET ayah_id = id WHERE ayah_id IS NULL;",
    );
    await this.populateFtsTable();
  }

  private async populateFtsTable(): Promise<void> {
    try {
      await this.db.execute(
        "INSERT INTO ayahs_fts(ayahs_fts) VALUES ('rebuild');",
      );
    } catch (error) {
      this.logger.debug('FTS rebuild skipped');
    }
  }

  private async fetchJson<T>(url: string): Promise<T> {
    let response: Response;

    try {
      response = await fetch(url);
    } catch (error) {
      this.logger.error(
        `Fetch failed for ${url}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }

    if (!response.ok) {
      throw new Error(`Fetch failed for ${url}: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}

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
