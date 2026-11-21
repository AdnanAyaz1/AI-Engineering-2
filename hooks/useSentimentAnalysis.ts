'use client';

import { useState } from 'react';
import type { SentimentResult } from '@/types/sentiment';

export function useSentimentAnalysis() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setText('');
    setResult(null);
    setError(null);
  }

  function dismissError() {
    setError(null);
  }

  return {
    text,
    result,
    loading,
    error,
    setText,
    handleAnalyze,
    handleReset,
    dismissError,
  };
}
