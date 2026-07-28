/**
 * Проверка контракта `componentDefaults` со стороны **потребителя пакета**.
 *
 * Смысл файла — не рантайм, а типы. Приложение импортирует `@feugene/granularity`
 * через subpath-экспорты, то есть резолвится в опубликованные `dist/types/**`,
 * а не в исходники (в `tsconfig.json` намеренно нет `paths` на `src`). Если
 * declaration merging из `GrButton/defaults.ts` не долетает до потребителя,
 * реестр остаётся пустым, `GrComponentDefaults` вырождается в `{}` — и тогда
 * помеченные `@ts-expect-error` строки перестают быть ошибками, а `vue-tsc`
 * падает с «Unused '@ts-expect-error' directive».
 *
 * Иначе говоря: `yarn typecheck` в этом приложении — и есть тест аугментации.
 */
import type { GrComponentDefaults } from '@feugene/granularity/components/GrConfigProvider'

// Импорты компонентов активируют аугментации реестра. Ровно так же это работает
// у обычного потребителя: знает про `GrButton` — типизирован `GrButton`.
import '@feugene/granularity/components/GrBadge'
import '@feugene/granularity/components/GrButton'
import '@feugene/granularity/components/GrInput'

type Expect<T extends true> = T

/** Реестр наполнен ровно теми компонентами, что импортированы выше. */
export type RegistryMatchesImports = Expect<
  'GrButton' | 'GrInput' | 'GrBadge' extends keyof GrComponentDefaults ? true : false
>

// ————— Позитив: валидный конфиг проходит проверку типов.
export const validDefaults: GrComponentDefaults = {
  GrButton: { variant: 'outline', tone: 'azure' },
  GrInput: { clearable: true, size: 'sm' },
  GrBadge: { tone: 'azure', radius: 'semi' },
}

// ————— Негатив: всё это обязано быть ошибкой типа.
export const wrongComponentName: GrComponentDefaults = {
  // @ts-expect-error — такого компонента нет в реестре.
  GrNope: { variant: 'outline' },
}

export const wrongPropName: GrComponentDefaults = {
  // @ts-expect-error — `GrButton` не отдаёт `modelValue` под настройку.
  GrButton: { modelValue: 'oops' },
}

export const wrongPropValue: GrComponentDefaults = {
  // @ts-expect-error — `variant` сужен объединением, `nope` в него не входит.
  GrButton: { variant: 'nope' },
}

export const notConfigurableComponent: GrComponentDefaults = {
  // @ts-expect-error — `GrSlider` свой контракт не объявлял.
  GrSlider: { size: 'sm' },
}
