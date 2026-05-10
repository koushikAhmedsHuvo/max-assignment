import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { FontDto, FontSettingsDto } from './dto/font-settings.dto';
import { FontService } from './font.service';

@ApiTags('Font Settings')
@ApiTooManyRequestsResponse({ description: 'Too many requests' })
@Controller('fonts')
export class FontController {
  constructor(private readonly fontService: FontService) {}

  /**
   * Returns available Arabic fonts and default size settings.
   */
  @Get()
  @ApiOperation({
    summary: 'Get available Arabic fonts and default size settings',
  })
  @ApiOkResponse({ type: FontSettingsDto })
  getFontSettings(): FontSettingsDto {
    return this.fontService.getFontSettings();
  }

  /**
   * Returns a single font by id.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific font by ID' })
  @ApiOkResponse({ type: FontDto })
  @ApiNotFoundResponse({ description: 'Font ID not found' })
  getFontById(@Param('id') id: string): FontDto {
    return this.fontService.getFontById(id);
  }
}
