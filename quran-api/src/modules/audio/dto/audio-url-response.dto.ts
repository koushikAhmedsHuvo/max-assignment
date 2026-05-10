import { ApiProperty } from '@nestjs/swagger';

export class ReciterDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class AudioUrlResponseDto {
  @ApiProperty()
  surahId!: number;

  @ApiProperty()
  ayahNumber!: number;

  @ApiProperty()
  reciter!: string;

  @ApiProperty()
  audioUrl!: string;
}
