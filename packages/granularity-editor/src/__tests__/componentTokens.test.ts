import { grComponentTokens, grDerivedTokens, grFoundationTokens, grThemeTokens } from '@feugene/granularity/tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

/**
 * Покомпонентные переменные (`--gr-calendar-selected-bg`) потребитель видит как
 * публичный API темизации: он их переопределяет. Без реестра пакет не видит их
 * вовсе — переименование не роняет ни одного теста.
 *
 * Всё, что объявило ядро, приходит сюда как `globalTokens`: роли, примитивы,
 * производные и его покомпонентные хуки. Употреблять их можно, объявлять
 * заново — нет. Опечатка в чужом имени — самая дешёвая ошибка из возможных
 * (`var(--gr-destructive)` в предшественнике не красил ничего и молчал).
 */
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grThemeTokens, ...grComponentTokens],
})
