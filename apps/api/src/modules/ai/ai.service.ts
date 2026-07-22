import { Injectable, Inject, Logger } from '@nestjs/common';
import { AI_PROVIDER_TOKEN, IAiProvider } from '../../providers/ollama/ollama.interface';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDataDto } from './dto/chat-response.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER_TOKEN)
    private readonly aiProvider: IAiProvider,
  ) {}

  async chat(dto: ChatRequestDto): Promise<ChatResponseDataDto> {
    this.logger.log(
      `Processing chat completion request via provider [${this.aiProvider.providerName}]`,
    );

    const completion = await this.aiProvider.generateCompletion({
      prompt: dto.message,
    });

    return {
      response: completion.text,
    };
  }
}
