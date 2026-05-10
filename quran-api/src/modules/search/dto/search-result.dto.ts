import { ApiProperty } from '@nestjs/swagger';

export class SearchResultDto {
  @ApiProperty()
  ayahId!: number;

  @ApiProperty()
  surahId!: number;

  @ApiProperty()
  surahName!: string;

  @ApiProperty()
  ayahNumber!: number;

  @ApiProperty()
  textArabic!: string;

  @ApiProperty()
  textTranslation!: string;

  @ApiProperty()
  snippet!: string;
}
