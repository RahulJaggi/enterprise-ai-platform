export const VECTOR_PROVIDER_TOKEN = 'VECTOR_PROVIDER';

export interface VectorPoint {
  chunkId: string;
  documentId?: string;
  filename: string;
  pageNumber: number;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

export interface IndexingResult {
  collectionName: string;
  vectorCount: number;
  indexedCount: number;
  status: string;
}

export interface CollectionInfo {
  collectionName: string;
  status: string;
  vectorsCount: number;
  pointsCount: number;
}

export interface IVectorProvider {
  readonly providerName: string;
  ensureCollection(collectionName: string, vectorSize: number): Promise<void>;
  upsertVectors(collectionName: string, points: VectorPoint[]): Promise<IndexingResult>;
  getCollectionInfo(collectionName: string): Promise<CollectionInfo>;
}
