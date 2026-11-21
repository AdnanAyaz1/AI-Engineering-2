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
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <SemanticSearchHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
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
      </main>
    </div>
  );
}
