import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDetailDto {
  @ApiProperty({ example: 'INTERNAL_SERVER_ERROR' })
  code!: string;

  @ApiProperty({ example: 'An unexpected internal error occurred.' })
  message!: string;

  @ApiProperty({ example: 'trace_8f9a2b1c3d4e5f6a', required: false })
  traceId?: string;
}

export class ApiResponseEnvelopeDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ required: false })
  data!: T | null;

  @ApiProperty({ type: ApiErrorDetailDto, required: false, nullable: true })
  error!: ApiErrorDetailDto | null;

  @ApiProperty({ example: '2026-07-22T12:00:00.000Z' })
  timestamp!: string;
}
