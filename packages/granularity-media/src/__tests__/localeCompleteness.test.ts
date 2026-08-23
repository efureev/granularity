import { defineLocaleCompletenessGate } from '@feugene/granularity-test-kit/gates'

/** Полнота локалей — общей фабрикой: правило одно на все пакеты. */
defineLocaleCompletenessGate({
  block: 'grMedia',
})
