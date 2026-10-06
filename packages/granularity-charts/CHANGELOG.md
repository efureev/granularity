# Changelog

All notable changes to `@feugene/granularity-charts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Пустой график держит заданную `height`.** Заглушка «нет данных» сжимала
  область построения до `min(height, 8rem)`: `GrChartArea` с `:height="260"`
  занимал с данными 260px, а на периоде без данных — 128px, и карточка вокруг
  прыгала (скелет загрузки высоту держал). Теперь данные, загрузка и пустота —
  `series: []` или `empty` — занимают одну `height` у всех графиков на общей
  раме: `GrChartArea`, `GrChartBar`, `GrChartLine`, `GrChartPie`, `GrChartRadar`,
  `GrChartFunnel`, `GrChartHeatmap`, `GrChartWaterfall`, `GrChartBullet`. Хук
  `--gr-chart-frame-empty-height` остался — по умолчанию он равен `height` и
  сжимает заглушку, если его задать; выше `height` она по-прежнему не растёт.
- **Подпись оси значений не срезается краем холста.** Отступ под ось считался по
  отформатированной подписи, но оценка ширины была уже настоящей: цифры шли по
  0.55 кегля, «1» — по 0.32, «%» — по 0.68, тогда как в Inter, первом шрифте
  `--gr-font-ui`, это 0.6–0.65, 0.41 и 0.98. В итоге `yTickFormat` с «100%»
  получал на ~6px меньше, и подпись читалась как «l00%». Оценка
  (`estimateTextWidth`) теперь ошибается вверх: классы символов — потолок по
  шрифтам стека (Inter, системный, Arial/Helvetica), отдельно цифры и знаки
  валют, отдельно самые широкие (`%`, `m`, `M`, `W`, `Ж`, `Ш`…), заглавные — по
  регистру, в том числе кириллица. Поверх оценки — запас в 2px. Касается левой и
  правой (`dualAxis`) оси значений, подписей оси X и всех графиков на общей раме.
- **Имена категорий горизонтального `GrChartBar` читаются целиком.** Колонка
  подписей была ограничена 96px на любом холсте, и «Delivered after the promised
  date» на графике в 550px превращалась в «Delivered af…», хотя полосам места
  хватало с избытком. Теперь потолок — 40% ширины области построения (но не
  меньше 96px), многоточие появляется только за ним, полное имя остаётся в
  `<title>`, тултипе и скрытой таблице. Так же считаются подписи шагов
  горизонтального `GrChartWaterfall` и строк `GrChartHeatmap`; строка
  теплокарты шире потолка теперь кончается многоточием с полным текстом в
  `<title>`, а не уезжает за край холста.
- **Подписи колонок `GrChartHeatmap` не налезают друг на друга.** Подписи стояли
  по центру ячеек целиком при любой ширине: в матрице шириной 213px с колонками
  «Starter», «Team», «Business» ячейки по 31px, и подписи сливались в
  «StarterTeamBusiness». Теперь подпись, которая не помещается в ячейку,
  усекается многоточием (полный текст — в `<title>`), пока от неё остаются хотя
  бы три знака; дальше ряд прореживается с первой и последней колонкой, и каждая
  подпись занимает место только до середины пути к соседям. Имя строки
  «Recurring invoices» больше не срезается краем холста — это часть правки
  оценки ширины выше.
- **Подписи оси X не налезают друг на друга.** Число делений выбирала шкала, а
  ширина подписей в выбор не входила: `GrChartLine` на карточке в 250px с
  двадцатью пятью получасами категориями рисовал «00:0030:0001:00…», месяцы —
  «NoDecJanFebMar…», даты помесячно — «Jan 2026Apr 2026Jul 2026Oct 2026». Теперь
  рама после выбора делений проверяет подписи по оценке ширины и, если соседние
  сталкиваются, показывает каждую `k`-ю с первой и последней — на любой шкале:
  категориальной, временной и числовой. Сетка остаётся на всех делениях.
  Касается `GrChartLine`, `GrChartArea`, `GrChartBar` и вертикального
  `GrChartWaterfall`.
- **`xTickCount` работает у категориальной оси** — как потолок числа подписей
  (не задан — двенадцать, как прежде). Умолчание пропа у `GrChartLine`,
  `GrChartArea` и `GrChartBar` теперь `undefined`; для числовой и временной оси
  это по-прежнему шесть делений.
- **Ось времени не схлопывается в одно деление.** Лестница шагов прыгала с
  квартала сразу на год, и `xTickCount: 4` на одиннадцати месяцах давал одно
  деление «Dec». В лестнице появились шаги в 2 и 6 месяцев, а ступень
  выбирается по настоящему числу делений после выравнивания: не больше
  `xTickCount` и не меньше двух, если диапазон их вмещает.
- **Слот `#center` у `GrChartPie` можно поставить в центр.** Слот рисуется
  внутри холста, а получал только `total` и `formattedTotal`: своё SVG («92%» и
  «on time» вместо суммы) ложилось в начало координат холста, а не в дырку.
  Теперь слот получает и геометрию: `cx`, `cy`, `innerRadius`, `valueFont`,
  `labelFont` — по ним стоит и содержимое по умолчанию. Пример — на странице
  компонента. `formattedTotal` форматируется по `valueFormat`, как и раньше.
- **Ось значений `GrChartWaterfall` — по накоплениям, а не по шагам.** Ряд рамы
  нёс собственные значения шагов, и дельты попадали в домен: у отчёта о
  прибылях 1240 → −410 → 830 → … ось уходила до −500, у складского моста — до
  −1000, хотя накопление нигде не опускалось ниже нуля. Теперь стороны домена —
  основания и вершины столбцов вместе с нулём; `yDomain` потребителя сильнее.
