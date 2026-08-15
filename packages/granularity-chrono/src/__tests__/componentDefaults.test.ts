import { defineComponentDefaultsGate } from '@feugene/granularity-test-kit/gates'

/**
 * Реестр объявлен в `@feugene/granularity/composables/useGrComponentConfig`, и
 * дополнять его можно только по этому адресу. Аугментация через баррель
 * (`components/GrConfigProvider`) типизируется, пока других аугментаций в
 * программе нет, и молча отваливается, как только в тот же граф типов приезжает
 * любой `defaults.d.ts` ядра — то есть в любом реальном приложении. Ошибки нет,
 * `componentDefaults` просто перестаёт знать про компонент.
 */
defineComponentDefaultsGate({
  registryModule: '@feugene/granularity/composables/useGrComponentConfig',
})
