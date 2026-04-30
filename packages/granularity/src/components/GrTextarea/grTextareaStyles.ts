export type GrTextareaState = 'default' | 'success' | 'warning' | 'danger'

export const borderClassByState: Record<GrTextareaState, string> = {
  default: 'border-[var(--brd)]',
  success: 'border-[var(--ds-success)] focus-visible:ring-[var(--ds-success)]',
  warning: 'border-[var(--ds-warning)] focus-visible:ring-[var(--ds-warning)]',
  danger: 'border-[var(--ds-danger)] focus-visible:ring-[var(--ds-danger)]',
}

export function grTextareaClass(options: { state: GrTextareaState, invalid: boolean }): string {
  return options.invalid ? borderClassByState.danger : borderClassByState[options.state]
}
