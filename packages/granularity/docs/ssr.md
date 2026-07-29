# SSR-контракт

Какие компоненты безопасно рендерить на сервере, где нужны оговорки и как
подключать пакет в SSR-приложении (Nuxt, `vite-ssr`, собственный
`@vue/server-renderer`).

> **Чем это проверено.** `apps/playground-ssr` — SSR-стенд на
> `@vue/server-renderer` с гидрацией в jsdom и живым dev-сервером. Утверждения
> про телепорты и гидрацию — его тесты, а не результат чтения исходников.
>
> Состояние на 2026-07-29, 60 компонентов, Vue 3.5.

## Короткий ответ

Пакет **безопасен для SSR целиком**: все 60 компонентов рендерятся на сервере и
гидрируются без расхождений. Оговорки касаются не безопасности, а того, что
именно приходит с сервера.

- **47 компонентов** не касаются DOM вообще.
- **4** трогают DOM только в обработчиках и хуках.
- **9 телепортирующих** (`GrSelect` в режиме `panel`, `GrAutocomplete`,
  `GrDropdown`, `GrTreeSelect`, `GrTooltip`, `GrModal` и всё на нём, `GrDrawer`,
  `GrToaster`, `GrImageViewer`) рендерят свои панели **на месте**, а в `body`
  переносят уже после гидрации.
- `GrSelect` **по умолчанию** — нативный `<select>`, телепорта нет вовсе.

## Как устроен телепорт при SSR

Панели, всплывашки и оверлеи живут в `body` — но попадают туда **не сразу**.

Контракт один на все компоненты и реализован композаблом
`useTeleportEnabled()`: телепорт выключен на сервере **и на первом клиентском
рендере**, а включается в `onMounted`. Отключённый телепорт (`:disabled`)
означает «рендерить на месте», поэтому серверный HTML и первый клиентский
рендер совпадают, гидрация проходит чисто, и только после неё содержимое
переезжает в `body`.

Что это значит для приложения:

- **панели приходят с сервера** — внутри разметки своего компонента, скрытыми
  (`display: none` от `v-show`), поэтому вспышки раскрытого списка нет;
- **`ssrContext.teleports` почти пуст** — там остаются только
  якоря-комментарии, по которым клиент находит целевой контейнер. Вставлять их
  в разметку всё равно нужно (`server.mjs` в `apps/playground-ssr` показывает
  как), иначе Vue не найдёт точку привязки;
- **client-only обёртки не нужны**.

Если пишете свой компонент с телепортом — берите тот же композабл, а не
`typeof window !== 'undefined'`: проверка окружения выглядит достаточной, но
именно она и создаёт расхождение.

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
3. Телепортируешь — `:disabled="!teleportEnabled"` из `useTeleportEnabled()`.
   Не `typeof window`: он даёт разный результат на сервере и на первом
   клиентском рендере, и это ломает гидрацию.
4. Браузерные API, которых может не быть и в браузере (`ResizeObserver`,
   `matchMedia`), проверять на существование — образец в `GrSegmented`.

## Смежное

- [`theming.md`](./theming.md) — тема и ранняя инициализация.
- [`z-index.md`](./z-index.md) — стек оверлеев.
- [`styling.md`](./styling.md) — порядок импорта CSS.
- `apps/playground-ssr` — SSR-стенд: живой dev-сервер, тесты серверного рендера
  и гидрации, воспроизведение дефекта §60.
