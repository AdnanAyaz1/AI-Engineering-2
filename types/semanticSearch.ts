export interface SearchResult {
  id: number;
  title: string;
  content: string;
  score: number;
}

export interface UseSemanticSearchReturn {
  query: string;
  topK: number;
  results: SearchResult[];
  loading: boolean;
  error: string;
  searched: boolean;
  setQuery: (value: string) => void;
  setTopK: (value: number) => void;
  handleSearch: () => Promise<void>;
  dismissError: () => void;
}
