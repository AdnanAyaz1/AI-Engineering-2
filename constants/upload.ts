export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'] as const;

export const ALLOWED_FILE_ACCEPT = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const MAX_FILE_SIZE_LABEL = '25MB';

export const SUPPORTED_FORMAT_BADGES = [
  { ext: 'PDF', label: 'Adobe PDF (.pdf)', color: 'text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/10' },
  { ext: 'DOCX', label: 'Word (.docx)', color: 'text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/10' },
  { ext: 'TXT', label: 'Text (.txt)', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
] as const;
