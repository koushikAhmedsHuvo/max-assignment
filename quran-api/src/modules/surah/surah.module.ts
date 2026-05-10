import { Module } from '@nestjs/common';
import { SurahController } from './surah.controller';
import { SurahRepository } from './surah.repository';
import { SurahService } from './surah.service';

@Module({
  controllers: [SurahController],
  providers: [SurahRepository, SurahService],
  exports: [SurahService],
})
export class SurahModule {}
