# `@feugene/extra-granularity`

Надстройка над [`@feugene/granularity`](../granularity/README.md): коллекция
**композитных компонентов**, собранных из базовых примитивов дизайн-системы
(`DsFormField`, `DsInput`, `DsButton`, …). Пакет не дублирует ни один компонент
granularity — он только склеивает их в готовые к использованию формы, списки,
диалоги и т. п.

## Зачем отдельный пакет

- `@feugene/granularity` остаётся **минимальным рантаймом** из атомарных
  примитивов; ничего «композитного» туда не попадает.
- `@feugene/extra-granularity` публикуется отдельно, имеет собственный
  релизный цикл и `peerDependency` на granularity — значит его можно
  версионировать и обновлять независимо.
- **Tree-shaking сохраняется** на обоих уровнях:
  - внутри `extra-granularity` каждый компонент — свой sub-path
    (`@feugene/extra-granularity/components/<Name>`);
  - внутри `granularity` сабпаты `components/<Name>` и `directives/<name>`
    используются напрямую, поэтому в бандл попадают только реально
    использованные примитивы.
- Стили каждого композита (`styles.css`) отмечены через
  `sideEffects: ["**/*.css"]` и подтягиваются только для реально
  импортированного компонента.

## Установка

```bash
yarn add @feugene/granularity @feugene/extra-granularity
```

`@feugene/granularity` и `vue` объявлены как `peerDependencies` — одна версия
рантайма на всё приложение, без дублирования.

## Состав пакета

| Компонент | Sub-path | Построен из |
|---|---|---|
| `XgQuickForm` | `@feugene/extra-granularity/components/XgQuickForm` | `DsFormField` + `DsInput` + `DsButton` |

> Префикс `Xg` (eXtra Granularity) специально отличается от `Ds*`, чтобы
> композитные компоненты не пересекались с резолвером
> `@feugene/unplugin-granularity` (он по умолчанию резолвит только `Ds*`).
> При желании для `extra-granularity` можно сделать собственный резолвер.

## Использование

```ts
// main.ts
import { createApp } from 'vue'
import '@feugene/granularity/foundation.css'
// только стили примитивов, которые реально использует XgQuickForm:
import '@feugene/granularity/components/DsFormField/styles.css'
import '@feugene/granularity/components/DsInput/styles.css'
import '@feugene/granularity/components/DsButton/styles.css'
import '@feugene/extra-granularity/components/XgQuickForm/styles.css'

import App from './App.vue'
createApp(App).mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { XgQuickForm } from '@feugene/extra-granularity/components/XgQuickForm'

const items = ref<string[]>([])
function onSubmit(value: string) {
  if (value) items.value.push(value)
}
</script>

<template>
  <XgQuickForm
    label="Добавить задачу"
    placeholder="Введите текст…"
    submit-label="Добавить"
    @submit="onSubmit"
  />
</template>
```

### API `XgQuickForm`

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `modelValue` | `string` | `''` | Двустороннее связывание значения инпута. |
| `label` | `string?` | — | Лейбл поля (пробрасывается в `DsFormField`). |
| `placeholder` | `string?` | — | Плейсхолдер `DsInput`. |
| `submitLabel` | `string` | `'Submit'` | Текст кнопки по умолчанию (можно переопределить слотом `submit`). |
| `error` | `string?` | — | Сообщение об ошибке под полем; включает `invalid`-состояние. |
| `disabled` | `boolean` | `false` | Блокирует форму целиком. |
| `loading` | `boolean` | `false` | Переводит кнопку в состояние загрузки и блокирует ввод. |
| `raw` | `boolean` | `false` | Не делать `.trim()` значения при submit. |

| Событие | Payload | Описание |
|---|---|---|
| `update:modelValue` | `string` | Изменение значения. |
| `submit` | `string` | Отправка формы (по Enter или клику по кнопке). |

| Слот | Описание |
|---|---|
| `submit` | Кастомное содержимое кнопки submit (по умолчанию — `submitLabel`). |

## Нюансы

- 🟢 **Tree-shaking:** в бандле окажутся только использованные композиты **и
  те примитивы granularity**, которые они реально импортируют.
- 🟢 **Пакет не навязывает стили:** подключение `foundation.css` и CSS
  примитивов — ответственность приложения (как и для самого `granularity`).
- 🟡 **Авто-импорт `unplugin-vue-components`:** стандартный
  `GranularityResolver` резолвит только `Ds*`. Для `Xg*` можно завести
  собственный резолвер (`from: '@feugene/extra-granularity/components/<Name>'`)
  либо импортировать композиты вручную.
- 🔴 **Не добавляйте сюда примитивы.** Всё, что можно сделать одним `Ds*` из
  granularity, должно жить там. В этом пакете — только композиция.

## Скрипты

```bash
yarn workspace @feugene/extra-granularity build
yarn workspace @feugene/extra-granularity typecheck
```
