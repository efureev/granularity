# @feugene/granularity-forms-schema

Форма из схемы бэкенда для дизайн-системы [`@feugene/granularity`](../granularity/README.md):
zod или JSON Schema на входе — настоящие поля дизайн-системы на выходе. Ни одной
зависимости.

```bash
yarn add @feugene/granularity-forms-schema
```

```vue
<script setup lang="ts">
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { zodAdapter } from '@feugene/granularity-forms-schema/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
})

const model = ref({})
</script>

<template>
  <GrSchemaForm v-model="model" :schema="schema" :adapters="[zodAdapter]" @submit="save" />
</template>
```

## Что внутри

| Что | Зачем |
| --- | --- |
| `GrSchemaForm` | форма по схеме целиком: поля, правила, разделы, повторители |
| `GrSchemaField` | одно поле по узлу — для «почти всё сгенерировано, а два поля свои» |
| `GrSchemaArrayField` | повторяемая секция для массива объектов |
| `./model` | нейтральная модель схемы — без Vue, ядра и схемных библиотек |
| `./validation` | компилятор правил и `explainRules` |
| `./renderers` | реестр «узел → контрол»; `./renderers/extended` и `./renderers/chrono` — по желанию |
| `./ui-schema` | порядок, колонки, условия, подмена виджета |
| `./server-errors` | разбор 422 и раскладка ошибок по полям |
| `./zod`, `./json-schema` | адаптеры; ставится тот, что нужен |

## Пакет ничего не рисует сам

Кроме сетки колонок. Оркестрацию даёт `GrForm`, обвязку и доступность —
`GrFormField`, разделы — `GrFormSection`, ввод — контролы ядра. Поэтому
сгенерированная форма выглядит и ведёт себя ровно как написанная руками.

## Вес гранулярного импорта

<!-- entry-sizes:generated:start lang=ru -->
| Что берут | gzip | от бареля |
| --- | ---: | ---: |
| весь пакет из корня | 19.7 kB | 100 % |
| единственный компонент — `GrSchemaForm` | 18.9 kB | 96 % |

Числа **не складываются**: общий код посчитан в каждой строке заново, а платится один раз —
поэтому набор компонентов и показан объединением, а не суммой. Это верхняя граница: gzip всего,
что подпуть тянет из `dist`, а бандлер приложения трясёт дальше и минифицирует повторно.

Вес каждого компонента — [`docs/entry-sizes.md`](./docs/entry-sizes.md).
<!-- entry-sizes:generated:end -->

## Документация

- [Компоненты](./docs/components.md)
- [Нейтральная модель](./docs/model.md)
- [Реестр рендереров](./docs/renderers.md)
- [`uiSchema`](./docs/ui-schema.md)
- [Валидация](./docs/validation.md)
- [Доступность](./docs/a11y.md)
- [Серверный рендер](./docs/ssr.md)

## Лицензия

См. [LICENSE](./LICENSE).
