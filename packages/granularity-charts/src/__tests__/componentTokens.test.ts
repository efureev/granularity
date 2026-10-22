import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { grComponentTokens } from '@feugene/granularity/tokens'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

/**
 * Покомпонентные переменные графика потребитель видит как публичный API
 * темизации: он их переопределяет. Без реестра пакет не видит их вовсе —
 * переименование не роняет ни одного теста.
 *
 * Всё, что объявило ядро, приходит сюда как `globalTokens`: роли, примитивы,
 * производные и его покомпонентные хуки. Употреблять их можно, объявлять
 * заново — нет.
 *
 * Токен вида `theme` пакет читает без запасного значения — значение даёт тема;
 * хук с литералом по умолчанию несёт причину `literal` в реестре.
 */
const themesDir = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('@feugene/granularity-tokens/package.json')), 'themes')

defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens],
  // Инлайновые и хуки ядра (`--gr-affix-offset`) читаются с фолбэком законно.
  globalThemeTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens.filter(token => token.kind === 'theme')],
  themeTokenFallback: true,
  hookLiterals: true,
  themesDirAbsent: true,
  themeKindOnly: true,
  themeSources: { themesDir, packageId: '@feugene/granularity-charts' },
})
