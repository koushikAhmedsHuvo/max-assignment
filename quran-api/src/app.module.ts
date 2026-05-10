import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AyahModule } from './modules/ayah/ayah.module';
import { AudioModule } from './modules/audio/audio.module';
import { FontModule } from './modules/font/font.module';
import { SearchModule } from './modules/search/search.module';
import { SurahModule } from './modules/surah/surah.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    HealthModule,
    SurahModule,
    AyahModule,
    AudioModule,
    SearchModule,
    FontModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
