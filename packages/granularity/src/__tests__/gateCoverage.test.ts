import { defineGateCoverage, REQUIRED_GATES } from '@feugene/granularity-test-kit/gates'

/**
 * Ядро проверяется тем же набором, что и спутники: правила о токенах, реестрах
 * и адресе аугментации у них общие, и расхождение здесь означало бы, что ядро
 * требует от спутника того, чего не держит само.
 *
 * Исключение одно — `defineRegistryGate`. Общая фабрика требует запись каждого
 * компонента в `vite.config.ts`, а на granum entry строит `granumProvider()` из
 * реестра провайдера: четвёртой точки синхронизации у ядра больше нет. Пока
 * спутники живут на пресете v1, ядро ведёт свой гейт реестров
 * (`registry.generated.test.ts`) — он проверяет те же три точки и вдобавок
 * экспорт манифеста.
 */
defineGateCoverage({
  required: REQUIRED_GATES.filter(gate => gate !== 'defineRegistryGate'),
})
