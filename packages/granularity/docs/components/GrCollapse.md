# GrCollapse

Аккордеон: контейнер `GrCollapse` + секции `GrCollapseItem`.

Клавиатурный контракт — [`../keyboard.md`](../keyboard.md), размеры —
[`../sizes.md`](../sizes.md).

## Уровень заголовка

Заголовок секции рендерится тегом `h3`, а `headingLevel` подгоняет его под
структуру страницы: в разделе `<h4>` аккордеон обязан начинаться с `h5`, иначе
навигация по заголовкам получает разрыв уровней. Кнопка остаётся внутри
заголовка — этого требует APG для accordion.

## Поверхность

`borderless` убирает обёртку в `GrCard`: аккордеон внутри карточки, сайдбара или
панели фильтров иначе получает вторую рамку и вторую тень. `divided` управляет
разделителями между секциями.

```vue
<GrCollapse v-model="open" borderless :heading-level="5" expand-icon-position="start">
  <GrCollapseItem name="filters" title="Фильтры">
    <template #extra>
      <GrBadge size="sm">3</GrBadge>
    </template>
    …
  </GrCollapseItem>
</GrCollapse>
```

Слот `#icon` заменяет шеврон, `expandIconPosition` переставляет его перед
заголовком. Слот `#extra` (счётчик, бейдж, кнопка) рендерится **рядом** с
триггером, а не внутри: `<button>` в `<button>` — невалидная разметка, и axe
ловит её как `nested-interactive`.

## Guard на переключение

`beforeChange(name, expanding)` отменяет переключение, вернув `false`. Второй
аргумент — куда идёт секция, чтобы «сохранить изменения?» спрашивалось только на
сворачивании. Пока guard не ответил, повторный клик по тому же заголовку
игнорируется: иначе два подтверждения подряд вернули бы состояние к исходному.

```ts
async function beforeChange(name: GrCollapseValue, expanding: boolean): Promise<boolean> {
  if (expanding) return true
  return confirmDiscardChanges(name)
}
```

## Клавиатура и вложенность

Стрелки `↑`/`↓` (по кругу) и `Home`/`End` ходят только по заголовкам **своего**
аккордеона: вложенный `GrCollapse` внутри раскрытой панели в обход не попадает.

Свёрнутая панель помечена `inert` — ни `Tab`, ни скринридер в неё не заходят,
при этом (в отличие от `hidden`) анимация раскрытия сохраняется.
