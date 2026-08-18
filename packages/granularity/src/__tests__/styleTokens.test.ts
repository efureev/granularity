import { defineStyleTokensGate } from '@feugene/granularity-test-kit/gates'

/**
 * Кегли, радиусы, длительности и кривые объявлены токенами (`tokens/*.json`) —
 * и ровно поэтому выглядят настраиваемыми. Пиксельный литерал или утилита
 * `duration-150` этого обещания не держит: тема их не видит. Проверка от
 * исходников, а не от `dist`: класс живёт в разметке, а CSS собирает
 * потребитель своим конфигом.
 *
 * Сами определения токенов из проверки исключены: `styles/` и `tokens/`
 * генерируются из `tokens/*.json` и обязаны содержать литералы.
 */
defineStyleTokensGate({
  requirePairedLeading: true,
  // Клавиша центрирует глиф в плашке фиксированной высоты: `leading-none` в
  // `keyBaseClass` — её осознанный межстрочный, и парная ступень встала бы
  // второй декларацией того же веса.
  pairedLeadingExceptions: ['GrKbd/grKbdStyles.ts'],
  excludeTopDirs: ['styles', 'tokens'],
})
