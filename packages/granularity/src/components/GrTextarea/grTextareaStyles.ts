export type GrTextareaState = 'default' | 'success' | 'warning' | 'danger'

export const borderClassByState: Record<GrTextareaState, string> = {
  default: 'border-[var(--gr-brd)]',
  success: 'border-[var(--gr-success)] focus-visible:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-visible:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-visible:ring-[var(--gr-danger)]',
}

export function grTextareaClass(options: { state: GrTextareaState, invalid: boolean }): string {
  return options.invalid ? borderClassByState.danger : borderClassByState[options.state]
}
