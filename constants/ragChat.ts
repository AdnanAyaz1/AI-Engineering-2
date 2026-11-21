export const DEFAULT_TOP_K = 5;

export const TOP_K_OPTIONS = [
  { value: 3, label: '3 chunks' },
  { value: 5, label: '5 chunks' },
  { value: 8, label: '8 chunks' },
  { value: 10, label: '10 chunks' },
] as const;

export const SAMPLE_PROMPTS = [
  'What are the test levels in a microservice ecosystem?',
  'Explain mutation testing and how Stryker is used.',
  'How do hermetic integration tests with Testcontainers work?',
] as const;
