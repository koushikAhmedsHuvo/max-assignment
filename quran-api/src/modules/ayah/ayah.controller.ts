import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { AyahQueryDto } from './dto/ayah-query.dto';
import { AyahResponseDto } from './dto/ayah-response.dto';
import { AyahService } from './ayah.service';
import type { PaginatedResponse } from './ayah.service';

@ApiTags('Ayahs')
@ApiTooManyRequestsResponse({ description: 'Too many requests' })
@Controller('surahs/:surahId/ayahs')
export class AyahController {
  constructor(private readonly ayahService: AyahService) {}

  /**
   * Returns paginated ayahs for a surah.
   */
  @Get()
  @ApiOperation({ summary: 'Get all ayahs of a surah (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiOkResponse({
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(AyahResponseDto) },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getAyahsBySurah(
    @Param('surahId', ParseIntPipe) surahId: number,
    @Query() query: AyahQueryDto,
  ): Promise<PaginatedResponse<AyahResponseDto>> {
    return this.ayahService.getAyahsBySurah(surahId, query);
  }

  /**
   * Returns a specific ayah by surah id and ayah number.
   */
  @Get(':ayahNumber')
  @ApiOperation({ summary: 'Get a specific ayah' })
  @ApiOkResponse({ type: AyahResponseDto })
  @ApiNotFoundResponse({ description: 'Ayah not found' })
  async getAyah(
    @Param('surahId', ParseIntPipe) surahId: number,
    @Param('ayahNumber', ParseIntPipe) ayahNumber: number,
  ): Promise<AyahResponseDto> {
    return this.ayahService.getAyah(surahId, ayahNumber);
  }
}
