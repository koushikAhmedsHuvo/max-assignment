import { Module } from '@nestjs/common';
import { SurahModule } from '../surah/surah.module';
import { AyahController } from './ayah.controller';
import { AyahRepository } from './ayah.repository';
import { AyahService } from './ayah.service';

@Module({
  imports: [SurahModule],
  controllers: [AyahController],
  providers: [AyahRepository, AyahService],
  exports: [AyahService],
})
export class AyahModule {}
