import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Search,
  BookOpen,
  FileText,
  Sparkles,
  Sliders,
  Clock,
  Layers,
  AlertCircle,
  Database,
  Bot,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { performSemanticSearchApi, SearchResponseData } from '@/api/search-api';
import { askRagQuestionApi, RagResponseData } from '@/api/rag-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type SearchMode = 'rag' | 'vector';

export function KnowledgeSearchPage() {
  const [mode, setMode] = useState<SearchMode>('rag');
  const [query, setQuery] = useState<string>('');
  const [topK, setTopK] = useState<number>(5);
  const [showContext, setShowContext] = useState<boolean>(true);

  const [ragResult, setRagResult] = useState<RagResponseData | null>(null);
  const [vectorResult, setVectorResult] = useState<SearchResponseData | null>(null);

  const ragMutation = useMutation({
    mutationFn: askRagQuestionApi,
    onSuccess: (data) => {
      setRagResult(data);
    },
  });

  const vectorMutation = useMutation({
    mutationFn: performSemanticSearchApi,
    onSuccess: (data) => {
      setVectorResult(data);
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (mode === 'rag') {
      ragMutation.mutate({
        question: query.trim(),
        topK,
      });
    } else {
      vectorMutation.mutate({
        query: query.trim(),
        topK,
      });
    }
  };

  const handleSuggestionClick = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    if (mode === 'rag') {
      ragMutation.mutate({
        question: suggestedQuery,
        topK,
      });
    } else {
      vectorMutation.mutate({
        query: suggestedQuery,
        topK,
      });
    }
  };

  const isPending = ragMutation.isPending || vectorMutation.isPending;
  const isError = ragMutation.isError || vectorMutation.isError;
  const errorMessage =
    ragMutation.error?.message || vectorMutation.error?.message || 'Search failed';

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto p-6 space-y-6 bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            <span>Knowledge Base RAG & Semantic Search</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Retrieve grounded answers using RAG (Retrieval-Augmented Generation) or explore Top-K
            vector chunks.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center rounded-xl bg-card p-1 border border-border shadow-xs">
          <button
            onClick={() => setMode('rag')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              mode === 'rag'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>AI Grounded Q&A (RAG)</span>
          </button>

          <button
            onClick={() => setMode('vector')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              mode === 'vector'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Vector Search</span>
          </button>
        </div>
      </div>

      {/* Search Input Header & Controls */}
      <Card className="p-6 space-y-4 shadow-sm border-border/80">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === 'rag'
                  ? "Ask a question about indexed documents (e.g., 'What is Rahul Jaggi's appointment date?')..."
                  : "Search across indexed document vectors (e.g., 'appointment terms and conditions')..."
              }
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isPending || !query.trim()}
              className="h-10 px-6 font-semibold gap-2 shadow-xs"
            >
              {isPending ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-primary-foreground" />
                  <span>
                    {mode === 'rag' ? 'Generating RAG Answer...' : 'Searching Vectors...'}
                  </span>
                </>
              ) : (
                <>
                  {mode === 'rag' ? <Bot className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                  <span>{mode === 'rag' ? 'Ask AI RAG' : 'Search Vectors'}</span>
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-3">
            <Sliders className="h-3.5 w-3.5 text-amber-500" />
            <label className="font-medium text-foreground flex items-center gap-2">
              <span>Top-K Context Chunks:</span>
              <span className="font-mono font-bold text-primary">{topK}</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-32 accent-primary cursor-pointer"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Try asking:</span>
            {[
              'What is Rahul Jaggi appointment date?',
              'What is the statutory deadline for POSH report?',
              'What is the salary in appointment letter?',
            ].map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestionClick(s)}
                className="rounded-lg bg-accent/60 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                "{s}"
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* RAG Mode Output Display */}
      {mode === 'rag' && (
        <div className="space-y-6">
          {ragMutation.isPending ? (
            <Card className="p-12 text-center space-y-4">
              <Bot className="h-10 w-10 text-primary mx-auto animate-bounce" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Generating Grounded RAG Answer...
                </p>
                <p className="text-xs text-muted-foreground">
                  Step 1: Vector Search in Qdrant (nomic-embed-text) ➔ Step 2: Context Grounding ➔
                  Step 3: LLM Completion (qwen2.5:7b)
                </p>
              </div>
            </Card>
          ) : !ragResult ? (
            <Card className="p-12 text-center space-y-3">
              <ShieldCheck className="h-10 w-10 text-emerald-500/40 mx-auto" />
              <p className="text-sm font-semibold text-foreground">Strict Grounded RAG Q&A Ready</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Ask any question above. The system will retrieve relevant chunks from Qdrant and
                answer strictly using verified document context.
              </p>
            </Card>
          ) : (
            <>
              {/* AI Answer Card */}
              <Card className="p-6 space-y-4 border-2 border-primary/40 bg-card shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400/20" />
                    <span>AI Generated Answer</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {/* Confidence Score Gauge */}
                    <div
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-xs border ${
                        ragResult.confidence >= 0.7
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : ragResult.confidence >= 0.4
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-destructive/10 text-destructive border-destructive/30'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{Math.round(ragResult.confidence * 100)}% Confidence</span>
                    </div>

                    <span className="font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{ragResult.executionTimeMs}ms</span>
                    </span>
                  </div>
                </div>

                {/* Answer Text */}
                <div className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap bg-accent/30 p-4 rounded-xl border border-border/40">
                  {ragResult.answer}
                </div>

                {/* Cited Sources List */}
                {ragResult.sources.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                      <span>Retrieved Sources ({ragResult.sources.length}):</span>
                    </span>

                    {ragResult.sources.map((src, idx) => (
                      <span
                        key={`${src.chunkId}-${idx}`}
                        className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 font-medium text-foreground border border-border/60"
                      >
                        <BookOpen className="h-3 w-3 text-amber-400" />
                        <span>
                          {src.filename} (Page {src.pageNumber})
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              {/* Expandable Retrieved Context Accordion */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="flex items-center justify-between w-full rounded-xl bg-card p-4 border border-border text-xs font-bold text-foreground hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>
                      Retrieved Document Context Chunks ({ragResult.retrievedChunks.length})
                    </span>
                  </div>

                  {showContext ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showContext && (
                  <div className="space-y-3 pl-2">
                    {ragResult.retrievedChunks.map((hit, idx) => (
                      <Card
                        key={hit.chunkId || idx}
                        className="p-4 space-y-2 text-xs border border-border/70"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary border border-primary/20">
                              Chunk #{hit.chunkIndex + 1}
                            </span>
                            <span className="font-semibold text-foreground">{hit.filename}</span>
                            <span className="text-muted-foreground">(Page {hit.pageNumber})</span>
                          </div>

                          <span className="font-mono text-emerald-400 font-semibold">
                            {(hit.score * 100).toFixed(1)}% Match
                          </span>
                        </div>

                        <div className="rounded-lg bg-background p-3 font-mono text-[11px] text-foreground leading-relaxed">
                          {hit.content}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Vector Mode Output Display */}
      {mode === 'vector' && (
        <div className="space-y-4">
          {vectorMutation.isPending ? (
            <Card className="p-12 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-primary mx-auto animate-spin" />
              <p className="text-sm font-semibold text-foreground">
                Querying Qdrant Vector Database...
              </p>
            </Card>
          ) : !vectorResult ? (
            <Card className="p-12 text-center space-y-3">
              <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                Vector Similarity Search Ready
              </p>
              <p className="text-xs text-muted-foreground">
                Search to view rank-ordered document chunks with cosine similarity scores.
              </p>
            </Card>
          ) : (
            vectorResult.results.map((hit, idx) => (
              <Card key={hit.chunkId || idx} className="p-5 space-y-3 border border-border/80">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 font-bold text-primary border border-primary/20">
                      Rank #{idx + 1}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 font-semibold text-foreground border border-border/60">
                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                      <span>{hit.filename}</span>
                    </span>
                    <span className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 font-medium text-muted-foreground border border-border/60">
                      <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                      <span>Page {hit.pageNumber}</span>
                    </span>
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{(hit.score * 100).toFixed(1)}% Similarity</span>
                  </span>
                </div>

                <div className="rounded-xl bg-card/80 p-4 border border-border/60 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {hit.content}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
