
"use client";

import { useState } from "react";

interface SearchResult {
  id: number;
  title: string;
  content: string;
  score: number;
}

export default function SemanticSearchPage() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(3);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);
    setSearched(false);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          topK,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.results);
      setSearched(true);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <p className="text-sm text-blue-400 mb-3">
            EMBEDDINGS / EXPERIMENT 01
          </p>

          <h1 className="text-4xl font-bold mb-3">
            Semantic Search
          </h1>

          <p className="text-zinc-400">
            Search documents using meaning, not just keywords.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">

          <label className="block text-sm text-zinc-300 mb-3">
            Your search query
          </label>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I forgot my password and cannot access my account..."
            className="w-full min-h-32 resize-y bg-zinc-950 border border-zinc-800 rounded-lg p-4 outline-none focus:border-blue-500 text-white placeholder:text-zinc-600"
          />

          <div className="flex items-center justify-between mt-4 gap-4">

            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-400">
                Results:
              </label>

              <select
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>

          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-lg border border-red-800 bg-red-950/30 text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-10 text-center text-zinc-400">
            Generating query embedding and comparing documents...
          </div>
        )}

        {searched && (
          <section className="mt-10">

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">
                Search Results
              </h2>

              <span className="text-sm text-zinc-500">
                {results.length} documents found
              </span>
            </div>

            {results.map((result, index) => (
              <div
                key={result.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4"
              >
                <div className="flex justify-between items-start gap-4 mb-3">

                  <div>
                    <p className="text-xs text-zinc-500 mb-1">
                      RESULT #{index + 1}
                    </p>

                    <h3 className="font-semibold text-white">
                      {result.title}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-blue-400">
                      {(result.score * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-zinc-500">
                      Similarity
                    </p>
                  </div>

                </div>

                <p className="text-sm text-zinc-400 leading-relaxed">
                  {result.content}
                </p>

                <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, result.score * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <p className="text-zinc-500">
                No documents returned.
              </p>
            )}

          </section>
        )}

        {!searched && !loading && !error && (
          <div className="mt-10 text-center text-zinc-600">
            Your search results will appear here.
          </div>
        )}

      </div>
    </main>
  );
}
