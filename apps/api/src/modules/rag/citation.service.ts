import { Injectable, Logger } from '@nestjs/common';
import { VectorSearchResult } from '../../providers/vector/vector-provider.interface';

export interface RagCitationSource {
  filename: string;
  pageNumber: number;
  chunkId: string;
}

@Injectable()
export class CitationService {
  private readonly logger = new Logger(CitationService.name);

  extractCitations(chunks: VectorSearchResult[]): RagCitationSource[] {
    const seen = new Set<string>();
    const citations: RagCitationSource[] = [];

    for (const c of chunks) {
      const key = `${c.filename}_P${c.pageNumber}_${c.chunkId}`;
      if (!seen.has(key)) {
        seen.add(key);
        citations.push({
          filename: c.filename,
          pageNumber: c.pageNumber,
          chunkId: c.chunkId,
        });
      }
    }

    this.logger.debug(
      `Extracted ${citations.length} distinct source citations from ${chunks.length} chunks`,
    );
    return citations;
  }

  calculateConfidence(chunks: VectorSearchResult[]): number {
    if (!chunks || chunks.length === 0) return 0;

    const topScore = chunks[0]?.score || 0;
    const avgScore = chunks.reduce((acc, curr) => acc + (curr.score || 0), 0) / chunks.length;

    // Weight top match score more heavily
    const rawConfidence = topScore * 0.7 + avgScore * 0.3;
    const normalizedConfidence = Math.min(1.0, Math.max(0.0, rawConfidence * 1.2));

    return Number(normalizedConfidence.toFixed(2));
  }
}
