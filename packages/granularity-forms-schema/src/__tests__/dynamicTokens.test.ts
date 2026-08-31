import { defineDynamicTokensGate } from '@feugene/granularity-test-kit/gates'
import { grDerivedTokens, grFoundationTokens, grThemeTokens } from '@feugene/granularity/tokens'

import { granularityFormsSchemaComponentConfigs } from '../granular-provider/shared'

/**
 * Пакет сегодня имён токенов в рантайме не собирает, и гейт это фиксирует.
 * Стоит он ради завтрашнего компонента: токен, чьё имя склеено в рантайме,
 * при включённой обрезке исчезает молча — сборка зелёная, CSS валидный,
 * а переменная разрешается в пустоту.
 */
defineDynamicTokensGate({
  componentConfigs: granularityFormsSchemaComponentConfigs,
  knownTokens: [...grFoundationTokens, ...grDerivedTokens, ...grThemeTokens].map(token => token.name),
})
