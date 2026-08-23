import { grComponentTokens, grDerivedTokens, grFoundationTokens, grThemeTokens } from '@feugene/granularity/tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

/**
 * Покомпонентные переменные (`--gr-image-crop-mask`) потребитель видит как
 * публичный API темизации: он их переопределяет. Без реестра пакет не видит их
 * вовсе — переименование не роняет ни одного теста.
 *
 * Всё, что объявило ядро, приходит сюда как `globalTokens`: употреблять их
 * можно, объявлять заново — нет.
 */
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grThemeTokens, ...grComponentTokens],
})
