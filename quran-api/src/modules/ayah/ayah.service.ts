import { Injectable, NotFoundException } from '@nestjs/common';
import { SurahService } from '../surah/surah.service';
import { AyahQueryDto } from './dto/ayah-query.dto';
import { AyahResponseDto } from './dto/ayah-response.dto';
import { Ayah, AyahRepository } from './ayah.repository';

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class AyahService {
  constructor(
    private readonly ayahRepository: AyahRepository,
    private readonly surahService: SurahService,
  ) {}

  /**
   * Gets paginated ayahs for a surah after validating the surah exists.
   */
  async getAyahsBySurah(
    surahId: number,
    query: AyahQueryDto,
  ): Promise<PaginatedResponse<AyahResponseDto>> {
    await this.surahService.getSurahById(surahId);

    const page = query.page;
    const limit = query.limit;
    const total = await this.ayahRepository.countBySurahId(surahId);
    const ayahs = await this.ayahRepository.findBySurahId(
      surahId,
      page,
      limit,
    );
    const items = ayahs.map((ayah) => this.toDto(ayah));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Gets a single ayah after validating the surah exists.
   */
  async getAyah(
    surahId: number,
    ayahNumber: number,
  ): Promise<AyahResponseDto> {
    await this.surahService.getSurahById(surahId);

    const ayah = await this.ayahRepository.findById(surahId, ayahNumber);

    if (!ayah) {
      throw new NotFoundException('Ayah not found');
    }

    return this.toDto(ayah);
  }

  private toDto(ayah: Ayah): AyahResponseDto {
    return {
      id: ayah.id,
      surahId: ayah.surahId,
      ayahNumber: ayah.ayahNumber,
      textArabic: ayah.textArabic,
      textTranslation: ayah.textTranslation,
    };
  }
}
