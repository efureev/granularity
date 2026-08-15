import { defineComponentDocsGate } from '@feugene/granularity-test-kit/gates'

/**
 * Гейт на страницу компонента.
 *
 * Первый тест в пакете: до него `extra-granularity` проверялся только сборкой
 * и `granular doctor`, то есть контрактом CSS. Документация компонента до
 * этого жила единственной секцией README и не проверялась ничем.
 */
defineComponentDocsGate({
  // Компонент один, и отдельный каталог рядом с ним был бы страницей из одной
  // строки: роль индекса исполняет `docs/README.md`.
  indexPath: 'docs/README.md',
})
