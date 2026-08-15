import { defineComponentDefaultsGate } from '@feugene/granularity-test-kit/gates'

/**
 * Реестр объявлен в `composables/useGrComponentConfig` — дополнять его можно
 * только там. Через реэкспорт (например `../GrConfigProvider/context`, который
 * тип лишь пробрасывает) слияние работает, пока аугментация в программе одна:
 * стоит появиться второй, дополняющей объявление напрямую, и первая молча
 * отваливается. Ошибки при этом нет — просто `componentDefaults` перестаёт
 * знать про компонент, а вместе с ним и `useGrComponentProp`.
 *
 * Ровно на это напоролся companion-пакет `@feugene/granularity-chrono`: его
 * компоненты выпадали из реестра, как только в ту же программу приезжал любой
 * `defaults.d.ts` ядра.
 */
defineComponentDefaultsGate({
  registryModule: '../../composables/useGrComponentConfig',
  minComponents: 11,
  registryDeclaration: {
    path: 'src/composables/useGrComponentConfig.ts',
    contains: 'export interface GrComponentDefaultsRegistry',
  },
})
