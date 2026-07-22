import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PromptService } from './prompts/prompt.service';
import { MemoryService } from './memory/memory.service';
import { MemoryProvider } from './memory/memory.provider';
import { InMemoryStore } from './memory/stores/in-memory.store';
import { MEMORY_PROVIDER_TOKEN } from './memory/memory.interface';
import { AI_PROVIDER_TOKEN } from '../../providers/ollama/ollama.interface';
import { OllamaProvider } from '../../providers/ollama/ollama.provider';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    PromptService,
    MemoryService,
    InMemoryStore,
    {
      provide: MEMORY_PROVIDER_TOKEN,
      useClass: MemoryProvider,
    },
    {
      provide: AI_PROVIDER_TOKEN,
      useClass: OllamaProvider,
    },
  ],
  exports: [AiService, PromptService, MemoryService],
})
export class AiModule {}
