import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export type Surah = {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  revelationPlace: string;
  ayahCount: number;
};

type CountRow = {
  count: number;
};

@Injectable()
export class SurahRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Finds all surahs ordered by surah number.
   */
  async findAll(): Promise<Surah[]> {
    return this.databaseService.execute<Surah>(
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

  /**
   * Finds one surah by its Quran chapter number.
   */
  async findById(id: number): Promise<Surah | undefined> {
    return this.databaseService.executeOne<Surah>(
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

  /**
   * Counts all stored surahs.
   */
  async count(): Promise<number> {
    const row = await this.databaseService.executeOne<CountRow>(
      'SELECT COUNT(*) AS count FROM surahs',
    );

    return row?.count ?? 0;
  }
}
