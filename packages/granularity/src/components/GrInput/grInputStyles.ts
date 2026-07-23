export const sizes = {
    xs: 'h-7 px-2.5 text-[12px]',
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-10 px-3 text-[14px]',
    lg: 'h-11 px-4 text-[16px]',
} as const

export const textAlign = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
} as const

export const states = {
    default: 'border-[var(--gr-brd)]',
    success: 'border-[var(--gr-success)] focus-visible:ring-[var(--gr-success)]',
    warning: 'border-[var(--gr-warning)] focus-visible:ring-[var(--gr-warning)]',
    danger: 'border-[var(--gr-danger)] focus-visible:ring-[var(--gr-danger)]',
} as const