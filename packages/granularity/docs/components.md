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
- `GrCollapse`
- `GrConfirmDialog`
- `GrDataTable`
- `GrDialog`
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
- `GrTabs`
- `GrTextarea`
- `GrToaster`
- `GrTooltip`
- `GrTree`
- `GrTreeSelect`

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