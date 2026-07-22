import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    example:
      'Explain the benefits of a modular monorepo architecture for enterprise AI applications.',
    description: 'The user message or prompt to send to the AI model provider',
    maxLength: 4000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;

  @ApiProperty({
    example: 'conv_8f9a2b1c3d4e5f6a',
    description: 'Optional conversation ID. If omitted, a new conversation context is created.',
    required: false,
  })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
