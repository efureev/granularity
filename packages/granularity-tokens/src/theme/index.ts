/**
 * Сборка тем — `@feugene/granularity-tokens/theme`.
 *
 * `defineTheme` строит тему дизайн-системы целиком: корень, режимы, проверка
 * полноты и контраста, фолбэки. `extendTheme`/`createTheme` строят один набор
 * ролей под селектором — уровень режима. Чистые функции без `node:`: работают и
 * в браузере. Тема из папки — `@feugene/granularity-tokens/theme/node`,
 * подключение готового CSS в браузере — `@feugene/granularity-tokens/theme/apply`.
 *
 * Документация: `themes/README.md` пакета.
 */

export { defineTheme, GrThemeDefinitionError, NO_COLOR_MIX } from './defineTheme'
export { resolveModes } from '../modes'
export type { DefineThemeInput, DefineThemeOptions, GrModeInput } from './defineTheme'
export { createTheme, extendTheme, GrThemeError, renderThemeCss } from './extendTheme'
export type { ExtendThemeOptions, GrTheme } from './extendTheme'
export { GrToneError, tone } from './tone'
export type { ToneOptions, ToneRole } from './tone'
export { validateTheme } from './validate'
export type { GrThemeIssue } from './validate'
export { resolveRole, themeRoleNames } from './roles'
export type { GrThemeTokens } from './roles'
export { contrast, deltaE, luminance, mixSrgb, parseHex, toHex, toLab } from './color'
export type { Rgb } from './color'
export type { GrBuiltinMode } from './builtin.generated'
