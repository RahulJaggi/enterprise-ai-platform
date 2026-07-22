export interface DocumentChunk {
  chunkId: string;
  index: number;
  startOffset: number;
  endOffset: number;
  characterCount: number;
  content: string;
}

export interface ChunkOptions {
  chunkSize: number;
  overlap: number;
}

export interface IChunkStrategy {
  readonly strategyName: string;
  chunkText(text: string, options: ChunkOptions): DocumentChunk[];
}
