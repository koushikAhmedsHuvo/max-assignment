import { ApiProperty } from '@nestjs/swagger';

export class SurahResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nameArabic!: string;

  @ApiProperty()
  nameEnglish!: string;

  @ApiProperty()
  nameTranslation!: string;

  @ApiProperty()
  revelationPlace!: string;

  @ApiProperty()
  ayahCount!: number;
}
