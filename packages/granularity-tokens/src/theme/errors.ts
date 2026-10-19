import type { GrThemeIssue } from './validate'

/** Тема или режим не прошли проверку цвета: контраст по WCAG или различимость тонов. */
export class GrThemeError extends Error {
  issues: GrThemeIssue[]

  constructor(name: string, issues: GrThemeIssue[]) {
    super([
      `тема "${name}" не проходит проверку:`,
      ...issues.map(issue => `  • ${issue.message}`),
    ].join('\n'))

    this.name = 'GrThemeError'
    this.issues = issues
  }
}

/** Ошибка формы или полноты темы — в отличие от `GrThemeError`, не про цвет. */
export class GrThemeDefinitionError extends Error {
  readonly code: 'invalid-theme-id' | 'invalid-mode-name' | 'unknown-token' | 'theme-incomplete' | 'mode-extends-unresolved' | 'mode-extends-cycle' | 'theme-extends-unresolved'

  constructor(code: GrThemeDefinitionError['code'], message: string) {
    super(message)
    this.name = 'GrThemeDefinitionError'
    this.code = code
  }
}

export const THEME_ID = /^[a-z][a-z0-9-]*$/
// Без дефиса: пара `<тема>-<режим>` на корне разбирается по последнему дефису.
export const MODE_NAME = /^[a-z][a-z0-9]*$/
