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

- `DsAlert`
- `DsAvatar`
- `DsBadge`
- `DsBadgeWrap`
- `DsBottomNav`
- `DsButton`
- `DsButtonGroup`
- `DsCard`
- `DsCheckbox`
- `DsCollapse`
- `DsConfirmDialog`
- `DsDataTable`
- `DsDialog`
- `DsDrawer`
- `DsDropdown`
- `DsDropdownMenu`
- `DsEmptyState`
- `DsFileUpload`
- `DsFormField`
- `DsFormFile`
- `DsFormSection`
- `DsIcon`
- `DsImageViewer`
- `DsInput`
- `DsInputTag`
- `DsLink`
- `DsList`
- `DsLoading`
- `DsModal`
- `DsNavbar`
- `DsNumberInput`
- `DsPagination`
- `DsProgressBar`
- `DsPromptDialog`
- `DsRadio`
- `DsRadioGroup`
- `DsSelect`
- `DsSidebar`
- `DsSkeleton`
- `DsSwitch`
- `DsTable`
- `DsTabs`
- `DsTextarea`
- `DsToaster`
- `DsTooltip`
- `DsTree`
- `DsTreeSelect`

## Стили компонентов

Для каждого опубликованного компонента можно подключать component-level CSS через путь вида:

```ts
import '@feugene/granularity/components/DsButton/styles.css'
```

Важно помнить, что `components/<Name>/styles.css` — это уже собранный публичный bundle компонента. Обычно он сам содержит foundation-слой пакета, поэтому его можно подключать самостоятельно:

```ts
import '@feugene/granularity/components/DsButton/styles.css'
```

Если приложение собирает несколько component bundle-ов и хочет централизованно управлять foundation-слоем, можно отдельно подключить `foundation.css` или уйти в `UnoCSS` preset.

Ручные импорты `styles/tokens.css`, `styles/themes/*.css` и `styles/base.css` нужны только для низкоуровневых кастомных сценариев.

## Как работать с каталогом

- если нужен быстрый обзор возможностей пакета — используйте этот список как индекс компонентов;
- если нужен минимальный bundle — импортируйте только нужные компоненты через subpath;
- если приложение подключает всё через `UnoCSS`, выбор компонентов можно передавать в `presetGranularity` или `presetGranularityNode`.