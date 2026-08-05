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

По текущему component registry пакет публикует следующие компоненты. Имя-ссылка
означает, что у компонента есть своя страница в [`components/`](./components/) —
там его особенности, оговорки и примеры.

- `GrAlert`
- `GrAutocomplete`
- `GrAvatar`
- `GrBadge`
- `GrBadgeWrap`
- `GrBottomNav`
- `GrButton`
- `GrButtonGroup`
- `GrCard`
- [`GrCheckbox`](./components/GrCheckbox.md)
- [`GrCheckboxGroup`](./components/GrCheckboxGroup.md)
- [`GrCollapse`](./components/GrCollapse.md)
- `GrCommandPalette`
- `GrConfigProvider`
- `GrConfirmDialog`
- [`GrDataTable`](./components/GrDataTable.md)
- `GrDialog`
- `GrDialogService`
- `GrDivider`
- [`GrDrawer`](./components/GrDrawer.md)
- `GrDropdown`
- [`GrDropdownMenu`](./components/GrDropdownMenu.md)
- `GrEmptyState`
- `GrFileUpload`
- `GrForm`
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
- `GrPopover`
- `GrProgressBar`
- `GrPromptDialog`
- `GrRadio`
- `GrRadioGroup`
- `GrRating`
- `GrResponseErrorBanner`
- `GrSegmented`
- `GrSelect`
- `GrSidebar`
- `GrSkeleton`
- `GrSlider`
- `GrStatistic`
- `GrSwitch`
- `GrTable`
- `GrTabPanels`
- `GrTabs`
- `GrTextarea`
- `GrToaster`
- `GrTooltip`
- `GrTree`
- `GrTreeSelect`

## Страница компонента: что туда писать

Этот файл — каталог и общие правила импорта. Описание конкретного компонента
живёт в `components/GrX.md`, один компонент — один файл.

**Правило:** правка, меняющая поведение или API компонента, описывается на его
странице. Файла ещё нет — он заводится этой же правкой, а имя в списке выше
становится ссылкой.

Что писать на странице:

- назначение одной фразой — зачем компонент, а не из чего состоит;
- неочевидные решения и их причины: почему подпись снаружи роли, почему
  `required` не уходит в нативный инпут, почему панель `inert`. Это то, чего из
  сигнатуры пропа не видно и что иначе сломает следующий читатель;
- оговорки и границы применимости: что компонент не делает и чем это лечится;
- примеры на сценарий (`vue`/`ts`), а не на каждый проп.

Чего на странице быть не должно:

- **полного перечня пропов, слотов и эмитов** — он генерируется из исходников
  в витрину (`componentApi.generated.json`) и в `web-types.json`; список,
  написанный руками, разойдётся с кодом молча;
- того, что уже описано сквозным документом: клавиатура —
  [`keyboard.md`](./keyboard.md), размеры — [`sizes.md`](./sizes.md), токены и
  темы — [`tokens.md`](./tokens.md) и [`theming.md`](./theming.md), слои —
  [`z-index.md`](./z-index.md), серверный рендер — [`ssr.md`](./ssr.md),
  движение — [`motion.md`](./motion.md). В сквозном документе компонент
  упоминается строкой, на его странице — ссылка на неё;
- истории правки («раньше было…», «до 0.5.0 работало так») — её место в
  `CHANGELOG.md`.

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