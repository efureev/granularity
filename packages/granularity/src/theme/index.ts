/**
 * Композиция тем — `@feugene/granularity/theme`.
 *
 * Тема объявляет только то, что меняет: остальное приезжает из базы, а не из
 * `:root` (то есть не из светлой темы, как было бы у CSS-файла с пропущенной
 * ролью). Роль, добавленная пакетом завтра, попадёт в собранную тему сама.
 *
 * Точка входа сборочная: она тянет справочник токенов, и место ей в скрипте
 * или конфиге, а не в бандле приложения. Подключение готового CSS в браузере —
 * `@feugene/granularity/theme/apply`.
 *
 * Документация: `docs/theming.md`.
 */

export { extendTheme, GrThemeError, renderThemeCss } from './extendTheme'
export type { ExtendThemeOptions, GrTheme } from './extendTheme'
export { GrToneError, tone } from './tone'
export type { ToneOptions } from './tone'
export { validateTheme } from './validate'
export type { GrThemeIssue } from './validate'
export { resolveRole, themeRoleNames } from './roles'
export type { GrThemeTokens } from './roles'
export { contrast, deltaE, mixSrgb } from './color'
