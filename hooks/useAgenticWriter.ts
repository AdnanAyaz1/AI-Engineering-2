'use client';

import { useState, useCallback } from 'react';
import type {
  AgenticStatus,
  HumanReviewData,
  PipelineApiResponse,
  IterationRecord,
  TokenUsageBreakdown,
} from '@/types/agenticWriter';

export function useAgenticWriter() {
  const [status, setStatus] = useState<AgenticStatus>('idle');
  const [task, setTask] = useState<string>('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [humanReviewData, setHumanReviewData] = useState<HumanReviewData | null>(null);
  const [completedData, setCompletedData] = useState<PipelineApiResponse | null>(null);
  const [history, setHistory] = useState<IterationRecord[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startPipeline = useCallback(async (inputTask: string) => {
    const trimmed = inputTask.trim();
    if (!trimmed) {
      setError('Please provide a task description.');
      return;
    }

    setStatus('starting');
    setError(null);
    setTask(trimmed);
    setThreadId(null);
    setCompletedData(null);
    setHumanReviewData(null);
    setHistory([]);
    setTokenUsage(null);

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: trimmed }),
      });

      let data: PipelineApiResponse;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText || 'Non-JSON response'}`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to start agentic pipeline.');
      }

      if (data.threadId) {
        setThreadId(data.threadId);
      }

      if (data.history) {
        setHistory(data.history);
      }

      if (data.tokenUsage) {
        setTokenUsage(data.tokenUsage);
      }

      if (data.status === 'awaiting_human') {
        setHumanReviewData(data.humanReview ?? null);
        setStatus('awaiting_human');
      } else if (data.status === 'completed') {
        setCompletedData(data);
        setStatus('completed');
      } else {
        throw new Error(`Unexpected pipeline status received: ${(data as { status?: string }).status}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setStatus('error');
    }
  }, []);

  const resumePipeline = useCallback(
    async (action: 'approve' | 'improve', feedback?: string) => {
      if (!threadId) {
        setError('No active threadId found to resume.');
        setStatus('error');
        return;
      }

      if (action === 'improve' && (!feedback || !feedback.trim())) {
        setError('Feedback is required when requesting improvements.');
        return;
      }

      setStatus('resuming');
      setError(null);

      try {
        const response = await fetch('/api/test/resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId,
            action,
            feedback: action === 'improve' ? feedback?.trim() : undefined,
          }),
        });

        let data: PipelineApiResponse;
        try {
          data = await response.json();
        } catch {
          throw new Error(`Server returned HTTP ${response.status}: ${response.statusText || 'Non-JSON response'}`);
        }

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to resume agentic pipeline.');
        }

        if (data.history) {
          setHistory(data.history);
        }

        if (data.tokenUsage) {
          setTokenUsage(data.tokenUsage);
        }

        if (data.status === 'awaiting_human') {
          setHumanReviewData(data.humanReview ?? null);
          setStatus('awaiting_human');
        } else if (data.status === 'completed') {
          setCompletedData(data);
          setStatus('completed');
        } else {
          throw new Error(`Unexpected resume status received: ${(data as { status?: string }).status}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
        // Keep awaiting_human state active if we still have a paused thread so user feedback is not discarded
        if (humanReviewData) {
          setStatus('awaiting_human');
        } else {
          setStatus('error');
        }
      }
    },
    [threadId, humanReviewData],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setTask('');
    setThreadId(null);
    setHumanReviewData(null);
    setCompletedData(null);
    setHistory([]);
    setTokenUsage(null);
    setError(null);
  }, []);

  return {
    status,
    task,
    threadId,
    humanReviewData,
    completedData,
    history,
    tokenUsage,
    error,
    startPipeline,
    resumePipeline,
    reset,
  };
}
