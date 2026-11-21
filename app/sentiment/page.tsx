
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Loader2 } from "lucide-react";

type SentimentResult = {
  success: boolean;
  text: string;
  sentiment: string;
  confidence: number;
  confidencePercentage: number;
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Analysis failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const isPositive = result?.sentiment === "POSITIVE";

  return (
    <main className="min-h-screen bg-slate-950 text-white px-5 py-16">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Studio</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
            Hugging Face · Transformers
          </span>
        </div>

        <div className="text-center mb-8">
          <div className="w-8 h-8 mx-auto rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 mb-3">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold mb-1.5 tracking-tight text-white">
            Sentiment Analysis
          </h1>

          <p className="text-slate-400 text-xs">
            Classify text polarity and confidence using a pre-trained transformer model.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <label className="block text-sm font-medium mb-3">
            Enter your text
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Example: I absolutely love this product. The experience has been amazing!"
            rows={6}
            maxLength={5000}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition-all resize-none shadow-inner text-sm"
          />

          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>English text</span>
            <span>{text.length}/5000</span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="w-full mt-5 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-2.5 font-medium transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze Sentiment</span>
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm mt-4">
              {error}
            </p>
          )}
        </div>

        {result && (
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-sm text-slate-400 mb-4">
              Analysis Result
            </p>

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-3xl font-bold ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}>
                  {result.sentiment}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Predicted sentiment
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold">
                  {result.confidencePercentage}%
                </p>
                <p className="text-sm text-slate-500">
                  Model confidence
                </p>
              </div>
            </div>

            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isPositive ? "bg-green-500" : "bg-red-500"
                }`}
                style={{
                  width: `${result.confidencePercentage}%`,
                }}
              />
            </div>

            <div className="mt-5 border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-500 mb-2">
                Analyzed text
              </p>
              <p className="text-sm text-slate-300">
                {result.text}
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-8">
          Powered by Hugging Face Transformers.js
        </p>

      </div>
    </main>
  );
}
