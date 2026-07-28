# SSR-контракт

Какие компоненты безопасно рендерить на сервере, где нужны оговорки и как
подключать пакет в SSR-приложении (Nuxt, `vite-ssr`, собственный
`@vue/server-renderer`).

> **Чем это проверено.** Классификация ниже получена не только аудитом
> исходников, но и реальным прогоном: `apps/playground-ssr` — SSR-стенд на
> `@vue/server-renderer` с гидрацией в jsdom и живым dev-сервером. Утверждения
> про телепорты и гидрацию проверяются его тестами.
>
> Состояние на 2026-07-29, 60 компонентов, Vue 3.5.

## Короткий ответ

- **47 компонентов** не касаются DOM вообще — рендерятся на сервере как есть и
  гидрируются без единого расхождения.
- **4** трогают DOM только в обработчиках и хуках — серверный рендер корректен.
- **Все телепортирующие компоненты** (`GrSelect` в режиме `panel`,
  `GrAutocomplete`, `GrDropdown`, `GrTreeSelect`, `GrTooltip`, `GrModal` и всё
  на нём, `GrDrawer`, `GrToaster`, `GrImageViewer`) **ломают гидрацию** и
  требуют обёртки client-only. Это дефект пакета, а не свойство SSR — см.
  ANALYSIS §60.
- `GrSelect` **по умолчанию** — нативный `<select>`, никакого телепорта: в
  дефолтной конфигурации он полностью изоморфен.

## Телепортирующие компоненты ломают гидрацию

Главный практический вывод стенда, и он неприятный.

**Механизм.** Структура серверной и клиентской разметки у этих компонентов
разная. Гард `:disabled="!isClient"` не спасает, а как раз и создаёт проблему:
на сервере телепорт **выключен** (содержимое рендерится на месте), на клиенте —
**включён** (содержимое уезжает в `body`). Vue гидрирует, ожидая одно, а
находит другое. У компонентов без гарда (`GrSelect panel`, `GrDropdown`,
`GrAutocomplete`, `GrTreeSelect`) картина зеркальная: на сервере содержимое
уходит в `ssrContext.teleports`, оставляя на месте комментарий-якорь.

**Последствия** (проверено на живом dev-сервере, Chrome + Vue 3.5):

- `[Vue warn]: Hydration node mismatch` и `Hydration completed but contains mismatches`;
- серверная панель остаётся в DOM сиротой — после гидрации панелей **две**;
- в худшем случае панель «прилипает» к контейнеру приложения и пишет в него
  свои стили (`position: fixed` + `display: none` у закрытой панели) — **страница
  исчезает целиком**. Именно так вела себя демо-страница, пока проблемные
  компоненты не завернули в client-only.

**Что делать до починки пакета** — рендерить их только на клиенте:

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mounted = ref(false)
onMounted(() => { mounted.value = true })
</script>

<template>
  <GrSelect v-if="mounted" v-model="value" :options="options" options-view="panel" />