- **С `yDomain`, чей низ выше нуля, столбцы моста не вылезают за область.**
  Итоговый столбец от нуля уходил под ось поверх подписей «Start of Sep», «End
  of Sep». Теперь концы столбцов прижимаются к краю домена — обрыв виден, — а
  соединители и нулевые шаги вне домена не рисуются.
- **Каждый шаг моста назван, и подписи не налезают.** Подписи шагов стояли
  целиком: восемь шагов на 510px и пять на 210px сливались. Прореживать их, как
  у категорий, нельзя — мост без имени шага не прочитать, — поэтому рама в
  режиме `xLabelFit: 'wrap'` переносит подпись по словам на две строки, дальше
  усекает её многоточием с `<title>`; нижнее поле растёт на строку. Все шаги
  подписаны и сверх двенадцати.
- **Горизонтальный мост оставляет место под последнюю подпись оси значений** —
  «2,000» больше не срезается до «2,00» краем холста, как уже было у
  горизонтальных столбцов.
- **Паутина `GrChartRadar` не отдаёт радиус подписям.** Отступ под самую
  длинную подпись резервировался с каждой стороны: в карточке 213×260 с осями
  «System design», «Go», «SQL», «On-call», «Mentoring» паутина сжималась до 25px
  под наползающим текстом, а при `axis-scale="per-axis"` («Orders a day · 200»)
  пропадала совсем. Теперь радиус — наибольший, при котором каждая подпись
  помещается со своей стороны, но не меньше половины от возможного; имя шире
  четверти холста переносится на две строки, дальше — многоточие с полным
  текстом в `<title>`. Потолок оси при `per-axis` стоит второй строкой («max
  200») и не усекается. Подписи колец переехали с первой спицы на биссектрису
  между первой и второй: внешнее кольцо налезало на имя верхней оси.
- **Гидрация радара и круга без расхождений.** Координаты из тригонометрии
  писались полным числом, и сервер с браузером расходились в последнем знаке
  (`229.37383539249433` против `…436`). Теперь спицы, кольца, вершины, дуги,
  выноски и центр круга идут через `svgCoord` с двумя знаками.
- **Подсказка графика прячется, когда точка уехала из вида.** Курсор, поставленный
  программно (`v-model:active-index` у пары графиков), оставлял подсказку
  прижатой к краю вьюпорта поверх чужого содержимого, а до первого расчёта
  позиции — в левом верхнем углу. Рама включает `hideWhenDetached` у
  `useFloating` ядра; работает с ядром 1.0.10 и новее.
- **Воронка подписывает ступени именами.** `GrChartFunnel` не рисовал имён
  ступеней вовсе — какая полоса что значит, знали только тултип и скрытая
  таблица. Теперь у вертикали имена стоят колонкой слева (до 40% ширины, не уже
  96px), у горизонтали — строкой под ступенями; длинное имя кончается
  многоточием с полным текстом в `<title>`.
- **Подпись значения воронки не пропадает на узкой ступени.** Подпись, которая
  не помещалась внутри, не рисовалась: у воронки 12400 → 3180 → 1420 → 612 с
  `labels="share-first"` последняя ступень оставалась без «5%», у 940 → 1360 →
  410 → 0 пропадали «410» и обещанный документацией «0». Теперь такая подпись
  стоит рядом со ступенью — справа от её середины у вертикали, над ней у
  горизонтали — цветом подписи рамы.
- **`tooltip: false` прячет только панель.** Флаг выключал всё слежение за
  указателем: график с `:tooltip="false"` в паре на одном
  `v-model:active-index` не двигал курсор под мышью, не излучал
  `update:activeIndex` и `pointHover` — синхронизация шла только в одну
  сторону. Теперь курсор, активные марки, вертикаль и события работают, пока
  график интерактивен; картинкой его делает только `interactive: false`.
  Поведение описано в JSDoc пропа `tooltip` у всех графиков.
- Появились описания у пропов, событий и слотов всех графиков, которые в API,
  подсказках IDE и на портале были пустыми: у общих пропов (`height`,
  `yDomain`, `includeZero`, `yDomainRight`, `yTickFormatRight`,
  `valueFormatRight`, `xTickCount`, `yTickCount`, `xTickFormat`, `yTickFormat`,
  `valueFormat`, `curve`, `showPoints`, `showGrid`, `showLegend`,
  `legendPosition`, `tooltip`, `loading`, `empty`, `emptyText`, `dataTable`,
  `size`, `locale`, `ariaLabel`, `ariaDescription`) и у своих — `min` и
  `orientation` буллета, `stages` воронки, `xLabels`, `yLabels` и цветов шкалы
  теплокарты, `variant` круга и спарклайна, `fill` радара, `steps`,
  `showConnectors` и `barRadius` моста; у событий `update:*`, `*Click`,
  `*Hover`, `legendToggle` и слотов `tooltip`, `legend`, `empty`, `header`.

## [v1.0.2] 2026-10-06

### Changed

- **Safelist компонентов пуст.** Все записи лежали в коде целыми литералами —
  в шаблонах и `.ts`-хелперах, включая раму `GrChartFrame`. granum извлекает
  такие классы сам, обходя от входа компонента все его чанки, общие
  включительно, и вычищал записи из манифеста как уже извлечённые. Списки
  пережили UnoCSS-пресет, который общий чанк не сканировал. Набор классов не
  изменился — проверено сверкой манифестов по селекции каждого компонента;
  расходятся только случайные токены, которые экстрактор выхватывает из
  минифицированного кода.
- Удалены `chartFrameSafelist` и `internal/classTokens.ts`: они служили только
  спискам. Что рама доходит до каждого графика по графу бандла, теперь
  проверяет `frameOwnership.test.ts`.
