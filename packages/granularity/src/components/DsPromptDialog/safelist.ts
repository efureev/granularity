import { splitClassTokens } from '../shared/classTokens'

const promptClasses = [
  'grid gap-4',
  'text-[14px] text-[var(--muted-fg)]',
  'flex items-center justify-end gap-3',
]

export const dsPromptDialogSafelist = [...new Set([
  ...promptClasses.flatMap(splitClassTokens),
])]