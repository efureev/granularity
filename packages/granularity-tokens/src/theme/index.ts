/**
 * Сборка тем — `@feugene/granularity-tokens/theme`.
 *
 * `defineTheme` строит тему дизайн-системы целиком: корень, режимы, проверка
 * полноты и контраста, фолбэки. `extendMode`/`createMode` строят один режим:
 * полный набор ролей, CSS под его парой и вход `modes.define` granum. Чистые функции без `node:`: работают и
 * в браузере. Тема из папки — `@feugene/granularity-tokens/theme/node`,
 * подключение готового CSS в браузере — `@feugene/granularity-tokens/theme/apply`.
 *
 * Документация: `themes/README.md` пакета.
 */

export { defineTheme, NO_COLOR_MIX } from './defineTheme'
export { resolveModes } from '../modes'
export type { DefineThemeInput, DefineThemeOptions, GrModeInput } from './defineTheme'
export { GrThemeDefinitionError, GrThemeError } from './errors'
export { createMode, extendMode, renderModeCss } from './mode'
export type { CreateModeOptions, ExtendModeOptions, GrMode, GrModeBase, GrModeDefinition, GrThemeModeRef } from './mode'
export { GrToneError, tone } from './tone'
export type { ToneOptions, ToneRole } from './tone'
export { validateTheme } from './validate'
export type { GrThemeIssue } from './validate'
export { resolveRole, themeRoleNames } from './roles'
export type { GrThemeTokens } from './roles'
export { contrast, deltaE, luminance, mixSrgb, parseHex, toHex, toLab } from './color'
export type { Rgb } from './color'
export { GR_BUILTIN_THEME } from './builtin.generated'
export type { GrBuiltinMode } from './builtin.generated'
