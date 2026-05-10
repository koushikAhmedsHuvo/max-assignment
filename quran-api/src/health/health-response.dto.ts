import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty()
  status!: 'ok';

  @ApiProperty({ enum: ['connected', 'error'] })
  db!: 'connected' | 'error';

  @ApiProperty()
  uptime!: number;

  @ApiProperty()
  timestamp!: string;
}
