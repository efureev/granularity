import { grComponentTokens, grDerivedTokens, grFoundationTokens, grThemeTokens } from '@feugene/granularity/tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

/**
 * Покомпонентные переменные (`--gr-code-block-keyword`) потребитель видит как
 * публичный API темизации: он их переопределяет. Без реестра пакет не видит их
 * вовсе — переименование не роняет ни одного теста.
 *
 * Всё, что объявило ядро, приходит как `globalTokens`: употреблять можно,
 * объявлять заново — нет. Опечатка в чужом имени самая дешёвая из ошибок:
 * `var(--gr-invalid)` вместо `--gr-invalid-brd` не красил ничего и молчал бы,
 * не будь `doctor`.
 */
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grThemeTokens, ...grComponentTokens],
})
