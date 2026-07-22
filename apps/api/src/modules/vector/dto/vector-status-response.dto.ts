import { ApiProperty } from '@nestjs/swagger';

export class VectorIndexingResponseDataDto {
  @ApiProperty({ example: 'enterprise_knowledge' })
  collectionName!: string;

  @ApiProperty({ example: 5 })
  vectorCount!: number;

  @ApiProperty({ example: 5 })
  indexedCount!: number;

  @ApiProperty({ example: 'indexed' })
  status!: string;
}

export class VectorCollectionStatusDto {
  @ApiProperty({ example: 'enterprise_knowledge' })
  collectionName!: string;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ example: 5 })
  vectorCount!: number;

  @ApiProperty({ example: 1 })
  documentsIndexed!: number;

  @ApiProperty({ example: '2026-07-22T19:36:00.000Z' })
  lastIndexedTime!: string;
}
