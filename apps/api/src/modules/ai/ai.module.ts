import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AI_PROVIDER_TOKEN } from '../../providers/ollama/ollama.interface';
import { OllamaProvider } from '../../providers/ollama/ollama.provider';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: AI_PROVIDER_TOKEN,
      useClass: OllamaProvider,
    },
  ],
  exports: [AiService],
})
export class AiModule {}
