import { defineDynamicTokensGate } from '@feugene/granularity-test-kit/gates'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'

import { granularityChartsComponentConfigs } from '../granular-provider/shared'

/**
 * Тултип рамы позиционирует `useFloating` ядра: имя слоя уходит туда
 * параметром, а `var()` собирается в `overlayStack.ts` ядра. Ни
 * `var(--gr-z-tooltip)`, ни `var(--gr-z-modal)` в исходниках пакета нет.
 *
 * Композабл зовёт РАМА, а не график, поэтому фабрика читает и общую
 * директорию группы — по `group` в дескрипторе.
 */
defineDynamicTokensGate({
  componentConfigs: granularityChartsComponentConfigs,
  knownTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens].map(token => token.name),
})
