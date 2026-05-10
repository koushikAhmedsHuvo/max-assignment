import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Readable } from 'node:stream';
import { AudioUrlResponseDto, ReciterDto } from './dto/audio-url-response.dto';
import { AudioService } from './audio.service';
import type { Response } from 'express';
import type { ReadableStream } from 'node:stream/web';

@ApiTags('Audio')
@ApiTooManyRequestsResponse({ description: 'Too many requests' })
@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  /**
   * Returns every available reciter.
   */
  @Get('reciters')
  @ApiOperation({ summary: 'List all available reciters' })
  @ApiOkResponse({ type: [ReciterDto] })
  getReciters(): ReciterDto[] {
    return this.audioService.getReciters();
  }

  /**
   * Returns the CDN audio URL for a specific ayah.
   */
  @Get('surah/:surahId/ayah/:ayahNumber')
  @ApiOperation({ summary: 'Get audio URL for a specific ayah' })
  @ApiQuery({
    name: 'reciter',
    required: false,
    description: 'Reciter ID, default: mishary',
  })
  @ApiOkResponse({ type: AudioUrlResponseDto })
  getAudioUrl(
    @Param('surahId', ParseIntPipe) surahId: number,
    @Param('ayahNumber', ParseIntPipe) ayahNumber: number,
    @Query('reciter') reciter = 'mishary',
  ): AudioUrlResponseDto {
    return this.audioService.getAudioUrl(surahId, ayahNumber, reciter);
  }

  /**
   * Streams the CDN audio response through the API server.
   */
  @Get('proxy/surah/:surahId/ayah/:ayahNumber')
  @ApiOperation({ summary: 'Stream audio from CDN via server proxy' })
  @ApiQuery({
    name: 'reciter',
    required: false,
    description: 'Reciter ID, default: mishary',
  })
  @ApiProduces('audio/mpeg')
  async proxyAudio(
    @Param('surahId', ParseIntPipe) surahId: number,
    @Param('ayahNumber', ParseIntPipe) ayahNumber: number,
    @Query('reciter') reciter: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const audio = this.audioService.getAudioUrl(
      surahId,
      ayahNumber,
      reciter ?? 'mishary',
    );
    const cdnResponse = await fetch(audio.audioUrl);

    if (!cdnResponse.ok || !cdnResponse.body) {
      response
        .status(cdnResponse.status || 502)
        .json({ message: 'Unable to stream audio' });
      return;
    }

    const contentLength = cdnResponse.headers.get('content-length');

    response.setHeader('Content-Type', 'audio/mpeg');
    response.setHeader('Accept-Ranges', 'bytes');

    if (contentLength) {
      response.setHeader('Content-Length', contentLength);
    }

    const audioStream =
      cdnResponse.body as unknown as ReadableStream<Uint8Array>;

    Readable.fromWeb(audioStream).pipe(response);
  }
}
