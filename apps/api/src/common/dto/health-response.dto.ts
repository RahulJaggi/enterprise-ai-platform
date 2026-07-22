import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDataDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '0.1.0' })
  version!: string;

  @ApiProperty({ example: 'development' })
  environment!: string;

  @ApiProperty({ example: '2026-07-22T12:00:00.000Z' })
  timestamp!: string;
}
