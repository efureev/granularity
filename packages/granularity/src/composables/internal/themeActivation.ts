/**
 * Тема, чьи пары пишет рантайм пакета. Тему сборки рантайм у granum не
 * спрашивает: в каталоге `@feugene/granularity-tokens` она одна.
 */
export const GR_THEME_ID = 'slate'

/**
 * Значение `data-theme`: имя режима (`dark`) становится парой `slate-dark`,
 * пара (`slate-dark`) остаётся как есть — в имени режима дефиса не бывает.
 */
export function themeActivationValue(value: string): string {
  return value.includes('-') ? value : `${GR_THEME_ID}-${value}`
}
