import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { SurahResponseDto } from './dto/surah-response.dto';
import { SurahService } from './surah.service';

@ApiTags('Surahs')
@ApiTooManyRequestsResponse({ description: 'Too many requests' })
@Controller('surahs')
export class SurahController {
  constructor(private readonly surahService: SurahService) {}

  /**
   * Returns all 114 surahs.
   */
  @Get()
  @ApiOperation({ summary: 'Get all 114 surahs' })
  @ApiOkResponse({ type: [SurahResponseDto] })
  async getAllSurahs(): Promise<SurahResponseDto[]> {
    return this.surahService.getAllSurahs();
  }

  /**
   * Returns a single surah by chapter number.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single surah by number (1–114)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Surah number 1–114',
  })
  @ApiOkResponse({ type: SurahResponseDto })
  @ApiNotFoundResponse({ description: 'Surah not found' })
  async getSurahById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SurahResponseDto> {
    if (id < 1 || id > 114) {
      throw new BadRequestException('Surah id must be between 1 and 114');
    }

    return this.surahService.getSurahById(id);
  }
}
