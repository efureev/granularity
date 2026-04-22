import { splitClassTokens } from '../shared/classTokens'

const fileUploadClasses = [
  'inline-block',
  'relative w-full rounded-[var(--ds-radius-lg)] border border-dashed border-[var(--brd)] bg-[var(--card)] px-5 py-6 outline-none transition',
  'opacity-60 cursor-not-allowed',
  'cursor-pointer hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
  'border-[var(--ring)] bg-[var(--muted)]',
  'flex items-start gap-4',
  'h-12 w-12 shrink-0 rounded-[12px] bg-[var(--muted)] border border-[var(--brd)] flex items-center justify-center',
  'h-6 w-6 text-[var(--muted-fg)]',
  'min-w-0',
  'text-[14px] font-700',
  'mt-1 text-[13px] text-[var(--muted-fg)]',
  'mt-3 space-y-1',
  'font-600',
]

export const dsFileUploadSafelist = [...new Set([
  ...fileUploadClasses.flatMap(splitClassTokens),
])]