- Подключён гейт `defineSafelistGate` из test-kit: запись safelist, которая
  лежит целым литералом в коде компонента, он называет лишней. Нужен safelist
  только классу, собранному в рантайме из частей.

## [v1.0.1] 2026-09-29

Гигиена сборки. Артефакт пакета не изменился — проверено побайтно.

### Changed

- **`libInjectCss` убран из конфига сборки.** Плагин вписывал в JS-чанк
  компонента `import '../styles.css'`; до granum это был единственный канал
  доставки стилей, а с granum тот же файл приезжает приложению через манифест —
  и потребитель получал два экземпляра, причём второй **вне слоёв `granum.*`**
  и потому сильнее всей библиотеки.

  У этого пакета компонентного CSS нет, и плагин стоял вхолостую: сборка с ним
  и без него совпадает побайтно, числа в `docs/entry-sizes.md` не сдвинулись.
  Убран до того, как появится первый компонент со стилями — тогда ловушка
  захлопнулась бы молча.

  Ядро сняло плагин при переезде на granum, `granularity-editor` и
  `granularity-code` — в 1.0.1, где он уже стрелял. Диагностика
  `css-double-delivery`, которая обязана была это назвать, не работала вовсе;
  починена в `@feugene/granum` 1.0.2.

- `vite-plugin-lib-inject-css` убран из devDependencies: больше не импортируется.

## [v1.0.0] 2026-09-28

Переезд на `@feugene/granum` 1.0 и первый мажор пакета.

Публичная поверхность не менялась — ломающий тут сам конвейер: peer-зависимость
уезжает с `@feugene/unocss-preset-granular` на `@feugene/granum`
(`>=1.0.0 <2.0.0`), а приложение переходит с `uno.config.ts` на
`granum.config.ts`. Версия выровнена с ядром: `@feugene/granularity` 1.0.0.

Перед обновлением стоит прочитать руководство по переезду в granum — в
частности про каскадные слои и сброс браузерных стилей, который теперь нужно
импортировать в слой.

### Changed

- **`yarn doctor` is `granum doctor --strict`, without a wrapper script.**
  `scripts/granum-doctor.mjs` existed for two reasons and both are gone. It muted
  `token-undefined` through the monorepo's token registry — granum 0.4.0 derives
  the same verdict from the code itself (a use with a fallback, a token the
  component assigns itself and `dynamicTokens` are not findings), so the registry
  is unnecessary. And it kept recorded debt from failing the gate — that is now
  `--allow=<codes>`. Findings across the eight packages went from 861 to 1, and
  that one is the deliberate `!important` on the drag cursor in `GrTransfer`,
  recorded through `--allow`.
- **Safelists in the manifests shrank from 3479 entries to 430** (zero in every
  companion): granum drops entries that static extraction already covers. Nothing
  in the sources changed and the CSS is byte-for-byte identical — the safelist
  there is derived from the component's own class constants, and whether
  extraction sees a given class is decided by chunking, not by the author.
- **The utility engine changed: `@feugene/granum-engine-wind` `^0.4.0` instead of
  `@feugene/granum-engine-mini`.** It vendors `preset-wind3` rather than
  `preset-mini`, so the vocabulary gained `border-collapse`, `list-none`,
  `touch-none`, `table-fixed` and `scroll-p*` — utilities that existed neither in
  `preset-mini` nor in the former extra rules, which is why a class in the markup
  silently produced no CSS. The package dialect is now
  `unocss/preset-wind3+granum@66`, and the peer on the core moved to
  `>=0.3.0 <1.0.0`. A consumer swaps the pair in dev dependencies and replaces
  `miniEngine()` with `windEngine()` in `granum.config.*`.
- **The package is built by `@feugene/granum`, not by the `@feugene/unocss-preset-granular` preset.** The
  `dist` layout and the component entries are driven by the
  `granumProvider({ provider, engine: miniEngine(), entries })` plugin: it builds them from the provider
  registry, extracts the classes and the consumed tokens by walking the bundle graph, and writes a
  machine-generated `granum.manifest.json` next to `dist`. The package's own `build.lib`,
  `granularChunkFileNames` and hand-written component entries are gone from `vite.config.ts`.
- **The manifest is exported as `./granum.manifest.json`.** An application resolves it through exactly that
  subpath — without the export the package's provider cannot be wired up. granum never scans
  `node_modules`: the component classes are computed when the package is built.
