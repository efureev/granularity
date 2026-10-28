# Рамка поля: одна на экосистему

Рамку поля рисует **один лист** — лист `GrInput`. По нему рисуют рамку все поля ядра (`GrInput`,
`GrTextarea`, `GrNumberInput`, `GrSelect`, `GrAutocomplete`, `GrInputTag`, `GrTreeSelect`, триггер
`GrColorPicker`), пикеры `granularity-chrono`, `GrRichText` и `GrCodeEditor`. Компонент, которому
нужен вид поля, не собирает рамку своими классами, а ставит её атрибуты на свой элемент. Тогда
правка поля в ядре или в теме доходит до всех сразу: рамка, скругление, отклик на указатель и
фокус, ошибка и недоступность читаются одинаково во всей форме.

Копия рамки классами отстаёт от оригинала. Так было с пикерами дат: когда «Глина» дала полю
свою рамку, отклик и скругление по ступени, поле пикера осталось при старой рамке `--gr-brd`,
одном скруглении на все ступени и без отклика на наведение.

## Что рисует лист

| Часть | Значение |
| --- | --- |
| рамка покоя | `--gr-input`, 1px |
| подложка | `--gr-bg`; «только чтение» — `--gr-input-readonly-bg`; недоступно — `--gr-disabled-bg` |
| скругление | `--gr-radius-control-<ступень>`; пилюля — `--gr-radius-full` |
| высота | ступени шкалы контролов (28 / 32 / 40 / 44 px) — точная, минимальная или никакая |
| подсветка `state` | рамка и кольцо — `--gr-success` · `--gr-warning` · `--gr-danger` |
| ошибка | рамка `--gr-invalid-brd`, кольцо `--gr-invalid-ring` — сильнее подсветки |
| недоступность, «только чтение» | рамка `--gr-disabled-brd` / `--gr-input-readonly-brd`; гасят лишь рамку покоя, подсветка и ошибка остаются видны |
| отклик | под указателем — `--gr-input-hover`, в фокусе — `--gr-input-focus-brd`; только у рабочего поля без подсветки |
| кольцо фокуса | `0 0 0 var(--gr-input-focus-ring-width)` цветом `--gr-ring` (или подсветки, ошибки) |
| переход | цвета за `--gr-duration-fast` по `--gr-ease-out` |

Чего лист не рисует: раскладку (`position`, ширину, `overflow`), кегль, отступы, цвет текста
и курсор рабочего поля. Это — поле компонента. Недоступному полю лист ставит текст
`--gr-disabled-fg` и курсор `not-allowed`.

## Как поставить рамку

Атрибуты ставит функция `grFieldLookAttrs` на элемент, который несёт рамку:

```ts
import { grFieldLookAttrs } from '@feugene/granularity/components/GrInput'

const frameAttrs = computed(() => grFieldLookAttrs({
  size: resolvedSize.value, // 'xs' | 'sm' | 'md' | 'lg'
  kind: 'line', // 'line' | 'wrap' | 'area'
  shape: 'box', // 'box' | 'pill'
  state: props.state, // 'default' | 'success' | 'warning' | 'danger'
  invalid: field.invalid.value,
  disabled: field.disabled.value,
  readonly: field.readonly.value,
}))
```

```vue
<div class="relative w-full" v-bind="frameAttrs">
  <input class="w-full bg-transparent text-[var(--gr-fg)] focus:outline-none">
</div>
```

| Опция | Атрибут | Когда |
| --- | --- | --- |
| `kind` | `data-gr-field` | `line` — однострочное поле, высота ступени точная; `wrap` — поле с чипами, которые переносятся, высота минимальная; `area` — многострочный текст и редактор, высоту задаёт содержимое |
| `size` | `data-gr-size` | ступень: скругление и высота |
| `shape` | `data-gr-shape="pill"` | пилюля; отступ текста под дугу — забота компонента: не меньше половины высоты ступени |
| `state` | `data-gr-state` | подсветка; при `invalid` атрибута нет |
| `invalid` | `data-gr-invalid` | вердикт валидации |
| `disabled` | `data-gr-off` | недоступно; «только чтения» при нём нет |
| `readonly` | `data-gr-readonly` | только для чтения |
| `trigger` | `data-gr-trigger` | рамка сама получает фокус (кнопка-триггер списка): кольцо по её `:focus-visible`, и щелчок мышью его не зажигает. Без флага кольцо загорается по `:focus-within`: фокус у поля внутри рамки |

