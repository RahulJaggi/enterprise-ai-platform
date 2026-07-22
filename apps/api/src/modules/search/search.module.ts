import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { OllamaEmbeddingProvider } from '../../providers/embeddings/ollama-embedding.provider';
import { QdrantProvider } from '../../providers/vector/qdrant.provider';
import { EMBEDDING_PROVIDER_TOKEN } from '../../providers/embeddings/embedding-provider.interface';
import { VECTOR_PROVIDER_TOKEN } from '../../providers/vector/vector-provider.interface';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    {
      provide: EMBEDDING_PROVIDER_TOKEN,
      useClass: OllamaEmbeddingProvider,
    },
    {
      provide: VECTOR_PROVIDER_TOKEN,
      useClass: QdrantProvider,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
