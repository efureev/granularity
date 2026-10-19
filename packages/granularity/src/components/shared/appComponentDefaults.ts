import type { InjectionKey } from 'vue'

/**
 * Дефолтные пропсы приложения — `createGranularity({ componentDefaults })`.
 *
 * Ключ отдельным модулем: плагин `@feugene/granularity/vue` не тянет за собой
 * контекст конфига и рантайм режимов. `Symbol.for` — чтобы две копии модуля в
 * разных чанках давали один ключ.
 */
export const GR_APP_COMPONENT_DEFAULTS: InjectionKey<Readonly<Record<string, Readonly<Record<string, unknown>>>>>
  = Symbol.for('@feugene/granularity/app-component-defaults')
