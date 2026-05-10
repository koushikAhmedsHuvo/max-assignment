import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export type SearchLanguage = 'en' | 'ar';

export type SearchResult = {
  ayahId: number;
  surahId: number;
  surahName: string;
  ayahNumber: number;
  textArabic: string;
  textTranslation: string;
  snippet: string;
};

type CountRow = {
  count: number;
};

@Injectable()
export class SearchRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Searches ayahs with SQLite FTS5 and returns paginated matches.
   */
  async search(
    q: string,
    lang: SearchLanguage,
    page: number,
    limit: number,
  ): Promise<SearchResult[]> {
    const offset = (page - 1) * limit;
    const columnIndex = this.getSnippetColumnIndex(lang);
    const matchPrefix = this.getMatchPrefix(lang);

    return this.databaseService.execute<SearchResult>(
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
      {
        query: matchPrefix + q,
        limit,
        offset,
      },
    );
  }

  /**
   * Counts FTS5 matches for a query and language.
   */
  async count(q: string, lang: SearchLanguage): Promise<number> {
    const matchPrefix = this.getMatchPrefix(lang);
    const row = await this.databaseService.executeOne<CountRow>(
      `
        SELECT COUNT(*) AS count
        FROM ayahs_fts
        WHERE ayahs_fts MATCH ?
      `,
      {
        query: matchPrefix + q,
      },
    );

    return row?.count ?? 0;
  }

  private getMatchPrefix(lang: SearchLanguage): string {
    return lang === 'en' ? 'text_translation:' : 'text_arabic:';
  }

  private getSnippetColumnIndex(lang: SearchLanguage): number {
    return lang === 'en' ? 4 : 3;
  }
}
