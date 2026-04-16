import { splitClassTokens } from '../shared/classTokens'

const confirmDialogClasses = [
  'text-[14px] text-[var(--muted-fg)]',
  'flex items-center justify-end gap-3',
]

export const dsConfirmDialogSafelist = [...new Set([
  ...confirmDialogClasses.flatMap(splitClassTokens),
])]