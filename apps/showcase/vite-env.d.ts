/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

/**
 * Глобальные `$t`, `$i18n` и директива `v-t` от `fint-i18n`.
 *
 * Аугментация opt-in и подключается здесь, а не в `main.ts`: витрина ставит
 * плагин со стандартной регистрацией, и без этого импорта `vue-tsc` не знает
 * про `$t` — 83 ошибки в шаблонах на ровном месте.
 */
import '@feugene/fint-i18n/vue/global-types'

declare global {
  /**
   * Injected at build time from `packages/granularity/package.json`.
   *
   * Внутри `declare global`, потому что импорт выше делает файл модулем, и
   * `declare const` на верхнем уровне перестаёт быть глобальным объявлением.
   */
  const __GRANULARITY_VERSION__: string
}
