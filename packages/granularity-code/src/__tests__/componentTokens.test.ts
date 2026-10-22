import { grComponentTokens } from '@feugene/granularity/tokens'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'
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
 *
 * Токен вида `theme` пакет читает без запасного значения — значение даёт тема;
 * хук с литералом по умолчанию несёт причину `literal` в реестре.
 */
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens],
  // Инлайновые и хуки ядра (`--gr-affix-offset`) читаются с фолбэком законно.
  globalThemeTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens.filter(token => token.kind === 'theme')],
  themeTokenFallback: true,
  hookLiterals: true,
  themesDirAbsent: true,
  themeKindOnly: true,
})
