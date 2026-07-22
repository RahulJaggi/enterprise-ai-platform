import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
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
} from 'lucide-react';
import {
  uploadDocumentApi,
  processChunkingApi,
  ExtractedDocumentData,
  DocumentChunk,
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

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocumentApi(file, setUploadProgress),
    onSuccess: (data) => {
      setExtractedDoc(data);
      setUploadProgress(0);
      setChunks([]);
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
      }
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

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Knowledge Base & Chunking Engine
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload PDF documents, extract raw text, and segment text into fixed-size overlapping
          chunks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Upload & Config Controls */}
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

          {/* Chunking Configuration Card */}
          {extractedDoc && (
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Scissors className="h-4 w-4 text-amber-500" />
                <span>Chunking Configuration</span>
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

                <Button
                  onClick={handleProcessChunking}
                  disabled={chunkMutation.isPending}
                  className="w-full mt-2 h-9 text-xs font-medium gap-1.5 shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{chunkMutation.isPending ? 'Processing...' : 'Re-chunk Document'}</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Metadata Card */}
          {extractedDoc && (
            <Card className="p-6 space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500" />
                <span>Document Summary</span>
              </h3>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Filename</span>
                <span className="font-mono font-medium text-foreground truncate max-w-[150px]">
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
                  <span>Generated Chunks</span>
                </span>
                <span className="font-bold text-emerald-500">{chunks.length} chunks</span>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Chunks & Text Flow View */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex flex-col p-6 min-h-[540px]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                <span>Document Chunks ({chunks.length})</span>
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
                    Upload a PDF to view extracted document chunks and metadata.
                  </p>
                </div>
              ) : chunks.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground py-20">
                  <Scissors className="h-8 w-8 text-amber-500/60 animate-pulse mb-2" />
                  <p>Processing chunks...</p>
                </div>
              ) : (
                chunks.map((chunk) => (
                  <div
                    key={chunk.chunkId}
                    className="rounded-xl border border-border/80 bg-card/60 p-4 space-y-2 shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary border border-primary/20">
                          Chunk #{chunk.index + 1}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          ID: {chunk.chunkId}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {chunk.characterCount} chars
                        </span>
                        <span className="font-mono opacity-80">
                          Offsets: [{chunk.startOffset} - {chunk.endOffset}]
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-background p-3 border border-border/40 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {chunk.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
