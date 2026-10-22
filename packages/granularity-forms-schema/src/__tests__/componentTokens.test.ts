import { grComponentTokens } from '@feugene/granularity/tokens'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

// Всё, что объявило ядро, легально как употребление — но не как объявление.
// Токен вида `theme` пакет читает без запасного значения — значение даёт тема;
// хук с литералом по умолчанию несёт причину `literal` в реестре.
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens],
  // Инлайновые и хуки ядра (`--gr-affix-offset`) читаются с фолбэком законно.
  globalThemeTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens.filter(token => token.kind === 'theme')],
  themeTokenFallback: true,
  hookLiterals: true,
  themesDirAbsent: true,
  themeKindOnly: true,
})
