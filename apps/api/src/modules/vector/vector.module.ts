import { Module } from '@nestjs/common';
import { VectorController } from './vector.controller';
import { VectorService } from './vector.service';
import { VECTOR_PROVIDER_TOKEN } from '../../providers/vector/vector-provider.interface';
import { QdrantProvider } from '../../providers/vector/qdrant.provider';

@Module({
  controllers: [VectorController],
  providers: [
    VectorService,
    {
      provide: VECTOR_PROVIDER_TOKEN,
      useClass: QdrantProvider,
    },
  ],
  exports: [VectorService],
})
export class VectorModule {}
