/**
 * Тестовые утилиты пакета — `@feugene/granularity/testing`.
 *
 * Ни `vitest`, ни `@vue/test-utils` здесь нет и не будет: утилиты отдают данные
 * и действия над DOM, а монтирует и утверждает потребитель — своим раннером.
 * Документация: `docs/testing.md`.
 */

export { cancelPointer, drag, move, pointer, press, release } from './pointer'
export { composingKeydown, keyboardEvent, type KeyboardEventOptions, keydown } from './keyboard'
export { mockRect, type MockRect, stackRects, type StackRectsOptions } from './geometry'
export { resetGranularityDom, stubMatchMedia, type StubMatchMediaOptions } from './env'
export { granularityGlobal, type GranularityGlobalOptions, i18nAdapter, type I18nAdapterOptions } from './context'
export { announced } from './announcer'
