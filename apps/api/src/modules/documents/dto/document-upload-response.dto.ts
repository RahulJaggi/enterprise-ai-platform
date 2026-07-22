import { ApiProperty } from '@nestjs/swagger';

export class DocumentUploadResponseDto {
  @ApiProperty({
    example: 'enterprise-architecture.pdf',
    description: 'Original uploaded PDF filename',
  })
  filename!: string;

  @ApiProperty({
    example: 12,
    description: 'Total number of pages extracted from the PDF',
  })
  pageCount!: number;

  @ApiProperty({
    example: 14500,
    description: 'Total character count of extracted raw text',
  })
  characterCount!: number;

  @ApiProperty({
    example: 'Enterprise Architecture Document Content...',
    description: 'Full extracted text content from the PDF',
  })
  text!: string;
}