</template>
```

Готовая обёртка — `apps/playground-ssr/src/ClientOnly.vue`; в Nuxt для этого
есть встроенный `<ClientOnly>`.

**Вставлять ли `ssrContext.teleports` в разметку.** Да: без этого расхождений
заметно больше (на демо-странице 11 против 4). Но проблему это не устраняет —
только смягчает.

## Полностью изоморфные (47)

Ни одного обращения к DOM или браузерным API:

`GrAlert`, `GrAvatar`, `GrBadge`, `GrBadgeWrap`, `GrBottomNav`, `GrButton`,
`GrButtonGroup`, `GrCard`, `GrCheckbox`, `GrCollapse`, `GrConfigProvider`,
`GrConfirmDialog`, `GrDataTable`, `GrDialog`, `GrDivider`, `GrDropdownMenu`,
`GrEmptyState`, `GrFileUpload`, `GrForm`, `GrFormField`, `GrFormFile`,
`GrFormSection`, `GrIcon`, `GrInput`, `GrInputTag`, `GrKbd`, `GrLink`, `GrList`,
`GrLoading`, `GrNavbar`, `GrNumberInput`, `GrPagination`, `GrProgressBar`,
`GrPromptDialog`, `GrRadio`, `GrRadioGroup`, `GrRating`,
`GrResponseErrorBanner`, `GrSidebar`, `GrSkeleton`, `GrStatistic`, `GrSwitch`,
`GrTabPanels`, `GrTable`, `GrTabs`, `GrTextarea`, `GrTree`.

`GrConfirmDialog`, `GrDialog` и `GrPromptDialog` попали сюда потому, что вся
DOM-механика у них — в `GrModal`, на котором они построены.

## DOM только в обработчиках и хуках (4)

`GrCommandPalette`, `GrDialogService`, `GrSegmented`, `GrSlider`.

Серверный рендер безопасен: обращения живут в `onMounted`/`onBeforeUnmount` и в
слушателях событий, которые на сервере не выполняются. Конкретно:

- `GrSlider` — `window.addEventListener('pointermove'…)` при захвате бегунка;
- `GrSegmented` — `ResizeObserver` в `onMounted` (с проверкой
  `typeof ResizeObserver === 'undefined'`);
- `GrCommandPalette` — глобальный хоткей `mod+k`, вешается с проверкой
  `typeof window === 'undefined'`;
- `GrDialogService` — императивный API, целиком выходит из строя без DOM и
  поэтому проверяет `typeof window`/`typeof document` на входе.

## Композаблы и директивы

| API | На сервере |
| --- | --- |
| `useTheme()` | безопасен: чтение `localStorage` и `matchMedia` под `typeof window === 'undefined'`, на сервере отдаёт `light` |
| `initThemeEarly()` | безопасен, но смысла на сервере не имеет — его задача убрать «мигание» темы до монтирования, вызывать в браузерной точке входа |
| `useToast()` | безопасен: модуль знает про `IS_SERVER`, таймеры автодисмисса на сервере не заводятся |
| `useGrFormFieldContext()`, `useGrConfig()` | чистые, DOM не трогают |
| `vClickOutside`, `vHotkey`, `vLoading` | директивы работают в хуках `mounted`/`unmounted` — на сервере не вызываются |

## Тема без «мигания»

Тема живёт на атрибуте `[data-theme]` у `<html>`, и сервер о выборе
пользователя не знает. Классическое решение — инлайновый скрипт в `<head>`
до первого рендера:

```html
<script>
  try {
    var t = localStorage.getItem('gr-theme')
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    document.documentElement.dataset.theme = t
    document.documentElement.classList.toggle('theme-dark', t === 'dark')
  } catch {}
</script>
```

Ключ `gr-theme` и оба селектора — тот же контракт, что использует `useTheme()`
(см. [`theming.md`](./theming.md)).

## CSS в SSR

CSS пакета статичен и на серверный рендер не влияет: `foundation.css` /
`styles.css` подключаются как обычные стили. Критично только одно — тема должна
примениться до первой отрисовки, иначе получите вспышку светлой темы у
пользователя с тёмной (см. скрипт выше).

## Правила для нового компонента

1. DOM — только в `onMounted`/`onBeforeUnmount` и обработчиках. Ни одного
   обращения в теле `setup` и на уровне модуля.
2. Нужен `document`/`window` вне хука — гард `typeof window === 'undefined'`,
   а не `try/catch`.
3. Телепортируешь — помни, что **оба нынешних приёма ломают гидрацию**
   (см. раздел выше). Пока §60 не починен, единственный рабочий вариант для
   потребителя — client-only, а правильное решение внутри компонента —
   включать телепорт не по `typeof window`, а после монтирования: тогда первый
   клиентский рендер совпадает с серверным, а телепорт включается уже потом.
4. Браузерные API, которых может не быть и в браузере (`ResizeObserver`,
   `matchMedia`), проверять на существование — образец в `GrSegmented`.

## Смежное

- [`theming.md`](./theming.md) — тема и ранняя инициализация.
- [`z-index.md`](./z-index.md) — стек оверлеев.
- [`styling.md`](./styling.md) — порядок импорта CSS.
- `apps/playground-ssr` — SSR-стенд: живой dev-сервер, тесты серверного рендера
  и гидрации, воспроизведение дефекта §60.
