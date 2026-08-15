import { defineComponentDocsGate } from '@feugene/granularity-test-kit/gates'

/**
 * Гейт на страницу компонента.
 *
 * У пакета-спутника он важнее, чем у ядра: единственным per-component
 * описанием долго была витрина (`companionPackages.ts`), то есть текст жил
 * вне пакета и в тарбол не попадал вовсе.
 */
defineComponentDocsGate()
