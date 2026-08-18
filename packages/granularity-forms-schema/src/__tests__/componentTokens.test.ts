import { grComponentTokens, grDerivedTokens, grFoundationTokens, grThemeTokens } from '@feugene/granularity/tokens'
import { defineComponentTokensGate } from '@feugene/granularity-test-kit/gates'

// Всё, что объявило ядро, легально как употребление — но не как объявление.
defineComponentTokensGate({
  globalTokens: [...grFoundationTokens, ...grDerivedTokens, ...grThemeTokens, ...grComponentTokens],
})
