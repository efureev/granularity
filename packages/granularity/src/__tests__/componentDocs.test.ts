import { defineComponentDocsGate } from '@feugene/granularity-test-kit/gates'

/**
 * Гейт на страницу компонента.
 *
 * Компонент без страницы, страница-сирота и ссылка, ведущая в никуда, раньше
 * проходили CI молча: доку не читал ни один тест. Форму держит гейт, смысл —
 * ревью по `.claude/rules/component-docs.md`.
 */
defineComponentDocsGate({
  redirectExempt: {
    GrConfigProvider: 'единственный провайдер пакета: заменить его другим компонентом нельзя, альтернатива — проп на месте употребления либо сквозная дока',
  },
})
