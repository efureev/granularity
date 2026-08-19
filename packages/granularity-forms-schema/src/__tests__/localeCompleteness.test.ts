import { defineLocaleCompletenessGate } from '@feugene/granularity-test-kit/gates'

/**
 * Полнота локалей — общей фабрикой: правило одно на все пакеты, а экземпляры
 * различались одной строкой (префиксом блока в регулярке).
 *
 * Файл живёт здесь, а не в `src/i18n/__tests__/`: там он лежал ради статических
 * импортов JSON, а `defineGateCoverage` сканирует только `src/__tests__/**` и
 * гейт вне этой директории не увидел бы.
 */
defineLocaleCompletenessGate({
  block: 'grForms',
})
