export type UploadStatus = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

export interface UploadResult {
  success: boolean;
  fileName: string;
  documentId: string;
  totalCharacters: number;
  totalChunks: number;
  embeddingDimensions: number;
  message: string;
}

export interface UseDocumentUploadReturn {
  file: File | null;
  status: UploadStatus;
  result: UploadResult | null;
  error: string | null;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (file: File) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  triggerFileInput: () => void;
  handleUpload: () => Promise<void>;
  handleReset: () => void;
  dismissError: () => void;
}
