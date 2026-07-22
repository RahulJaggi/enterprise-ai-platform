import { Injectable, Inject, Logger } from '@nestjs/common';
import { AI_PROVIDER_TOKEN, IAiProvider } from '../../providers/ollama/ollama.interface';
import { PromptService } from './prompts/prompt.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDataDto } from './dto/chat-response.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER_TOKEN)
    private readonly aiProvider: IAiProvider,
    private readonly promptService: PromptService,
  ) {}

  async chat(dto: ChatRequestDto): Promise<ChatResponseDataDto> {
    this.logger.log(`Processing chat completion via provider [${this.aiProvider.providerName}]`);

    const formattedPrompt = this.promptService.buildPrompt({
      userPrompt: dto.message,
      templateType: 'assistant',
    });

    const completion = await this.aiProvider.generateCompletion({
      prompt: formattedPrompt.prompt,
      systemPrompt: formattedPrompt.systemPrompt,
    });

    return {
      response: completion.text,
    };
  }
}
