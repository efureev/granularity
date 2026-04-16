import { splitClassTokens } from '../shared/classTokens'

const dialogPanel = 'overflow-hidden rounded-[inherit] px-5 py-5'
const header = 'flex items-center justify-between gap-4 flex-1 min-w-0 text-[14px] font-700 border-b border-[var(--brd)] px-5 py-3'
const footer = 'border-t border-[var(--brd)] px-5 py-4'
const headerVariants = 'px-4 py-2 px-3 py-2 px-2 py-1'

export const dsDialogSafelist = [...new Set([
  ...splitClassTokens(dialogPanel),
  ...splitClassTokens(header),
  ...splitClassTokens(footer),
  ...splitClassTokens(headerVariants),
  'sr-only',
])]