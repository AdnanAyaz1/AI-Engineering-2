'use client';

import { useState } from 'react';
import { DEFAULT_SEARCH_TOP_K } from '@/constants/semanticSearch';
import type { SearchResult, UseSemanticSearchReturn } from '@/types/semanticSearch';

export function useSemanticSearch(): UseSemanticSearchReturn {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState<number>(DEFAULT_SEARCH_TOP_K);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const dismissError = () => {
    setError('');
  };

  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError('');
    setResults([]);
    setSearched(false);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          topK,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
