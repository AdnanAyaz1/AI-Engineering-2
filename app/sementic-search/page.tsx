'use client';

import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import {
  SemanticSearchHeader,
  SemanticSearchForm,
  SemanticSearchResultsList,
} from '@/components/semantic-search';

export default function SemanticSearchPage() {
  const {
    query,
    topK,
    results,
    loading,
    error,
    searched,
    setQuery,
    setTopK,
    handleSearch,
    dismissError,
  } = useSemanticSearch();

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <SemanticSearchHeader />

        <SemanticSearchForm
          query={query}
          topK={topK}
          loading={loading}
          onQueryChange={setQuery}
          onTopKChange={setTopK}
          onSubmit={handleSearch}
        />

        <SemanticSearchResultsList
          results={results}
          loading={loading}
          searched={searched}
          error={error}
          onDismissError={dismissError}
        />
      </div>
    </main>
  );
}
