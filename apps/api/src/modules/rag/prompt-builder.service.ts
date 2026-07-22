import { Injectable, Logger } from '@nestjs/common';
import { VectorSearchResult } from '../../providers/vector/vector-provider.interface';

export interface FormattedRagPrompt {
  systemPrompt: string;
  userPrompt: string;
}

@Injectable()
export class PromptBuilderService {
  private readonly logger = new Logger(PromptBuilderService.name);

  buildRagPrompt(question: string, chunks: VectorSearchResult[]): FormattedRagPrompt {
    this.logger.debug(
      `Building RAG prompt for question [${question}] with ${chunks.length} context chunks`,
    );

    const formattedChunks = chunks
      .map((c, idx) => {
        return `[Chunk #${idx + 1} | Source: ${c.filename} | Page: ${c.pageNumber} | Score: ${(c.score * 100).toFixed(1)}%]\n${c.content.trim()}`;
      })
      .join('\n\n');

    const systemPrompt = `You are a strict, grounded Enterprise AI Assistant. Your task is to answer the user's question using ONLY the provided document context chunks below.

STRICT RULES YOU MUST FOLLOW:
1. Base your answer STRICTLY and ONLY on the facts directly stated in the provided context chunks.
2. Do NOT use any prior knowledge, outside assumptions, or external facts not contained in the chunks.
3. If the provided context chunks do not contain enough information to answer the question, state EXACTLY: "The requested information was not found in the indexed documents."
4. Be concise, precise, professional, and clear.
5. Reference source files and page numbers where applicable when answering.`;

    const userPrompt = `=== RETRIEVED DOCUMENT CONTEXT ===
${formattedChunks}

=== USER QUESTION ===
${question}`;

    return {
      systemPrompt,
      userPrompt,
    };
  }
}
