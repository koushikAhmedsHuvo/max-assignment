import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export type Ayah = {
  id: number;
  surahId: number;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
};

type CountRow = {
  count: number;
};

@Injectable()
export class AyahRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Finds ayahs for a surah using page-based pagination.
   */
  async findBySurahId(
    surahId: number,
    page: number,
    limit: number,
  ): Promise<Ayah[]> {
    const offset = (page - 1) * limit;

    return this.databaseService.execute<Ayah>(
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
      {
        surahId,
        limit,
        offset,
      },
    );
  }

  /**
   * Finds a single ayah by surah id and ayah number.
   */
  async findById(
    surahId: number,
    ayahNumber: number,
  ): Promise<Ayah | undefined> {
    return this.databaseService.executeOne<Ayah>(
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
      {
        surahId,
        ayahNumber,
      },
    );
  }

  /**
   * Counts all ayahs in a surah.
   */
  async countBySurahId(surahId: number): Promise<number> {
    const row = await this.databaseService.executeOne<CountRow>(
      'SELECT COUNT(*) AS count FROM ayahs WHERE surah_id = ?',
      {
        surahId,
      },
    );

    return row?.count ?? 0;
  }
}
