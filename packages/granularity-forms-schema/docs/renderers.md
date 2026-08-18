# Реестр рендереров

Реестр отвечает на вопрос «каким контролом рисовать этот узел». Запись
объявляется данными, а не функцией: «почему это поле стало текстовым» — первый
вопрос к генератору форм, и ответ должен читаться в отладке.

## Порядок разрешения

1. слот `#default` у поля — реестр не зовётся вовсе;
2. `uiSchema.fields[path].component` — готовый компонент;
3. `uiSchema.fields[path].widget` — запись по имени, условия игнорируются;
4. записи реестра по убыванию `priority` — первая, у которой сошлись `when` и `match`;
5. `gr:string` плюс событие `unresolved`.

## Дефолтный набор

`coreRenderers` покрывает то, из чего состоит обычная форма: `GrInput` (текст,
почта, ссылка, телефон, пароль), `GrTextarea`, `GrNumberInput`, `GrSelect`,
`GrCheckbox`, `GrCheckboxGroup`, `GrRadioGroup`, `GrInputTag`, `GrFormFile` и
повторитель для массива объектов.

Набор узкий намеренно. Каждая запись — это компонент в `dependencies`
дескриптора, то есть его CSS и safelist в бандле **каждого** потребителя формы.

## Расширенные наборы подключаются явно

```ts
import { coreRenderers, createSchemaRendererRegistry } from '@feugene/granularity-forms-schema/renderers'
import { extendedRenderers } from '@feugene/granularity-forms-schema/renderers/extended'
import { chronoRenderers } from '@feugene/granularity-forms-schema/renderers/chrono'

const renderers = createSchemaRendererRegistry(coreRenderers)
  .register(...extendedRenderers, ...chronoRenderers)
```

`extendedRenderers` добавляет `GrSlider`, `GrRating`, `GrSegmented`,
`GrColorPicker`, `GrAutocomplete`, `GrTreeSelect`, `GrFileUpload`.

`./renderers/chrono` добавляет пикеры даты и времени из
`@feugene/granularity-chrono`. Отдельным subpath по одной причине: chrono —
optional peer, и его импорт внутри дефолтного набора ломал бы **сборку** у того,
кто пакет не поставил, — bare-specifier резолвится бандлером, а не рантаймом.
Без chrono дата остаётся текстовым полем с проверкой формата.

**Подключив расширенный набор, допишите его компоненты в селекцию пресета** —
иначе они приедут без стилей:

```ts
presetGranularNode({
  providers: [granularityProvider, granularityFormsSchemaProvider],
  components: ['@feugene/granularity-forms-schema:GrSchemaForm', 'GrSlider', 'GrColorPicker'],
})
```

## Свой виджет

```ts
registry.register({
  name: 'app:money',
  component: MoneyInput,
  when: { kind: 'number', format: 'money' },
  props: ({ node }) => ({ currency: node.annotations?.['x-currency'] }),
  // Модель хранит копейки, контрол показывает рубли.
  codec: { toControl: value => Number(value) / 100, toModel: value => Math.round(Number(value) * 100) },
})
```

Свои записи по умолчанию сильнее дефолтных: потребитель регистрирует их после и
вправе ждать, что они победят.

Чужой компонент подключится к валидации и доступности сам, если держит контракт
форм-контрола ядра (`packages/granularity/docs/form-controls.md`).
