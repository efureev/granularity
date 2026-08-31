import { defineDynamicTokensGate } from '@feugene/granularity-test-kit/gates'

import { granularityComponentConfigs } from '../granular-provider/shared'
import { grDerivedTokens, grFoundationTokens, grThemeTokens } from '../tokens'

/**
 * Токен, чьё имя собирается в рантайме, не находит ни один статический
 * анализ: имя уходит в композабл параметром, а `var()` склеивается там.
 * Приложение с включённой обрезкой (`pruneTokens` пресета) считает такой
 * токен ненужным и удаляет объявление — молча: сборка зелёная, `z-index`
 * разрешается в `unset`, панель уезжает под соседний слой. Остальные гейты
 * этого не видят: CSS остаётся валидным.
 *
 * В пакете источник один — `composables/internal/overlayStack.ts`, и его
 * знает фабрика (`OVERLAY_COMPOSABLES`).
 */
defineDynamicTokensGate({
  componentConfigs: granularityComponentConfigs,
  knownTokens: [...grFoundationTokens, ...grDerivedTokens, ...grThemeTokens].map(token => token.name),
  appSuppliedName: {
    // Проп `zIndexVar` документирован как escape-hatch мимо `--gr-z-loading`:
    // имя задаёт ПРИЛОЖЕНИЕ, держать его — забота потребителя. Собственный
    // слой компонента статический (`z-[var(--gr-z-loading)]`).
    GrLoading: 'zIndexVar — escape-hatch приложения мимо --gr-z-loading',
  },
})
