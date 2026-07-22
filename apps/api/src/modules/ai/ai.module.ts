import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PromptService } from './prompts/prompt.service';
import { AI_PROVIDER_TOKEN } from '../../providers/ollama/ollama.interface';
import { OllamaProvider } from '../../providers/ollama/ollama.provider';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    PromptService,
    {
      provide: AI_PROVIDER_TOKEN,
      useClass: OllamaProvider,
    },
  ],
  exports: [AiService, PromptService],
})
export class AiModule {}