- **The peer changed: `@feugene/granum` `>=0.2.0 <1.0.0` instead of the preset.** The utility engine comes
  from the application (`@feugene/granum-engine-mini` sits in the package's dev dependencies), while the
  package declares a **vocabulary dialect** in the manifest — `unocss/preset-mini+granum@66`, the
  vocabulary its component classes are written against. An application running an engine of a different
  vocabulary gets `provider-dialect-mismatch` and every lost class listed by name instead of silently
  half-drawn components.
- **The descriptor contract was renamed without a change of meaning.** `defineGranularComponent` →
  `defineGranumComponent`, `defineGranularProvider` → `defineGranumProvider`, imported from
  `@feugene/granum/contract`. Donors are declared as **strings**
  (`dependencies: ['@feugene/granularity']`) rather than instances: an instance would pull the donor into
  the graph in object form and make the application scan its `dist` instead of reading the manifest.
  `packageBaseUrl` is gone — the manifest's directory is the base — so `granular-provider/node` is now a
  plain alias of the browser entry.
- **`granular.options.mjs` was replaced by `granum.config.mjs`**, and `yarn doctor` runs `granum doctor`
  against the package's manifests.

## [v0.11.0] 2026-08-30

### Added

- **Chart components declare the layer tokens their frame reads.** The tooltip
  of `GrChartFrame` is positioned by the core's `useFloating`: the layer name is
  passed to it as a parameter and the `var()` is assembled at runtime inside the
  core's `overlayStack.ts`. Neither `var(--gr-z-tooltip)` nor
  `var(--gr-z-modal)` appears anywhere in this package.

  Measured with `granular prune` before the change: `gr-z-tooltip` survived only
  because the `GrChartFrame` group ships its shared SFC into a scanned
  directory, while `gr-z-modal` was removed outright — a chart opened inside a
  modal would have lost its tooltip stacking. Nine components now declare both.

  Gated by `src/__tests__/dynamicTokens.test.ts`, which scans the component
  directory together with the shared directory of its group, since it is the
  frame that calls the composable.


## [v0.10.1] 2026-08-27

### Fixed

- Development warnings never reached the browser: the `__GR_DEV__` guard included a `typeof process` check, and
  `process` is undefined in the browser, so the whole expression collapsed to `false` in development too. The
  guard now matches the core package. Production bundles are unaffected — the branch is still dropped.

## [v0.10.0] 2026-08-27

### Changed

- **Peer floors on `@feugene/*` raised to the current minor.** Every peer this package
  declares on the ecosystem now starts at the version the monorepo actually ships:

  - `@feugene/fint-i18n` → `>=0.7.0 <1.0.0`
  - `@feugene/granularity` → `>=0.36.0 <1.0.0`
  - `@feugene/unocss-preset-granular` → `>=0.13.0 <1.0.0`
  - `@feugene/unplugin-granularity` → `>=0.7.0 <1.0.0`

  The floors had drifted far behind — some still admitted releases from a year of
  development ago — and a range that claims support it was never tested against is
  worse than a narrow one: the install succeeds and the breakage surfaces later, in
  the consumer's app.

  **This is breaking for anyone below a floor.** Installing against an older
  `@feugene/granularity` now produces a peer conflict instead of silence. The fix is
  to move the core up; nothing in this package's own API changed.

## [v0.9.0] 2026-08-20

### Changed

- **`canvasThreshold` now counts drawn vertices, not total points, and defaults to `24_000`
  instead of `2000`.** If you set this prop, re-read it: the old number now means "canvas almost
  always".

  The old axis was simply the wrong one. Decimation caps **each series** at the resolution of the
  screen — about two vertices per pixel — so one series of 100 000 points draws as 2400 vertices and
  costs a millisecond, while twenty series of 2400 (the same 48 000 points) cost sixteen. Total
  points say nothing about the price; `series × drawn vertices` does.

  Until now the prop gated markers rather than any canvas — there was no canvas in the package. That
  cap still exists, at the same number, as an internal constant: marker behaviour is unchanged.

### Added

- **A canvas renderer above the threshold**, for `GrChartLine` and `GrChartArea`. Measured at 1200px
  wide with 2400 vertices per series: SVG grows linearly at ~0.8 ms per series and stops fitting a
  frame at twenty (16.3 ms); canvas stays near flat (1.7 ms). Below a few series the difference is
  noise, which is why the threshold is high rather than aggressive.

  **Accessibility is untouched by the switch.** The cursor, keyboard, tooltip and hidden table work
  off one transparent overlay and the full series — never off the marks — so they carry over
  unchanged. The canvas is `aria-hidden` and does not take pointer events. The accessibility suite
  runs against both renderers.

  `canvasThreshold: 0` disables canvas entirely, for when the drawing has to stay vector: printing,
  SVG export, custom CSS over the marks.

  Two consequences worth knowing: the grid moves into the canvas (it has to stay under the series,
  and the canvas sits under the `<svg>` so that axes and the active point stay on top), and a
  gradient area fill becomes a solid one — `url(#…)` means nothing to a canvas, and twenty
  gradient-filled areas read as mush anyway.

- `curveCommands` and `commandsToPath` in the geometry module. Curve maths is now computed once into
  numeric draw commands, and the `d` string and the canvas each read from it. The two renderers have
  nowhere to diverge — the equivalence is pinned by a test.

## [v0.8.1] 2026-08-20

### Fixed

- **Two dev warnings no longer reach production.** Repeated categories in a series and a series carrying
  both `data` and `x`/`y` are reported through `console.warn`, and neither call was behind a condition —
  the message shipped in consumers' builds. The package now expands `__GR_DEV__` on build like the core
  does, and the paired `gr-check-dist-dev-guard` runs on `yarn build` so a substitution that stops
  working fails the build instead of reaching a consumer as `__GR_DEV__ is not defined`.

## [v0.8.0] 2026-08-20

### Added

- **The x-axis window is operable from the keyboard**, closing the gap `0.7.0` shipped with. `+`/`-`
  zoom, `Shift`+arrows pan by a quarter of the window, `0` restores the full series. Zooming anchors
  on the **active point** rather than the window centre — anchored on the centre, the ends of a
  series would stay out of reach however long you held the key. The keys are not a mode: the `zoom`
  union (`'brush' | 'wheel' | 'both'`) names **pointer gestures**, and the keyboard is on whenever
  zoom is on. Making it switchable would offer a way to build a zoom that cannot be reached from a
  keyboard — WCAG 2.1 SC 2.1.1 — by simply not writing a line. `Shift`+arrow belongs to the window
  even at full range, where it does nothing: one chord must mean one thing rather than pan or move
  the cursor depending on state. `Ctrl`, `Alt` and `Cmd` combinations are left to the browser. The
  hint naming these keys goes into the surface's **description**, not its name: consumers override
  the name with `ariaLabel` almost every time, and a hint living there would vanish with it.

### Changed

- **The hidden data table has a row cap: `dataTableMaxRows`, `'auto'` by default.** One row per point
  is readable while there are few rows; nobody reads ten thousand of them in sequence, and rebuilding
  that many costs on the order of a hundred milliseconds per zoom step. Above the cap the table
  prints **the points the chart draws** — same LTTB, same budget — and says so in a `tfoot` note.
  `'auto'` means "as many rows as anyone can read", not "whatever is drawn": it takes the drawing's
  budget when there is one — then the table matches the drawing exactly, down to the LTTB-selected
  points — and falls back to a flat 500-row ceiling with even sampling when there is none, which is
  the case for category scales and for `decimate: 'never'`. Anything else would let the whole point
  be lost behind one toggle. The prop exists on all nine types that have a table; where the type
  builds its own table model (pie, radar, funnel, bullet, waterfall, heatmap) the same ceiling
  applies as a row sample, so no chart type is left without a way to bound it.

  This reverses the earlier rule that the table always prints every row. That rule assumed trimming
  would hand a blind reader different data than a sighted one sees; on a long series the assumption
  is false — a sighted reader does not read ten thousand values either, they read the shape and hover
  for specifics. A table trimmed to what is drawn gives exactly that shape, and the per-point truth
  stays with the keyboard, which still walks the **full** series and announces every point. The
  contract did not weaken, it got sharper: **the table matches the drawing, the keyboard matches the
  data.** What to enable is the application's call — a number sets its own cap, `Infinity` removes it,
  `dataTable: 'off'` drops the table entirely. Measured on 10 000 points, a window change went from
  119 ms with the full table to 14 ms under `'auto'`, against 8 ms with no table at all.
- **A decimated series now carries its own `byX` index.** `decimateSeries` spread the original series,
  so the index described the full row set while `points` held the trimmed one — harmless today,
  because nothing read `byX` off a decimated series, and a trap the moment something did. The table
  above the cap is that something.
- **The hidden data table now follows the settled window rather than every step of it.** It holds one
  row per point, so rebuilding ten thousand of them costs on the order of a hundred milliseconds,
  while the wheel and key auto-repeat change the window dozens of times a second — a synchronous
  table turned the gesture into a queue of repaints the chart never caught up with. Measured on a
  10 000-point series, a window change went from 132 ms to 44 ms, and a continuous gesture now pays
  for one rebuild instead of one per step. The delay is 80 ms and applies to **window changes only**:
  new series, a hidden series or a different domain reach the table immediately. The contract is
  unchanged — at rest the table matches the drawing exactly; they differ only mid-gesture, when
  nobody is reading it, and the window change itself is announced through the live region
  synchronously.

## [v0.7.0] 2026-08-19

### Added

- **Zoom into a stretch of the x axis.** `GrChartLine` and `GrChartArea` gained `zoom`
  (`false | 'brush' | 'wheel' | 'both'`, default `false`) and `v-model:xWindow`. The window
  **selects data** rather than cropping the drawing: it is applied inside normalisation, right
  after sorting and before stacking, so positions, cursor, keyboard, hidden data table and the
  value-axis extent all follow it. That is deliberately the opposite of decimation, and the rule
  behind both is the same — the accessible representation must match what is on screen, and what is
  on screen is the user's choice. Decimation is invisible to the user, so hiding rows from a screen
  reader would be a lie; the window is visible, so the table follows it. One consequence is worth
  knowing: zooming resolves fine structure that reads as solid hatching at full range, because the
  decimation budget is measured against plot width and a narrow window holds fewer points, so each
  gets more vertices. The axis domain becomes
  the window itself rather than the extent of the surviving points, so a brushed stretch does not
  snap to the nearest data; `includeXValues` no longer widens it, since a reference past the edge
  would undo the zoom; `activeIndex` addresses the current window. A drag shorter than 4px is a
  click, not a brush, so picking a point still works; `Escape` cancels a drag in progress; the
  tooltip goes quiet while brushing; touch is left alone, because a drag across the canvas is how a
  page is scrolled. Category scales have no window, for the same reason they are never decimated.
- **`chart/chartZoom`** — the window arithmetic as a pure module: `windowFromPixels`, `zoomWindow`,
  `clampWindow` and `smallestGap`. A consumer restoring a zoom level from the URL needs no chart to
  compute it. `ChartData` also reports `fullXDomain`, the unwindowed extent — measure a gesture
  against the current window and there would be no way out of a zoom.
- **`alignedTicks` and `scaleForAxis` are re-exported** from `@feugene/granularity-charts/chart`.
  Both were announced in v0.4.0 but never left the barrel.

### Changed

- **The pointer hot path is indexed, not scanned.** Every normalised series now carries
  `byX: ReadonlyMap<number, NormalizedPoint>`, built in the same pass that reads the points. The
  tooltip's active point, `activeSymbolMarks`, the hidden table and the bar chart's tooltip anchor
  used to walk the whole series — up to `S + 2` full passes per change of active point, measured
  against complete series rather than decimated ones. `barHitIndex`, the only one that ran on
  **every** `pointermove` for bars and waterfalls, is now a binary search; a per-pixel sweep test
  pins it to the old traversal, ragged position sets included. `GrChartHeatmap` builds one cell
  instead of the whole matrix for its anchor and active outline.

### Fixed

- **The `canvasThreshold` doc block was attached to the wrong prop** on both `GrChartLine` and
  `GrChartArea`, and described the wrong mode: with default settings the threshold only gates
  `showPoints: 'always'`, because `'auto'` stops drawing markers earlier, at sixty points. The
  same inaccuracy is corrected in the showcase, whose API tables were also missing `decimate` and
  `maxPoints` entirely. The binary-search note in `chartScale` sat on `scaleForAxis` while
  describing `nearestIndex`.

## [v0.6.0] 2026-08-19

### Added

- **`GrChartBar` lays bars sideways.** `orientation="horizontal"` turns categories into rows, so a
  long department or product name reads as a line of text instead of a slanted, clipped tail — the
  scenario the docs used to redirect away from. Stacking, grouping, `'100%'`, references, legend,
  tooltip and the hidden data table behave exactly as they do vertically. Axes keep their data
  names in both layouts: `yDomain`, `yTickFormat` and `yTickCount` always address the value axis,
  so `showGrid: 'y'` draws vertical lines when the chart is horizontal. `dualAxis` is not supported
  sideways — the second value axis would have to sit on top, where the layout reserves no room; the
  prop is ignored and dev builds warn. Keyboard follows the eye: `ArrowDown`/`ArrowUp` walk the
  categories, `ArrowLeft`/`ArrowRight` switch the series being read.
- **Long series are decimated for drawing (LTTB).** `GrChartLine` and `GrChartArea` gained
  `decimate` (`'auto' | 'always' | 'never'`, default `'auto'`) and `maxPoints`; `GrSparkline` sizes
  its budget from its fixed canvas and needs no prop at all. Decimation shortens the `d` string and
  nothing else: the cursor, the keyboard, the tooltip and the hidden data table keep the full
  series, so `End` still lands on the ten-thousandth point and the table still prints every row.
  The budget is two vertices per pixel of plot width (at least 64), quantised to 32px so the path
  does not shimmer while a pane is resized; category scales are never decimated, gaps keep exactly
  one separator each, and a stack shares one set of abscissas across its group.

### Fixed

- **Axis labels no longer run off the canvas.** SVG has no `text-overflow`, so a category label
  wider than its gutter used to be cut by the canvas edge with no ellipsis — the reader saw the
  tail of a word with no sign that the start was missing. Labels are now trimmed to the reserved
  width with an ellipsis and carry the full text in `<title>`. The horizontal bar chart also
  reserves room for the outermost value tick, which is centred on its gridline and used to hang
  half its width past the edge.
- **`GrChartWaterfall` keyboard follows its horizontal layout.** Sideways, the steps run top to
  bottom, but the arrows still walked them left to right.

### Removed

- **`renderer` prop on `GrChartLine`.** It was never read by anything, and the documentation
  promised a canvas path behind it that does not exist in this package. Long series are handled by
  `decimate` instead.

## [v0.5.2] 2026-08-19

### Changed

- **Control-scale font sizes now ship a paired line height.** Every place that sets a control
  font size now sets the matching `leading-*` next to it, from the core's new
  `--gr-control-leading-*` steps. Before this the line height was inherited from the host
  application's `body`, and inherited as an absolute value — so how airy a caption looked was
  decided by someone else's CSS reset. Requires core `>=0.27.0`.

## [v0.5.1] 2026-08-18

### Changed

- Release-only bump: the workspace playground apps still pinned the core at
  `^0.20.0`, so yarn resolved a published copy for them instead of linking the
  workspace, and their uno config scanned that copy's `dist`. The pins are
  updated to the current range; nothing in this package's runtime changed.

## [v0.5.0] 2026-08-18

### Fixed

- **An empty chart still drew its legend, explaining colours that were not on screen.** A report with two declared
  series and no rows for the period showed
  "No payments in this period" with "Net revenue" and "Fee" listed underneath — a key to a picture that does not exist.
  The cause is that emptiness is decided by positions (`data.positions.length === 0`) while the legend is drawn from
  series, and a backend that knows its series but has no rows produces exactly that combination. The legend was the only
  visible layer of the frame without an `!isEmpty` guard; axes, grid, marks, references, crosshair, surface and tooltip
  all had one. It is now guarded in the frame rather than in each chart, which is what makes it hold for `GrChartPie`
  and `GrChartHeatmap` too: their own legends are passed into the very same slot, and a pie of zeros used to show the
  full list of labels with "0 · —" because its legend defaults to on. A legend beside a partially empty chart is
  untouched — while anything is still plotted, an empty series must keep its place so its neighbours do not change
  colour on the next filtering.
- **An empty chart reserved the full plotting area.** Seven of the nine charts default to 256px, so two empty cards side
  by side spent 500px of screen on one sentence. The frame no longer reserves that space when there is nothing to plot;
  the height comes from `--gr-chart-frame-empty-height` (8rem) and is capped by the declared `height`, so a chart
  explicitly given 80px does not grow from being empty. The loading state keeps the full height on purpose — its
  skeleton is a promise of the picture about to arrive, and shrinking it would make the page jump at the moment data
  lands.

## [v0.4.0] 2026-08-17

### Added

- A second value axis on `GrChartLine`, `GrChartArea` and `GrChartBar` — `dualAxis` plus `axis: 'right'` on a series.
  Money and counts do not share one axis: the smaller-magnitude series collapses into a line at zero, and the usual
  workaround is two charts side by side for one question. Without `dualAxis` the `axis` field is ignored, deliberately:
  two axes let any pair of series be fitted into an apparent correlation, so the second axis must be the chart author's
  decision rather than a side effect of a field in the data. Domains are computed separately, hiding a series moves only
  its own axis, and the stack never crosses axes — each side has its own totals. Both axes get the same number of ticks
  (`alignedTicks` takes the count from the left one): two independent "nice" ladders produce different line counts and
  the gridlines start doubling. The grid is drawn from the left axis only; the right one contributes labels. Table
  columns name their axis when both are present, and `yTickFormatRight` / `valueFormatRight` give the right axis its own
  units. No third axis, and no automatic
  "pleasing" ratio between the two — that ratio is exactly what manufactures false correlation.
- `chart/chartTicks.ts` gained `alignedTicks()`; `chart/chartScale.ts` gained `scaleForAxis()`.
- `GrChartFunnel` — conversion steps and the losses between them. Three numbers answer "how many got through"; a funnel
  answers "where we lose them". Both shares are computed against **different denominators** — of the first step and of
  the previous one — and both are available at once in the tooltip, the hidden table and the announcement: mixing them
  into one label is the standard way to flatter a funnel. Step width is proportional to the value, not to the ordinal,
  so a step larger than its predecessor is drawn honestly and named in
  `ariaDescription` rather than silently straightened — it is either a data error or two different cohorts, and that is
  the reader's call. A zero step keeps a minimum width: "nobody got here" is a result, not a missing step.
  `shape: 'bar'` and `'trapezoid'` differ in drawing only — values, shares and the table agree to the digit.
- `chart/chartFunnel.ts` — `funnelStages()` and `funnelPath()`, exported from the `./chart` subpath.
- `GrChartHeatmap` — a matrix where colour encodes the value: cohort retention, activity by hour and weekday, error
  share by service and version. The colour scale is one theme role mixed with `color-mix`, not a palette of five
  hand-picked colours — five would have to be picked again for the dark theme and again for the next heatmap.
  `steps` quantises the share (`0` for a continuous ramp); a diverging scale normalises against the larger distance from
  the midpoint, so it is symmetric by construction rather than by coincidence. `null` is neither zero nor the bottom of
  the scale: the cell is left unpainted, shows a dash in the table, and stays out of the domain — for cohorts, "the
  month has not arrived" and "retention is zero" are different statements. Short rows are padded with `null`, not zeros.
  The keyboard is two-dimensional (`←→` column, `↑↓` row, `Home`/`End` row edge, `PageUp`/`PageDown` column edge) and
  wraps on neither axis: jumping from the end of one row to the start of the next leaves the reader unable to tell which
  row they are in. The hidden table carries real row and column headers — a heatmap without it is unreadable outright,
  not merely less convenient.
- `chart/chartHeatmap.ts` — `heatmapMatrix`, `heatmapScale`, `heatmapColor`, `heatmapOnDark` and `heatmapCells`,
  exported from the `./chart` subpath.
- `ChartFrame` gained `keyboard`, `activeSeriesIndex` (with `update:activeSeriesIndex`) and `hitSeries`, so a chart with
  a second axis of navigation can drive it. Defaults reproduce the cartesian behaviour exactly.
- `GrChartBullet` — Stephen Few's bullet chart: a value, a target and qualitative ranges on one line. It answers
  "how good is this and how far to the next boundary", which a number next to a `warning` badge cannot. Three distinct
  visual weights so they do not compete: ranges are the background, the value is a narrow bar on top, the target is a
  tick across. No gauge is offered — it spends a lot of space on little data and reads poorly quantitatively.
  `value: null` is not zero: the value bar disappears, the target tick stays, the table shows a dash, and the `meter`
  role goes with it (the role requires `aria-valuenow`, and keeping it would be a serious axe violation). A value past
  the top of the scale is not truncated silently: the bar stops at the edge, gains an overflow marker, and the real
  figure still reaches the tooltip, the table and the announcement. A range boundary outside the scale is clamped rather
  than dropped, so `rangeColors` never shift onto neighbouring bands.
- `chart/chartBullet.ts` — `bulletLayout()`, exported from the `./chart` subpath.
- `ChartFrame` gained `surfaceRole` and `surfaceAttrs`, so a chart whose overlay is not an application can say so.
- `GrChartWaterfall` — a bridge from the opening balance to the closing one: every bar starts where the previous one
  ended. Diverging bars answer "how much came in and how much left"; the bridge answers "how one turned into the other",
  and shows whether the movements add up to the stated total. A `kind: 'total'` step declares the running total instead
  of adding to it, so real opening and closing figures can sit in the same chart and a mismatch becomes visible; no
  connector is drawn into such a step. Colour follows the sign, not a series index. A zero step is drawn as a rule at
  the running-total level rather than vanishing — "no movement" is a fact. The hidden table carries three numbers per
  step (change, running total before, running total after): a bridge cannot be reconstructed from the deltas alone.
  Steps are addressed by index rather than by label, so two steps sharing a name do not collapse into one position.
  `orientation: 'horizontal'` draws its own axes, since the frame's value axis is vertical by construction.
- `chart/chartWaterfall.ts` — `waterfallSegments()`, exported from the `./chart` subpath.
- `barPath()` gained a `toward: 'up' | 'down' | 'left' | 'right'` direction in place of the `up` boolean, so a
  horizontal bar can round its far end too. `<rect rx>` is still not an option: it rounds all four corners and the bar
  comes loose from its baseline.
- Reference lines and bands on `GrChartLine`, `GrChartArea` and `GrChartBar` — the `references` prop takes thresholds,
  plans and tolerance corridors. A single value draws a line, a pair draws a band; the pair order does not matter. A
  reference is never a series: it takes no palette index, stays out of the legend, out of the stack and out of the point
  tooltip, and reaches the hidden table as a `<tfoot>` note rather than a data row — a data row would assert an x
  position the threshold does not have. The axis domain is not stretched by default (`includeReferencesInDomain` opts
  in): a `1.0` threshold against data around `0.03` would collapse the data into a line at zero. A reference outside the
  domain is not drawn but stays in the chart description — "the threshold is not visible" and "there is no threshold"
  are different statements.
- `GrChartArea` gained `stacked: '100%'`, matching `GrChartBar`. Each position is normalised to one, the value axis
  switches to shares, and the fill goes solid as it already does for a plain stack — ribbons sit flush, and a gradient
  inside each would blur the boundary between them. Only the drawing is normalised: the tooltip, the hidden table and
  the live region keep reporting absolute values. A position summing to zero yields zero, not
  `NaN`. Share of a whole over time is what an area chart is for, and until now it could only be drawn with bars.
- `chart/chartReference.ts` — `normalizeReferences`, `referenceDomainValues`, `referenceMarks` and
  `referenceValueToNumber`, exported from the `./chart` subpath. Reference values accept `Date`, an ISO string and a
  category name; the ISO string lands on the same pixel as the equivalent `Date`.
- `NormalizeOptions.includeXValues` / `includeYValues` — values the domain must cover besides the data. Folded in before
  `padDomain`, so `includeZero` and padding apply to the union.
- `ChartTableModel.notes` — explanations rendered in `<tfoot>`, spanning the full width.
- `chart/chartLayout.ts` gained `labelGutters()` — room for a component's own labels, for charts that run with
  `axes: false` and label their marks themselves.
- Per-component documentation under `docs/components/` — one page per chart, plus a
  `docs/components.md` index. Until now the only per-component description lived in the showcase app
  (`companionPackages.ts`), so it never reached the published tarball.
- `defineComponentDocsGate` from `@feugene/granularity-test-kit` wired in: a component without a page can no longer
  ship.

## [v0.3.0] 2026-08-14

### Added

- `GrChartRadar` — radar chart: a profile across several axes and the comparison of profiles. Two axis scales —
  `shared` (one scale for every spoke, so the shape and the area are both comparable) and `per-axis` (each spoke
  normalised by its own maximum, the only way to put unrelated metrics on one web). Under `per-axis` the ring labels
  give way to the axis maxima, which move into the axis names, the announcement gains "of {max}", and the hidden table
  gains an axis-maximum column — without it the shape cannot be reconstructed from the table.
- `GrChartLine` gained `gaps: 'hidden' | 'shadow' | 'dashed'` — what to draw across a break in the series. The bridge is
  always straight, even when the line is smoothed, and never reaches the tooltip or the data table: those keep reporting
  "no value".

### Changed

- `dataTable: 'visible'` no longer repeats the full date on every row of a time series. The date now appears on the
  first row and returns whenever the day (or year, for daily and monthly ladders) changes — dropping it everywhere would
  make midnight indistinguishable from the previous day. The hidden, screen-reader table keeps the full date per row: it
  is read out of context.

### Fixed

- Switching locale no longer shifts the plot area. `Intl` uses a non-breaking space (`U+00A0` in `ru`/`fi`) or a narrow
  one (`U+202F` in `fr`) as the thousands separator, and the label-width estimator scored those as medium-width
  characters — so `1 000` reserved more axis gutter than `1,000`, and the drawing moved with it. Any whitespace now
  counts as narrow.
- **The hidden data table no longer inflates the scroll height of whatever wraps the chart.**
  `sr-only` sat on the `<table>` itself, and table boxes treat `width`/`height` as a minimum rather than a size — so
  `height: 1px` was ignored, `clip` hid the table visually while its full geometry stayed, and any container with a
  bounded height grew a scrollbar with nothing to scroll. The class moved to a wrapping `<div>`, which collapses as
  intended; the table stays in the accessibility tree exactly as before.

## [v0.2.0] 2026-08-13

First published release. `0.1.0` was cut in the working tree but never tagged or published, so everything the package
contains ships here.

### Added

- Initial package: charts drawn with design-system tokens, own SVG, zero runtime dependencies.
- `GrChartLine` — line chart with axes, grid, legend, tooltip, empty and loading states, keyboard navigation over points
  and a screen-reader data table.
- `GrChartBar` — bar chart: series side by side, stacked, or normalised to 100%. The value axis always starts at zero,
  only the far end of a bar is rounded (and in a stack only its topmost segment), and hovering a category keeps it
  saturated while the other bars fade — switched off with `dimInactive`.
- `GrChartArea` — area chart: fill down to the zero baseline (not the canvas bottom), per-series gradients anchored to
  the shape they fill, and `stacked` mode where each band sits on the sum of the ones below while the tooltip and data
  table keep reporting the series' own value.
- `GrChartPie` — pie and donut chart: angular hit testing, callout labels outside the ring, texture discriminators past
  the five-colour palette, legend as a key with values and shares, and a screen-reader table of shares.
- `GrSparkline` — frameless inline chart for table cells and stat tiles.
- Chart arithmetic as pure modules (`@feugene/granularity-charts/chart`): data normalisation, linear/time/band scales,
  nice-number ticks, path geometry, arc geometry, band geometry for stacks, bar layout and rounded bar paths, mark
  placement, plot-area layout, series discriminators.
- Composables `useChartScale`, `useChartTicks`, `useChartTooltip`.
- Three locales (`en`, `ru`, `es`) under the `grCharts` i18n block.

### Fixed

- Bar chart hover no longer paints a slab behind the column: the active category now stays at full saturation while the
  other bars fade, so the grid and the drawing underneath stay visible.
- Bar chart no longer opens a tooltip over empty canvas. Hit testing is bounded by the category column and by the plot
  area, instead of snapping to the nearest category from anywhere.
- Stacked charts anchor the tooltip at the top of the column instead of at the largest single value, which used to put
  the panel inside the stack and cover what it was describing.
- Tooltip no longer flickers when the pointer reaches the panel: `pointer-events: none` now sits on the panel's wrapper,
  not only on the panel itself. The wrapper is `fixed`-positioned over the plot area, so hitting it made the surface
  fire `pointerleave`, which closed the tooltip and immediately reopened it.
