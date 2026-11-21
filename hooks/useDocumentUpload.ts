'use client';

import { useState, useRef } from 'react';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  type AllowedExtension,
} from '@/constants/upload';
import type { UploadResult, UploadStatus, UseDocumentUploadReturn } from '@/types/upload';

export function useDocumentUpload(): UseDocumentUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateFile = (candidate: File): string | null => {
    const ext = candidate.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext as AllowedExtension)) {
      return `Unsupported file format ".${ext || 'unknown'}". Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}.`;
    }

    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds maximum allowed size of ${MAX_FILE_SIZE_LABEL}. Selected file is ${(candidate.size / (1024 * 1024)).toFixed(1)}MB.`;
    }

    if (candidate.size === 0) {
      return 'The selected file is empty.';
    }

    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setResult(null);

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setStatus('error');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setStatus('selected');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const dismissError = () => {
    setError(null);
    if (status === 'error') {
      setStatus(file ? 'selected' : 'idle');
    }
  };

  const handleUpload = async () => {
    if (!file || status === 'uploading') return;

    setStatus('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/loader', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document');
      }

      setResult(data as UploadResult);
      setStatus('success');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during upload.');
      setStatus('error');
    }
  };

  return {
    file,
    status,
    result,
    error,
    isDragging,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    triggerFileInput,
    handleUpload,
    handleReset,
    dismissError,
  };
}
