import { ApiProperty } from '@nestjs/swagger';

export class AyahResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  surahId!: number;

  @ApiProperty()
  ayahNumber!: number;

  @ApiProperty()
  textArabic!: string;

  @ApiProperty()
  textTranslation!: string;
}
