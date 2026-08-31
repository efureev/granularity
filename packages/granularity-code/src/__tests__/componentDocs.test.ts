import { defineComponentDocsGate } from '@feugene/granularity-test-kit/gates'

/**
 * Гейт на страницу компонента.
 *
 * У спутника он важнее, чем у ядра: без страницы единственным описанием
 * компонента остаётся витрина, то есть текст живёт вне пакета, который его
 * отгружает.
 */
defineComponentDocsGate()
