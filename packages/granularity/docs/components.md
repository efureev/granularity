# Каталог компонентов

`@feugene/granularity` публикует компоненты через root barrel и через component subpath export-ы.

## Рекомендуемый импорт

Для точечного использования компонентов предпочтителен формат:

```ts

```

Для быстрого старта допустим root import:

```ts

```

## Опубликованные компоненты

По текущему component registry пакет публикует следующие компоненты:

- `GrAlert`
- `GrAvatar`
- `GrBadge`
- `GrBadgeWrap`
- `GrBottomNav`
- `GrButton`
- `GrButtonGroup`
- `GrCard`
- `GrCheckbox`
- `GrCheckboxGroup`
- `GrCollapse`
- `GrConfirmDialog`
- `GrDataTable`
- `GrDialog`
- `GrDivider`
- `GrDrawer`
- `GrDropdown`
- `GrDropdownMenu`
- `GrEmptyState`
- `GrFileUpload`
- `GrFormField`
- `GrFormFile`
- `GrFormSection`
- `GrIcon`
- `GrImageViewer`
- `GrInput`
- `GrInputTag`
- `GrKbd`
- `GrLink`
- `GrList`
- `GrLoading`
- `GrModal`
- `GrNavbar`
- `GrNumberInput`
- `GrPagination`
- `GrProgressBar`
- `GrPromptDialog`
- `GrRadio`
- `GrRadioGroup`
- `GrSelect`
- `GrSidebar`
- `GrSkeleton`
- `GrSwitch`
- `GrTable`
- `GrTabPanels`
- `GrTabs`
- `GrTextarea`
- `GrToaster`
- `GrTooltip`
- `GrTree`
- `GrTreeSelect`

## Чекбоксы: обязательность и множественный выбор

`required` у `GrCheckbox` и `GrCheckboxGroup` — **объявление, а не нативная
проверка**: он доезжает до `aria-required` на виджете и не выставляется на
скрытом `<input type="checkbox">`. Нативная проверка потребовала бы от браузера
сфокусировать невалидный контрол, а он невидим и `aria-hidden`, — Chrome в таком
случае отменяет отправку всей формы и пишет в консоль «An invalid form control
… is not focusable». Проверять обязательность нужно правилом формы:

```vue
<script setup lang="ts">
// `required` пустым считает `null`/`''`/`[]`, но не `false`: снятый чекбокс —
// это законное значение поля. «Согласие обязательно» — это `validator`.
const rules: GrFormRules = {
  terms: [{ validator: value => value === true || 'Примите условия' }],
  channels: [{ required: true, message: 'Выберите хотя бы один канал' }],
}
</script>

<template>
  <GrForm :model="model" :rules="rules">
    <GrFormField name="terms" label="Условия">
      <GrCheckbox v-model="model.terms" required />
    </GrFormField>

    <GrFormField name="channels" label="Каналы">
      <GrCheckboxGroup v-model="model.channels" :options="options" required />
    </GrFormField>
  </GrForm>
</template>
```

Множественный выбор — `GrCheckboxGroup` с моделью `string[]`. Он раздаёт
вложенным `GrCheckbox` выбранные значения, `name`, `size` и состояния
`disabled`/`readonly`/`invalid`, поэтому собственный `v-model` им не нужен:

```vue
<GrCheckboxGroup v-model="channels" name="channels" :options="options" />
```

Клик по подписи переключает чекбокс, но её интерактивное содержимое (ссылка,
кнопка, вложенный `<label>`) работает само по себе и состояние не меняет — для
того подпись и вынесена наружу роли-виджета.

## Стили компонентов

Для каждого опубликованного компонента можно подключать component-level CSS через путь вида:

```ts
import '@feugene/granularity/components/GrButton/styles.css'
```

Важно помнить, что `components/<Name>/styles.css` — это уже собранный публичный bundle компонента. Обычно он сам содержит foundation-слой пакета, поэтому его можно подключать самостоятельно:

```ts
import '@feugene/granularity/components/GrButton/styles.css'
```

Если приложение собирает несколько component bundle-ов и хочет централизованно управлять foundation-слоем, можно отдельно подключить `foundation.css` или уйти в `UnoCSS` preset.

Ручные импорты `styles/tokens.css`, `styles/themes/*.css` и `styles/base.css` нужны только для низкоуровневых кастомных сценариев.

## Как работать с каталогом

- если нужен быстрый обзор возможностей пакета — используйте этот список как индекс компонентов;
- если нужен минимальный bundle — импортируйте только нужные компоненты через subpath;
- если приложение подключает всё через `UnoCSS`, выбор компонентов можно передавать в `presetGranularity` или `presetGranularityNode`.