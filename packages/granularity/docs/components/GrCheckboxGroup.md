# GrCheckboxGroup

Группа `GrCheckbox` с общей моделью `string[]` — парный к `GrRadioGroup`
компонент для множественного выбора.

Одиночный чекбокс — [`GrCheckbox.md`](./GrCheckbox.md).

## Когда брать

- **значений несколько из короткого набора** — права, теги, дни недели, каналы уведомлений;
- **все варианты должны быть видны** — выбор виден целиком, без раскрытия панели;
- **группа — часть формы** — общая модель `string[]`, общие `disabled`, `readonly` и `invalid`;
- **вариантов до десятка** — дальше список становится длиннее экрана.

## Когда взять другое

| Нужно | Берите |
| --- | --- |
| Вариантов много | [`GrSelect`](./GrSelect.md) с `multiple` |
| Вариантов много и их ищут вводом | [`GrAutocomplete`](./GrAutocomplete.md) |
| Можно выбрать только один | [`GrRadioGroup`](./GrRadioGroup.md) |
| Чекбокс один | [`GrCheckbox`](./GrCheckbox.md) |
| Варианты вложены | [`GrTreeSelect`](./GrTreeSelect.md) |

## Модель и контекст

Группа раздаёт вложенным чекбоксам выбранные значения, `name`, `size` и
состояния `disabled`/`readonly`/`invalid`, поэтому собственный `v-model` им не
нужен — достаточно `value`:

```vue
<GrCheckboxGroup v-model="channels" name="channels" :options="options" />

<GrCheckboxGroup v-model="channels" direction="horizontal">
  <GrCheckbox value="sms">SMS</GrCheckbox>
  <GrCheckbox value="email">Email</GrCheckbox>
</GrCheckboxGroup>
```

`name` уходит на каждый отмеченный чекбокс, поэтому нативная форма получает
повторяющееся поле: `new FormData(form).getAll('channels')`.

`disabled` отдельной опции сильнее доступной группы. Значение в модели, которого
нет среди `options`, группа не теряет: снятие соседнего чекбокса его сохраняет.

## Роль и ARIA

`role="group"`, а не `radiogroup`: у чекбоксов нет roving tabindex и переезда
выбора стрелками — каждый остаётся собственной остановкой `Tab`, ровно как набор
нативных `<input type="checkbox">`.

`role="group"` не поддерживает `aria-required` и `aria-readonly` (axe роняет это
как critical `aria-allowed-attr`), поэтому оба состояния объявляют сами
чекбоксы. `aria-invalid`, наоборот, висит только на группе: продублированный на
каждом пункте, он заставил бы диктор повторить «неверное значение» столько раз,
сколько в группе чекбоксов, — пункты при ошибке только перекрашиваются.

## Обязательность

Как и у одиночного чекбокса, `required` — объявление; проверяет правило формы.
Для группы работает встроенное `required`: пустой массив считается пустым
значением.

```ts
const rules: GrFormRules = {
  channels: [{ required: true, message: 'Выберите хотя бы один канал' }],
}
```
