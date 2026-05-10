import { ApiProperty } from '@nestjs/swagger';

export class FontDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  cssFamily!: string;

  @ApiProperty()
  cdnUrl!: string;
}

export class FontDefaultsDto {
  @ApiProperty()
  arabicFontId!: string;

  @ApiProperty()
  arabicFontSize!: number;

  @ApiProperty()
  translationFontSize!: number;
}

export class FontSettingsDto {
  @ApiProperty({ type: [FontDto] })
  fonts!: FontDto[];

  @ApiProperty({ type: FontDefaultsDto })
  defaults!: FontDefaultsDto;
}
