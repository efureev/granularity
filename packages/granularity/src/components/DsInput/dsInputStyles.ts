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
    default: 'border-[var(--brd)]',
    success: 'border-[var(--ds-success)] focus-visible:ring-[var(--ds-success)]',
    warning: 'border-[var(--ds-warning)] focus-visible:ring-[var(--ds-warning)]',
    danger: 'border-[var(--ds-danger)] focus-visible:ring-[var(--ds-danger)]',
} as const