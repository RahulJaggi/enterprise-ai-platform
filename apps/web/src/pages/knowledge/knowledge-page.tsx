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
} from 'lucide-react';
import { uploadDocumentApi, ExtractedDocumentData } from '@/api/document-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function KnowledgePage() {
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocumentData | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocumentApi(file, setUploadProgress),
    onSuccess: (data) => {
      setExtractedDoc(data);
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
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

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Knowledge Base Ingestion
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload PDF documents to extract raw text and inspect document metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Column */}
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
              className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-8 text-center cursor-pointer transition-all hover:bg-accent/50 hover:border-primary/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
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

          {/* Metadata Card */}
          {extractedDoc && (
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500" />
                <span>Document Metadata</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Filename</span>
                  <span className="font-mono font-medium text-foreground truncate max-w-[160px]">
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

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-amber-500" />
                    <span>Character Count</span>
                  </span>
                  <span className="font-semibold text-foreground">
                    {extractedDoc.characterCount.toLocaleString()} chars
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Extracted Text Viewer Column */}
        <div className="lg:col-span-2">
          <Card className="flex h-full min-h-[460px] flex-col p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                <span>Extracted Text Content</span>
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
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="mt-4 flex-1 overflow-y-auto rounded-lg border border-border/50 bg-card/40 p-4">
              {extractedDoc ? (
                <pre className="font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {extractedDoc.text}
                </pre>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground py-16">
                  <FileText className="h-10 w-10 opacity-30 mb-2" />
                  <p>No document uploaded yet.</p>
                  <p className="mt-1">Upload a PDF to view extracted text and metadata.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
