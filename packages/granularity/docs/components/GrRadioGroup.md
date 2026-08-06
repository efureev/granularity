# GrRadioGroup

Контейнер группы `GrRadio`: раздаёт `modelValue`, `name`, `size`, `disabled`,
`readonly` и `invalid` через контекст и держит клавиатуру паттерна
`radiogroup`.

Сам переключатель — [`./GrRadio.md`](./GrRadio.md), клавиатура —
[`../keyboard.md`](../keyboard.md).

## Два режима

```vue
<!-- Пропом: короткий путь для плоского списка. -->
<GrRadioGroup v-model="status" :options="options" />

<!-- Слотом: когда вариантам нужна своя разметка. -->
<GrRadioGroup v-model="status">
  <GrRadio value="draft">Черновик</GrRadio>
  <GrRadio value="review">На проверке</GrRadio>
</GrRadioGroup>
```

Оба режима получают одну и ту же клавиатуру и один и тот же контекст: состав
группы собирается регистрацией детей, а не обходом DOM, поэтому работает и на
сервере.

## Опции

```ts
interface GrRadioGroupOption {
  value: string | number | boolean
  label: string
  disabled?: boolean
  description?: string
}
```

`disabled` отключает один вариант, не переводя всю группу на слот — раньше это
был единственный способ. `description` рисуется под подписью и только в
варианте `radiobox`: у кнопочного чипа описанию негде жить.

## Раскладка

`orientation` — `vertical` (по умолчанию) или `horizontal`. Кнопочный вариант
всегда горизонтальный: его собирает `GrButtonGroup`, и `orientation` там ни на
что не влияет.

## Состояния

`disabled` гасит всю группу, `readonly` оставляет выбор видимым, но
неизменяемым: `aria-readonly` объявляет сама группа (у роли `radio` такого
атрибута нет), а переключатели перестают обещать клик курсором.

`invalid` и `required` доходят и до группы, и до вида переключателей. Внутри
`GrFormField` то же самое приходит из контекста поля: имя через
`aria-labelledby`, подсказка и текст ошибки — через `aria-describedby`, ошибка —
через `aria-invalid`. Группа не labelable-элемент, поэтому `<label for>` для неё
неприменим.

## Клавиатура

Вся раскладка описана в карточке `GrRadio`: группа — одна остановка `Tab`,
внутри `↑`/`↓`/`←`/`→` по кругу и `Home`/`End` на края. Отключённые варианты
пропускаются везде — и в roving tabindex, и при обходе стрелками.
