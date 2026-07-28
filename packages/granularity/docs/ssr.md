# SSR-контракт

Какие компоненты безопасно рендерить на сервере, где нужны оговорки и как
подключать пакет в SSR-приложении (Nuxt, `vite-ssr`, собственный
`@vue/server-renderer`).

> **Оговорка о доказательности.** Классификация ниже получена аудитом исходников
> (обращения к `document`/`window`/браузерным API и `<teleport>`), а не прогоном
> SSR-тестов: SSR-стенда в репозитории нет. Для критичного сценария проверяйте
> на своём приложении.
>
> Состояние на 2026-07-29, 60 компонентов.

## Короткий ответ

- **47 компонентов** не касаются DOM вообще — рендерятся на сервере как есть.
- **4** трогают DOM только в обработчиках и хуках — на сервере это не
  исполняется, серверный рендер корректен.
- **5 оверлеев** отключают телепорт на сервере (`:disabled="!isClient"`) и в
  серверный HTML не попадают — это осознанный контракт.
- **4 floating-компонента** телепортируют панель **без** гарда — единственное
  место, где SSR-потребителю нужно быть внимательным (см. ниже).

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

## Оверлеи: телепорт отключён на сервере (5)

`GrDrawer`, `GrImageViewer`, `GrModal`, `GrToaster`, `GrTooltip`.

Все пять рендерят `<teleport to="body" :disabled="!isClient">`. На сервере
телепорт выключен, а сам оверлей закрыт (`modelValue: false`), поэтому в
серверный HTML не попадает ничего. Контент появляется после гидрации.

**Практическое следствие:** модалку, открытую «сразу» (`modelValue: true` в
начальном состоянии), сервер не отрисует — она возникнет только на клиенте. Если это
важно для первого экрана, не стройте его на оверлее.

## Floating-панели: телепорт без гарда (4)

`GrAutocomplete`, `GrDropdown`, `GrSelect`, `GrTreeSelect`.

Здесь `<teleport to="body">` **без** `:disabled`, а видимость панели управляется
`v-show="open"`. Значит на сервере телепорт выполняется: содержимое панели
уходит не в HTML компонента, а в `ssrContext.teleports`.

Что с этим делать:

- если приложение вставляет `ssrContext.teleports` в разметку (Nuxt делает это
  сам) — панель окажется в теле документа скрытой (`display: none`), поведение
  корректное;
- если не вставляет — панель просто не попадёт в серверный HTML и появится
  после гидрации. Возможен hydration-warning на целевом контейнере.

Триггер (кнопка, инпут, поле выбора) рендерится на сервере в обоих случаях —
первый экран не «прыгает».

Асимметрия с предыдущим разделом историческая, а не осознанная: оверлеи гард
получили, floating-компоненты — нет. Если ваш SSR-стенд ловит на них
mismatch — это не «так задумано», а место для правки в пакете.

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
3. Телепортируешь — либо `:disabled="!isClient"` (оверлей, на сервере не нужен),
   либо `v-if` по открытости (панель, которой на сервере всё равно нет).
4. Браузерные API, которых может не быть и в браузере (`ResizeObserver`,
   `matchMedia`), проверять на существование — образец в `GrSegmented`.

## Смежное

- [`theming.md`](./theming.md) — тема и ранняя инициализация.
- [`z-index.md`](./z-index.md) — стек оверлеев.
- [`styling.md`](./styling.md) — порядок импорта CSS.
