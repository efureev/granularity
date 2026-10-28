import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { grComponentTokens } from '@feugene/granularity/tokens'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

// Всё, что объявило ядро, легально как употребление — но не как объявление.
// Токен вида `theme` пакет читает без запасного значения — значение даёт тема;
// хук с литералом по умолчанию несёт причину `literal` в реестре.
const themesDir = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('@feugene/granularity-tokens/package.json')), 'themes')

defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens],
  // Инлайновые и хуки ядра (`--gr-affix-offset`) читаются с фолбэком законно.
  globalThemeTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens.filter(token => token.kind === 'theme')],
  themeTokenFallback: true,
  hookLiterals: true,
  themesDirAbsent: true,
  themeKindOnly: true,
  themeSources: { themesDir, packageId: '@feugene/granularity-forms-schema' },
})
