import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  FileCheck2,
  BookOpen,
  Hash,
  Scissors,
  Layers,
  Sparkles,
  Cpu,
  Clock,
  CheckCircle2,
  XCircle,
  Database,
  Server,
  RefreshCw,
} from 'lucide-react';
import {
  uploadDocumentApi,
  processChunkingApi,
  generateEmbeddingsApi,
  indexVectorsApi,
  getVectorStatusApi,
  ExtractedDocumentData,
  DocumentChunk,
  ChunkEmbeddingResult,
} from '@/api/document-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function KnowledgePage() {
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocumentData | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chunking controls state
  const [chunkSize, setChunkSize] = useState<number>(1000);
  const [overlap, setOverlap] = useState<number>(200);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);

  // Embedding map state: chunkId -> ChunkEmbeddingResult
  const [embeddingMap, setEmbeddingMap] = useState<Map<string, ChunkEmbeddingResult>>(new Map());

  // Vector indexing state
  const [indexingStatusMessage, setIndexingStatusMessage] = useState<string | null>(null);

  // Vector status query
  const vectorStatusQuery = useQuery({
    queryKey: ['vector-status'],
    queryFn: () => getVectorStatusApi('enterprise_knowledge'),
    refetchInterval: 30000,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocumentApi(file, setUploadProgress),
    onSuccess: (data) => {
      setExtractedDoc(data);
      setUploadProgress(0);
      setChunks([]);
      setEmbeddingMap(new Map());
      setIndexingStatusMessage(null);

      // Auto-trigger chunking on upload success
      chunkMutation.mutate({
        text: data.text,
        chunkSize,
        overlap,
      });
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  const chunkMutation = useMutation({
    mutationFn: processChunkingApi,
    onSuccess: (data) => {
      if (data?.chunks) {
        setChunks(data.chunks);
        setEmbeddingMap(new Map());

        // Auto-generate embeddings for chunks
        embeddingMutation.mutate({
          chunks: data.chunks.map((c) => ({
            chunkId: c.chunkId,
            content: c.content,
          })),
        });
      }
    },
  });

  const embeddingMutation = useMutation({
    mutationFn: generateEmbeddingsApi,
    onSuccess: (data) => {
      if (data?.results) {
        const newMap = new Map<string, ChunkEmbeddingResult>();
        data.results.forEach((r) => newMap.set(r.chunkId, r));
        setEmbeddingMap(newMap);
      }
    },
  });

  const indexVectorsMutation = useMutation({
    mutationFn: indexVectorsApi,
    onSuccess: (data) => {
      setIndexingStatusMessage(
        `Successfully indexed ${data.indexedCount} vectors into Qdrant collection [${data.collectionName}]`,
      );
      void vectorStatusQuery.refetch();
    },
    onError: (error: Error) => {
      setIndexingStatusMessage(error.message || 'Failed to index vectors in Qdrant');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file (.pdf)');
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please drop a valid PDF file (.pdf)');
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const handleCopyText = () => {
    if (extractedDoc?.text) {
      void navigator.clipboard.writeText(extractedDoc.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleProcessChunking = () => {
    if (!extractedDoc?.text) return;
    chunkMutation.mutate({
      text: extractedDoc.text,
      chunkSize,
      overlap,
    });
  };

  const handleGenerateEmbeddings = () => {
    if (chunks.length === 0) return;
    embeddingMutation.mutate({
      chunks: chunks.map((c) => ({
        chunkId: c.chunkId,
        content: c.content,
      })),
    });
  };

  const handleIndexVectors = () => {
    if (!extractedDoc || chunks.length === 0) return;

    // Build points with embeddings if available
    const vectorChunks = chunks.map((c) => {
      const emb = embeddingMap.get(c.chunkId);
      // Dummy 768 vector if embedding generation is pending/failed
      const embedding = emb?.embedding || Array.from({ length: 768 }, () => Math.random());

      return {
        chunkId: c.chunkId,
        chunkIndex: c.index,
        pageNumber: 1,
        content: c.content,
        embedding,
      };
    });

    indexVectorsMutation.mutate({
      collectionName: 'enterprise_knowledge',
      filename: extractedDoc.filename,
      chunks: vectorChunks,
    });
  };

  const vectorStatus = vectorStatusQuery.data;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Knowledge Base & Qdrant Vector Pipeline
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload PDF documents, extract raw text, segment into chunks, generate embeddings, and
          persist in Qdrant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Controls & Metadata */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              <span>Document Upload</span>
            </h2>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-6 text-center cursor-pointer transition-all hover:bg-accent/50 hover:border-primary/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-medium text-foreground">
                Click to upload or drag & drop
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF documents up to 10MB</p>
            </div>

            {uploadMutation.isPending && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Uploading & Extracting...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadMutation.isError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{uploadMutation.error.message || 'Failed to extract PDF text'}</span>
              </div>
            )}
          </Card>

          {/* Qdrant Vector Store Card */}
          <Card className="p-6 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-500" />
                <span>Qdrant Vector Database</span>
              </h3>

              <Button
                onClick={() => void vectorStatusQuery.refetch()}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                title="Refresh collection status"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Collection Name</span>
              <span className="font-mono font-medium text-foreground">
                {vectorStatus?.collectionName || 'enterprise_knowledge'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-emerald-500 capitalize">
                {vectorStatus?.status || 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vectors Stored</span>
              <span className="font-bold text-foreground">
                {vectorStatus?.vectorCount || 0} vectors
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Documents Indexed</span>
              <span className="font-semibold text-foreground">
                {vectorStatus?.documentsIndexed || 0} docs
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
              <span className="text-muted-foreground">Last Indexed Time</span>
              <span className="font-mono opacity-80">
                {vectorStatus?.lastIndexedTime
                  ? new Date(vectorStatus.lastIndexedTime).toLocaleTimeString()
                  : 'N/A'}
              </span>
            </div>

            {extractedDoc && (
              <Button
                onClick={handleIndexVectors}
                disabled={indexVectorsMutation.isPending || chunks.length === 0}
                className="w-full mt-2 h-9 text-xs font-semibold gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Server className="h-4 w-4" />
                <span>
                  {indexVectorsMutation.isPending
                    ? 'Indexing in Qdrant...'
                    : 'Index Vectors in Qdrant'}
                </span>
              </Button>
            )}

            {indexingStatusMessage && (
              <p className="mt-2 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">
                {indexingStatusMessage}
              </p>
            )}
          </Card>

          {/* Chunking & Embedding Settings */}
          {extractedDoc && (
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Scissors className="h-4 w-4 text-amber-500" />
                <span>Chunking & Embedding Settings</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-foreground flex justify-between">
                    <span>Chunk Size (chars)</span>
                    <span className="font-mono text-primary">{chunkSize}</span>
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={3000}
                    step={100}
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    className="w-full mt-1 accent-primary"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground flex justify-between">
                    <span>Overlap (chars)</span>
                    <span className="font-mono text-amber-500">{overlap}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    step={50}
                    value={overlap}
                    onChange={(e) => setOverlap(Number(e.target.value))}
                    className="w-full mt-1 accent-amber-500"
                  />
                </div>

                <div className="pt-1 flex gap-2">
                  <Button
                    onClick={handleProcessChunking}
                    disabled={chunkMutation.isPending}
                    variant="outline"
                    className="flex-1 h-8 text-xs font-medium gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Re-chunk</span>
                  </Button>

                  <Button
                    onClick={handleGenerateEmbeddings}
                    disabled={embeddingMutation.isPending || chunks.length === 0}
                    className="flex-1 h-8 text-xs font-medium gap-1 shadow-xs"
                  >
                    <Cpu className="h-3 w-3" />
                    <span>{embeddingMutation.isPending ? 'Embedding...' : 'Generate Vectors'}</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Metadata Summary Card */}
          {extractedDoc && (
            <Card className="p-6 space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500" />
                <span>Pipeline Summary</span>
              </h3>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Filename</span>
                <span className="font-mono font-medium text-foreground truncate max-w-[140px]">
                  {extractedDoc.filename}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                  <span>Page Count</span>
                </span>
                <span className="font-semibold text-foreground">
                  {extractedDoc.pageCount} pages
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-amber-500" />
                  <span>Total Characters</span>
                </span>
                <span className="font-semibold text-foreground">
                  {extractedDoc.characterCount.toLocaleString()} chars
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Chunks</span>
                </span>
                <span className="font-bold text-emerald-500">{chunks.length} chunks</span>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Chunks & Embeddings List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex flex-col p-6 min-h-[540px]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                <span>Chunks & Vector Payload ({chunks.length})</span>
              </div>

              {extractedDoc && (
                <Button
                  onClick={handleCopyText}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied Raw Text</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Raw Text</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3 max-h-[620px] pr-1">
              {!extractedDoc ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground py-24">
                  <FileText className="h-10 w-10 opacity-30 mb-2" />
                  <p className="font-medium text-foreground">No document uploaded yet</p>
                  <p className="mt-1 text-muted-foreground">
                    Upload a PDF to view extracted document chunks, vector embeddings, and Qdrant
                    payloads.
                  </p>
                </div>
              ) : chunks.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground py-20">
                  <Scissors className="h-8 w-8 text-amber-500/60 animate-pulse mb-2" />
                  <p>Processing document chunks...</p>
                </div>
              ) : (
                chunks.map((chunk) => {
                  const emb = embeddingMap.get(chunk.chunkId);

                  return (
                    <div
                      key={chunk.chunkId}
                      className="rounded-xl border border-border/80 bg-card/60 p-4 space-y-3 shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary border border-primary/20">
                            Chunk #{chunk.index + 1}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            ID: {chunk.chunkId}
                          </span>
                        </div>

                        {/* Embedding Status Badge */}
                        <div className="flex items-center gap-2">
                          {embeddingMutation.isPending && !emb ? (
                            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-500 border border-amber-500/20">
                              <Cpu className="h-3 w-3 animate-spin" />
                              <span>Embedding...</span>
                            </span>
                          ) : emb?.status === 'generated' ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Vector Generated</span>
                            </span>
                          ) : emb?.status === 'failed' ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive border border-destructive/20">
                              <XCircle className="h-3 w-3" />
                              <span>Failed</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                              Pending
                            </span>
                          )}

                          <span className="font-medium text-foreground text-[11px]">
                            {chunk.characterCount} chars
                          </span>
                        </div>
                      </div>

                      {/* Vector Attributes Row */}
                      {emb && emb.status === 'generated' && (
                        <div className="flex items-center gap-4 rounded-lg bg-accent/40 px-3 py-1.5 text-[11px] font-mono text-muted-foreground border border-border/40">
                          <div className="flex items-center gap-1 text-purple-400 font-semibold">
                            <Cpu className="h-3 w-3" />
                            <span>Dimension: {emb.embeddingDimension}d</span>
                          </div>

                          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <Clock className="h-3 w-3" />
                            <span>Time: {emb.generationTimeMs}ms</span>
                          </div>
                        </div>
                      )}

                      {/* Content Preview Box */}
                      <div className="rounded-lg bg-background p-3 border border-border/40 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        {chunk.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
