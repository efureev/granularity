import { grComponentTokens } from '@feugene/granularity/tokens'
import { grDerivedTokens, grFoundationTokens, grRoleTokens } from '@feugene/granularity-tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

// Всё, что объявило ядро, легально как употребление — но не как объявление.
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grRoleTokens, ...grComponentTokens],
})
