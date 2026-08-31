import { defineComponentDefaultsGate } from '@feugene/granularity-test-kit/gates'

/**
 * Реестр дефолтов объявлен в `@feugene/granularity/composables/useGrComponentConfig`,
 * и дополнять его можно только по этому адресу. Аугментация через баррель молча
 * отваливается, как только в тот же граф типов приезжает любой `defaults.d.ts`
 * ядра — то есть в любом реальном приложении.
 */
defineComponentDefaultsGate({
  registryModule: '@feugene/granularity/composables/useGrComponentConfig',
})
