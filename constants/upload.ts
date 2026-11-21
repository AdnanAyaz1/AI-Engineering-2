export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export const ALLOWED_FILE_ACCEPT = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const MAX_FILE_SIZE_LABEL = '25MB';

export const SUPPORTED_FORMAT_BADGES = [
  { ext: 'PDF', label: 'Adobe PDF (.pdf)', color: 'text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/10' },
  { ext: 'DOCX', label: 'Word (.docx)', color: 'text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/10' },
  { ext: 'TXT', label: 'Text (.txt)', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
] as const;

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
