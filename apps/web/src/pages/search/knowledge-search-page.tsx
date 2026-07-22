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
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { performSemanticSearchApi, SearchResponseData } from '@/api/search-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function KnowledgeSearchPage() {
  const [query, setQuery] = useState<string>('');
  const [topK, setTopK] = useState<number>(5);
  const [searchResults, setSearchResults] = useState<SearchResponseData | null>(null);

  const searchMutation = useMutation({
    mutationFn: performSemanticSearchApi,
    onSuccess: (data) => {
      setSearchResults(data);
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    searchMutation.mutate({
      query: query.trim(),
      topK,
    });
  };

  const handleSuggestionClick = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    searchMutation.mutate({
      query: suggestedQuery,
      topK,
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto p-6 space-y-6 bg-background">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          <span>Knowledge Base Semantic Search</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perform high-performance vector similarity search over indexed PDF document chunks using
          Cosine distance in Qdrant.
        </p>
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
              placeholder="Search across indexed documents (e.g., 'system architecture overview')..."
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={searchMutation.isPending || !query.trim()}
              className="h-10 px-6 font-semibold gap-2 shadow-xs"
            >
              {searchMutation.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-primary-foreground" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search Vectors</span>
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-3">
            <Sliders className="h-3.5 w-3.5 text-amber-500" />
            <label className="font-medium text-foreground flex items-center gap-2">
              <span>Top-K Results:</span>
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
            <span className="font-medium">Try searching:</span>
            {['Architecture overview', 'Embedding pipeline', 'Qdrant vector store'].map((s) => (
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

      {/* Results Header / Metrics */}
      {searchResults && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>
              Found {searchResults.totalMatches} matching chunks for query "{searchResults.query}"
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{searchResults.executionTimeMs}ms</span>
            </span>

            <span className="flex items-center gap-1 text-purple-400">
              <Database className="h-3.5 w-3.5" />
              <span>Qdrant Cosine Metric</span>
            </span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {searchMutation.isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{searchMutation.error.message || 'Semantic search failed'}</span>
        </div>
      )}

      {/* Search Results List */}
      <div className="space-y-4">
        {searchMutation.isPending ? (
          <Card className="p-12 text-center space-y-3">
            <Sparkles className="h-8 w-8 text-primary mx-auto animate-spin" />
            <p className="text-sm font-semibold text-foreground">
              Generating query vector embedding & querying Qdrant...
            </p>
            <p className="text-xs text-muted-foreground">
              Running nomic-embed-text embedding model
            </p>
          </Card>
        ) : !searchResults ? (
          <Card className="p-12 text-center space-y-3">
            <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm font-semibold text-foreground">Ready for Semantic Search</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Enter a search prompt above to find the Top-{topK} most relevant document chunks
              rank-ordered by vector cosine similarity.
            </p>
          </Card>
        ) : searchResults.results.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-amber-500/40 mx-auto" />
            <p className="text-sm font-semibold text-foreground">No matching chunks found</p>
            <p className="text-xs text-muted-foreground">
              Ensure PDF documents have been uploaded and indexed into the Qdrant vector database.
            </p>
          </Card>
        ) : (
          searchResults.results.map((hit, idx) => {
            const similarityPercent = (hit.score * 100).toFixed(1);

            return (
              <Card
                key={`${hit.chunkId}-${idx}`}
                className="p-5 space-y-3 border border-border/80 shadow-2xs hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Left: Rank & File Info Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 font-bold text-primary border border-primary/20">
                      Rank #{idx + 1}
                    </span>

                    {/* Highlighted Filename */}
                    <span className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 font-semibold text-foreground border border-border/60">
                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                      <span>{hit.filename}</span>
                    </span>

                    {/* Highlighted Page Number */}
                    <span className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 font-medium text-muted-foreground border border-border/60">
                      <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                      <span>Page {hit.pageNumber}</span>
                    </span>

                    <span className="font-mono text-[11px] text-muted-foreground">
                      Chunk #{hit.chunkIndex + 1} ({hit.chunkId})
                    </span>
                  </div>

                  {/* Right: Similarity Score Badge */}
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{similarityPercent}% Similarity</span>
                    <span className="font-mono opacity-60 text-[10px]">({hit.score})</span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="rounded-xl bg-card/80 p-4 border border-border/60 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {hit.content}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
