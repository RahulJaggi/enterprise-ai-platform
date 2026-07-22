import { Injectable, Inject, Logger } from '@nestjs/common';
import { AI_PROVIDER_TOKEN, IAiProvider } from '../../providers/ollama/ollama.interface';
import { SearchService } from '../search/search.service';
import { PromptBuilderService } from './prompt-builder.service';
import { CitationService } from './citation.service';
import { RagRequestDto } from './dto/rag-request.dto';
import { RagResponseDataDto } from './dto/rag-response.dto';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly minRelevanceThreshold = 0.25;

  constructor(
    @Inject(AI_PROVIDER_TOKEN)
    private readonly aiProvider: IAiProvider,
    private readonly searchService: SearchService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly citationService: CitationService,
  ) {}

  async answerQuestion(dto: RagRequestDto): Promise<RagResponseDataDto> {
    const startTime = Date.now();
    const topK = dto.topK || 5;

    this.logger.log(`[RAG Pipeline Started] Question: [${dto.question}] | Top-K: ${topK}`);

    // Step 1: Perform Semantic Vector Search to retrieve Top-K chunks
    const searchResponse = await this.searchService.searchSemanticChunks({
      query: dto.question,
      topK,
      collectionName: dto.collectionName,
    });

    const retrievedChunks = searchResponse.results;
    const topScore = retrievedChunks[0]?.score || 0;

    // Step 2: Check relevance threshold - if no chunks or top score < threshold, return fallback answer
    if (retrievedChunks.length === 0 || topScore < this.minRelevanceThreshold) {
      this.logger.warn(
        `[RAG Fallback] Retrieved chunks below threshold (${topScore} < ${this.minRelevanceThreshold}). Returning fallback response.`,
      );

      return {
        question: dto.question,
        answer:
          'I apologize, but the requested information was not found in the indexed documents.',
        confidence: 0,
        sources: [],
        retrievedChunks: [],
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Step 3: Extract distinct citations & calculate confidence score
    const sources = this.citationService.extractCitations(
      retrievedChunks.map((c) => ({
        score: c.score,
        chunkId: c.chunkId,
        documentId: c.documentId,
        filename: c.filename,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        content: c.content,
      })),
    );

    const confidence = this.citationService.calculateConfidence(
      retrievedChunks.map((c) => ({
        score: c.score,
        chunkId: c.chunkId,
        documentId: c.documentId,
        filename: c.filename,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        content: c.content,
      })),
    );

    // Step 4: Build grounded RAG prompt context
    const formattedPrompt = this.promptBuilderService.buildRagPrompt(
      dto.question,
      retrievedChunks.map((c) => ({
        score: c.score,
        chunkId: c.chunkId,
        documentId: c.documentId,
        filename: c.filename,
        pageNumber: c.pageNumber,
        chunkIndex: c.chunkIndex,
        content: c.content,
      })),
    );

    // Step 5: Send prompt to existing Ollama AI Chat Provider (qwen2.5:7b)
    const completionResult = await this.aiProvider.generateCompletion({
      prompt: formattedPrompt.userPrompt,
      systemPrompt: formattedPrompt.systemPrompt,
    });

    const executionTimeMs = Date.now() - startTime;
    this.logger.log(
      `[RAG Pipeline Completed] Answer generated in ${executionTimeMs}ms (Confidence: ${confidence * 100}%, Sources: ${sources.length})`,
    );

    return {
      question: dto.question,
      answer: completionResult.text.trim(),
      confidence,
      sources,
      retrievedChunks,
      executionTimeMs,
    };
  }
}
