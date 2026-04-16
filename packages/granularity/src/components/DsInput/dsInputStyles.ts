import { splitClassTokens } from '../shared/classTokens'

const base =
  'w-full rounded-md border bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:placeholder:text-transparent transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed'

const sizes = {
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
} as const

const textAlign = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const

const states = {
  default: 'border-[var(--brd)]',
  success: 'border-[var(--ds-success)] focus-visible:ring-[var(--ds-success)]',
  warning: 'border-[var(--ds-warning)] focus-visible:ring-[var(--ds-warning)]',
  danger: 'border-[var(--ds-danger)] focus-visible:ring-[var(--ds-danger)]',
} as const

const template = [
  'relative w-full',
  'absolute inset-y-0 left-0 flex items-center justify-center border-r border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate',
  'absolute inset-y-0 right-0 flex items-center justify-center border-l border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate',
]

export const dsInputSafelist = [...new Set([
  ...splitClassTokens(base),
  ...Object.values(sizes).flatMap(splitClassTokens),
  ...Object.values(textAlign).flatMap(splitClassTokens),
  ...Object.values(states).flatMap(splitClassTokens),
  ...template.flatMap(splitClassTokens),
])]