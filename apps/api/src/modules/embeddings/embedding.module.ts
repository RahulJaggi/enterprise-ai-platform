import { Module } from '@nestjs/common';
import { EmbeddingController } from './embedding.controller';
import { EmbeddingService } from './embedding.service';
import { EMBEDDING_PROVIDER_TOKEN } from '../../providers/embeddings/embedding-provider.interface';
import { OllamaEmbeddingProvider } from '../../providers/embeddings/ollama-embedding.provider';

@Module({
  controllers: [EmbeddingController],
  providers: [
    EmbeddingService,
    {
      provide: EMBEDDING_PROVIDER_TOKEN,
      useClass: OllamaEmbeddingProvider,
    },
  ],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
