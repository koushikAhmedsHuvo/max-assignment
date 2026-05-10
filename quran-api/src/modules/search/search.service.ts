import { BadRequestException, Injectable } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';
import {
  SearchLanguage,
  SearchRepository,
  SearchResult,
} from './search.repository';

type PaginatedSearchResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  /**
   * Searches all ayahs and returns paginated results.
   */
  async search(
    query: SearchQueryDto,
  ): Promise<PaginatedSearchResponse<SearchResultDto>> {
    const q = this.sanitizeQuery(query.q);

    if (q.length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters',
      );
    }

    const page = query.page;
    const limit = query.limit;
    const lang = query.lang;
    const total = await this.searchRepository.count(q, lang);
    const results = await this.searchRepository.search(q, lang, page, limit);
    const items = results.map((result) => this.toDto(result));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private sanitizeQuery(q: string): string {
    return q.replace(/[*"']/g, '').trim();
  }

  private toDto(result: SearchResult): SearchResultDto {
    return {
      ayahId: result.ayahId,
      surahId: result.surahId,
      surahName: result.surahName,
      ayahNumber: result.ayahNumber,
      textArabic: result.textArabic,
      textTranslation: result.textTranslation,
      snippet: result.snippet,
    };
  }
}
