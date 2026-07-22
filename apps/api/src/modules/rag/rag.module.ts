import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { PromptBuilderService } from './prompt-builder.service';
import { CitationService } from './citation.service';
import { SearchModule } from '../search/search.module';
import { OllamaProvider } from '../../providers/ollama/ollama.provider';
import { AI_PROVIDER_TOKEN } from '../../providers/ollama/ollama.interface';

@Module({
  imports: [SearchModule],
  controllers: [RagController],
  providers: [
    RagService,
    PromptBuilderService,
    CitationService,
    {
      provide: AI_PROVIDER_TOKEN,
      useClass: OllamaProvider,
    },
  ],
  exports: [RagService],
})
export class RagModule {}
