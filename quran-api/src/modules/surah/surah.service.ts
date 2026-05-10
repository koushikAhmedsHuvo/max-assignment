import { Injectable, NotFoundException } from '@nestjs/common';
import { SurahResponseDto } from './dto/surah-response.dto';
import { Surah, SurahRepository } from './surah.repository';

@Injectable()
export class SurahService {
  constructor(private readonly surahRepository: SurahRepository) {}

  /**
   * Gets every surah as API response DTOs.
   */
  async getAllSurahs(): Promise<SurahResponseDto[]> {
    const surahs = await this.surahRepository.findAll();
    return surahs.map((surah) => this.toDto(surah));
  }

  /**
   * Gets one surah by number, or throws when it does not exist.
   */
  async getSurahById(id: number): Promise<SurahResponseDto> {
    const surah = await this.surahRepository.findById(id);

    if (!surah) {
      throw new NotFoundException('Surah not found');
    }

    return this.toDto(surah);
  }

  private toDto(surah: Surah): SurahResponseDto {
    return {
      id: surah.id,
      nameArabic: surah.nameArabic,
      nameEnglish: surah.nameEnglish,
      nameTranslation: surah.nameTranslation,
      revelationPlace: surah.revelationPlace,
      ayahCount: surah.ayahCount,
    };
  }
}
