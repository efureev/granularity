import { splitClassTokens } from '../shared/classTokens'

const sidebarClasses = [
  'border-r border-[var(--sidebar-brd)] bg-[var(--sidebar)] text-[var(--sidebar-fg)]',
  'border-b border-[var(--sidebar-brd)] px-4 py-4',
  'text-[14px] ds-muted',
  'text-[18px] font-700',
  'p-3',
]

export const dsSidebarSafelist = [...new Set([
  ...sidebarClasses.flatMap(splitClassTokens),
])]