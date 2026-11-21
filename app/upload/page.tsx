'use client';

import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import {
  UploadHeader,
  UploadDropzone,
  UploadSelectedFile,
  UploadSuccessCard,
  UploadErrorBanner,
} from '@/components/upload';

export default function DocumentUploadPage() {
  const {
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
  } = useDocumentUpload();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <UploadHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <UploadErrorBanner error={error} onDismiss={dismissError} />

        {status === 'success' && result ? (
          <UploadSuccessCard
            result={result}
            onUploadAnother={handleReset}
          />
        ) : file ? (
          <UploadSelectedFile
            file={file}
            status={status}
            onUpload={handleUpload}
            onReset={handleReset}
          />
        ) : (
          <UploadDropzone
            isDragging={isDragging}
            fileInputRef={fileInputRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            onTriggerInput={triggerFileInput}
          />
        )}
      </main>
    </div>
  );
}