Если элемент уже связан объектом атрибутов (`v-bind="triggerProps"`), атрибуты рамки
сливаются в тот же объект: `v-bind="{ ...triggerProps, ...frameAttrs }"`. Два `v-bind` на одном
элементе компилятор не примет. Атрибуты рамки идут последними и перекрывают одноимённые.

## Ребро на `GrInput` обязательно

Лист поля живёт в `GrInput` и приезжает в приложение только по ребру зависимостей. Без ребра
сборка зелёная, а рамки нет у того, кто выбрал один ваш компонент.

- **Компонент ядра** — `dependencies: ['GrInput']` в `config.ts`. Гейт графа
  (`componentDependencies.test.ts`) сам требует ребро: импорт функции из модуля вида соседа
  (`grFieldLook`) считается ребром стилей, как импорт его safelist или карты классов.
- **Спутник** — `dependencies: [{ provider: '@feugene/granularity', components: ['GrInput'] }]`,
  а диапазон ядра в `peerDependencies` — не ниже версии, где появилась `grFieldLookAttrs`.
- **Приложение** со своим полем — `GrInput` в селекции granum (`components`).

## Своё у компонента — своим листом

Отличие от общей рамки компонент пишет правилом в своём `<style>`, с явной специфичностью
выше правила листа поля. Примеры в пакетах:

- триггер `GrColorPicker` красит рамку под указателем ручкой темы
  `--gr-color-picker-trigger-hover-brd`: у тем каталога она равна `--gr-input-hover`, и триггер
  откликается, как поле, а своя тема вправе дать ему свой цвет;
- `GrCodeEditor` держит кодовую подложку `--gr-code-block-bg`: редактор кода читается кодом, а не
  полем ввода.

**Цвет текста — утилитой, и у недоступного тоже.** Утилиты лежат слоем выше листов
(`granum.utilities` над `granum.components`). Утилита `text-[var(--gr-fg)]` на рамке перебила бы
цвет недоступного поля из листа, поэтому пара утилит взаимоисключающая:
`disabled ? 'text-[var(--gr-disabled-fg)]' : 'text-[var(--gr-fg)]'`. Если текст — сам элемент рамки
(`GrTextarea`), цвет рабочего поля ставится в листе компонента, а не утилитой.

## Как проверить

- **Вид рамки** держит тест листа в ядре (`GrInput/__tests__/grFieldLook.test.ts`) и линейка высот
  (`controlHeights.test.ts`). Компоненту достаточно проверить контракт: рамка несёт нужные атрибуты
  (`data-gr-field`, `data-gr-invalid`, отсутствие `data-gr-state` при ошибке).
- **Внутри ядра** вид проверяется каскадом листа на смонтированном элементе:
  `componentSheet('GrInput/GrInput.vue').look(frame, { hover: true })` (`markup-weight.md`).
- **Переход на рамку** сверяется в браузере вычисленными стилями до и после, как перенос любого
  вида в лист (`markup-weight.md`, «Как проверить»).

## Смежное

- [`markup-weight.md`](./markup-weight.md) — почему вид повторяющегося компонента — лист по
  атрибутам, а не утилиты.
- [`form-controls.md`](./form-controls.md) — контракт форм-контрола: `invalid`, `readonly`,
  `disabled` и граница фокуса.
- [`sizes.md`](./sizes.md) — шкала контролов и кегль ступени `--gr-control-text-*`.
- [`companion-packages.md`](./companion-packages.md) — рёбра на компоненты ядра из спутника.
