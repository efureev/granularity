import {defineGranularComponent} from '@feugene/unocss-preset-granular/contract'

/**
 * Granular‑конфиг композита `XgQuickForm`.
 *
 * Композит использует примитивы из `@feugene/granularity` (DsFormField,
 * DsInput, DsButton) — они перечислены в `dependencies` в квалифицированной
 * форме. Классы этих примитивов подтянутся автоматически через единый реестр
 * компонентов пресета — дублировать их в локальном `safelist` НЕ нужно.
 */
export const xgQuickFormConfig = defineGranularComponent(import.meta.url, {
    name: 'XgQuickForm',
    dependencies: [
        {provider: '@feugene/granularity', components: ['DsFormField', 'DsInput', 'DsButton']}
    ],
    safelist: [],
})
