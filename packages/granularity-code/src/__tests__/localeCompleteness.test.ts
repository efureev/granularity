import { defineLocaleCompletenessGate } from '@feugene/granularity-test-kit/gates'

/** Ключ, добавленный в одну локаль из трёх, даёт fallback на английский у части интерфейса. */
defineLocaleCompletenessGate({
  block: 'grCode',
  // У `diff.expand` формы множественного числа: русский требует три, английский
  // и испанский — две. Без флага гейт считал бы `few`/`many` ключами, которых
  // «не хватает» в en и es.
  pluralForms: true,
})
