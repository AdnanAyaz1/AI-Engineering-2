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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans px-4 sm:px-6 py-12">
      <div className="max-w-4xl mx-auto">
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
