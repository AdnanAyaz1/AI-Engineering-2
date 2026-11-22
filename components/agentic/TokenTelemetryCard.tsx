'use client';

import { Coins, Zap, Layers } from 'lucide-react';
import type { TokenUsageBreakdown } from '@/types/agenticWriter';

interface TokenTelemetryCardProps {
  usage: TokenUsageBreakdown | null;
}

export function TokenTelemetryCard({ usage }: TokenTelemetryCardProps) {
  if (!usage) return null;

  const writer = usage.agents?.writer;
  const review = usage.agents?.review;
  const total = usage.pipelineTotal;

  const formatCost = (usd?: number) => {
    if (usd === undefined) return '$0.0000';
    return `$${usd.toFixed(4)}`;
  };

  const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    return num.toLocaleString();
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Agent Token & Cost Telemetry
            </h4>
            <span className="text-[10px] text-zinc-400">
              Model: Groq openai/gpt-oss-120b ($0.15 / $0.60 per 1M tokens)
            </span>
          </div>
        </div>

        {total && (
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-400 block">
              Total Cost
            </span>
            <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCost(total.costUSD)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Writer Agent Usage */}
        <div className="p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-teal-500" />
              Writer Agent
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {formatCost(writer?.costUSD)}
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Input Tokens:</span>
              <span className="text-zinc-800 dark:text-zinc-200">{formatNumber(writer?.inputTokens)}</span>
            </div>
            <div className="flex justify-between">
              <span>Output Tokens:</span>
              <span className="text-zinc-800 dark:text-zinc-200">{formatNumber(writer?.outputTokens)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
              <span>Total Tokens:</span>
              <span>{formatNumber(writer?.totalTokens)}</span>
            </div>
          </div>
        </div>

        {/* Reviewer Agent Usage */}
        <div className="p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-purple-500" />
              Reviewer Agent
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {formatCost(review?.costUSD)}
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Input Tokens:</span>
              <span className="text-zinc-800 dark:text-zinc-200">{formatNumber(review?.inputTokens)}</span>
            </div>
            <div className="flex justify-between">
              <span>Output Tokens:</span>
              <span className="text-zinc-800 dark:text-zinc-200">{formatNumber(review?.outputTokens)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
              <span>Total Tokens:</span>
              <span>{formatNumber(review?.totalTokens)}</span>
            </div>
          </div>
        </div>

        {/* Combined Pipeline Total */}
        <div className="p-3.5 rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/30 dark:bg-teal-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              Pipeline Total
            </span>
            <span className="text-[11px] font-mono font-bold text-teal-700 dark:text-teal-300">
              {formatCost(total?.costUSD)}
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Input Tokens:</span>
              <span className="text-zinc-800 dark:text-zinc-200">{formatNumber(total?.inputTokens)}</span>
            </div>
            <div className="flex justify-between">
              <span>Output Tokens:</span>
              <span className="text-zinc-800 dark:text-zinc-200">{formatNumber(total?.outputTokens)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-teal-200/80 dark:border-teal-800/60 font-semibold text-teal-900 dark:text-teal-100">
              <span>Total Tokens:</span>
              <span>{formatNumber(total?.totalTokens)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
