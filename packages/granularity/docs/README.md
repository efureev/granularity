# Документация `@feugene/granularity`

`@feugene/granularity` — пакет дизайн-системы на `Vue 3` с компонентами и интеграцией через
[`@feugene/unocss-preset-granular`](https://github.com/efureev/unocss-preset-granular).

Эта папка — основная документация пакета. `README.md` в корне пакета остаётся короткой точкой входа, а здесь собраны
подробный сценарий подключения и package-level API.

Репозиторий: <https://github.com/efureev/unocss-preset-granular>

## С чего начать

- Если нужен быстрый старт: откройте [`installation.md`](./installation.md).
- Если нужен каркас приложения целиком — SPA или SSR: откройте [`getting-started.md`](./getting-started.md).
- Если приложение уже пишется и хочется не переделывать: откройте [`best-practices.md`](./best-practices.md).
- Если важно понять устройство слоёв стилей: откройте [`styling.md`](./styling.md).
- Если приложение уже использует `UnoCSS`: откройте [`unocss.md`](./unocss.md) и [`installation.md`](./installation.md).
- Если нужен единый bootstrap-вход в Vue-приложение: откройте [`vue-plugin.md`](./vue-plugin.md).
- Если хочется авто-импорта компонентов и директив: откройте [`unplugin.md`](./unplugin.md).
- Если нужно собрать свой пакет-спутник поверх дизайн-системы: откройте [`companion-packages.md`](./companion-packages.md).
- Если важно понять, как пакет ведёт себя в i18n-сценариях: откройте [`localization.md`](./localization.md).
- Если нужны package-level утилиты кроме компонентов: откройте [`directives.md`](./directives.md) и [
  `file-validation.md`](./file-validation.md).
- Если нужен обзор опубликованных компонентов: откройте [`components.md`](./components.md),
  особенности конкретного — [`components/GrX.md`](./components/).
- Если нужно масштабировать контролы целиком: откройте [`sizes.md`](./sizes.md).
- Если пишете обёртку над контролами пакета: откройте [`form-controls.md`](./form-controls.md).
- Если важно поведение анимаций при «уменьшить движение»: откройте [`motion.md`](./motion.md).
- Если нужно сообщить что-то скринридеру из кода приложения: откройте [`announcer.md`](./announcer.md).
- Если список вырос до тысяч строк: откройте [`virtual-list.md`](./virtual-list.md).
- Если делаете своё перетаскивание — ползунок, ручку, разделитель: откройте [`drag-gesture.md`](./drag-gesture.md).
- Если пользователь должен менять порядок элементов: откройте [`drag-sort.md`](./drag-sort.md).

## Карта документации

- [`installation.md`](./installation.md) — установка, public entrypoint-ы, quick start и выбор стратегии подключения.
- [`getting-started.md`](./getting-started.md) — приложение с нуля: полные каркасы SPA и SSR, подключение
  локализации и остальных пакетов семейства.
- [`best-practices.md`](./best-practices.md) — практики прикладной разработки: импорт и конфиг, формы и обёртки,
  свои оверлеи, доступность, темы, тесты приложения и чего пакет намеренно не делает.
- [`styling.md`](./styling.md) — `foundation.css`, `styles.css`, `tokens`, `base`, темы, порядок импортов и почему
  RTL не поддерживается.
- [`tokens.md`](./tokens.md) — справочник токенов (генерируется из `tokens/*.json`, руками не править).
- [`theming.md`](./theming.md) — как собрать свою тему: роли, суффиксы `-fg`/`-light`/`-text`, композиция
  поверх готовой (`extendTheme`) и с нуля (`createTheme`), подключение, проверка контраста.
- [`keyboard.md`](./keyboard.md) — клавиатурный контракт: общие правила и таблица по компонентам.
- [`form-controls.md`](./form-controls.md) — контракт форм-контрола: пропы, методы `focus()`/`blur()`, события и граница фокуса у составных.
- [`announcer.md`](./announcer.md) — `useAnnouncer`: как объявить событие скринридеру и когда это лучше своего `role="status"`.
- [`virtual-list.md`](./virtual-list.md) — `useVirtualList`: виртуализация длинного списка, оценка против замера, фокус вне окна.
- [`drag-gesture.md`](./drag-gesture.md) — `useDragGesture`: указательный жест, отпускание против обрыва, почему слушатели на `window`.
- [`drag-sort.md`](./drag-sort.md) — `useDragSort`: перестановка указателем и с клавиатуры, порог, автопрокрутка, границы.
- [`testing.md`](./testing.md) — `@feugene/granularity/testing`: указательные жесты, геометрия в jsdom,
  окружение для монтирования, живой регион, уборка между тестами.
- [`sizes.md`](./sizes.md) — шкала размеров: кто на ней, порядок разрешения `size`, отклонения.
- [`motion.md`](./motion.md) — контракт движения и `prefers-reduced-motion`: что гасится, почему не `motion-safe:`.
- [`overlays.md`](./overlays.md) — контракт оверлеев: портал, стек слоёв, Esc, `inert`, фокус, модальный режим.
- [`z-index.md`](./z-index.md) — шкала слоёв: кто на каком и как завести новый.
- [`ssr.md`](./ssr.md) — какие компоненты безопасны при серверном рендере и где нужны оговорки.
- [`unocss.md`](./unocss.md) — интеграция с `UnoCSS` через `presetGranularNode` из `@feugene/unocss-preset-granular/node`
  и granular-провайдер `@feugene/granularity/granular-provider/node`.
- [`vue-plugin.md`](./vue-plugin.md) — runtime-адаптер `@feugene/granularity/vue`: `createGranularity`,
  `installGranularity`, `defineInstallable`.
- [`unplugin.md`](./unplugin.md) — авто-импорт компонентов и директив через
  [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md).
- [`companion-packages.md`](./companion-packages.md) — как собрать пакет-спутник (companion) с нуля:
  упаковка, granular-provider и авто-импорт через `createGranularResolver`.
- [`packaging.md`](./packaging.md) — почему пакет один и не делится на подпакеты, что вместо этого
  даёт гранулярность и при каком условии решение пересматривается.
- [`localization.md`](./localization.md) — как `granularity` работает с локализацией приложения и fallback-текстами.
- [`directives.md`](./directives.md) — все опубликованные директивы и их назначение.
- [`file-validation.md`](./file-validation.md) — `fileValidation` API и повторное использование логики валидации файлов.
- [`components.md`](./components.md) — каталог опубликованных компонентов, импорты и правило
  ведения страниц; [`components/`](./components/) — страница на компонент с его особенностями.
- [`ADDING_COMPONENTS.md`](./ADDING_COMPONENTS.md) — внутренний процесс добавления нового компонента в пакет.

## Как подключать

Поддерживается один проверенный способ — тонкая настройка через `UnoCSS` preset
`presetGranularNode` из [`@feugene/unocss-preset-granular`](https://github.com/efureev/unocss-preset-granular) вместе с
`granularityProvider` из `@feugene/granularity/granular-provider/node`. Полная инструкция — в
[`installation.md`](./installation.md), детали конфигурации — в [`unocss.md`](./unocss.md).

Дополнительно (необязательно):

- [`@feugene/unplugin-granularity`](../../unplugin-granularity/README.md) — авто-импорт компонентов и директив в шаблонах `Vue`.
- `createGranularity` из `@feugene/granularity/vue` — единый bootstrap-вход для директив, `provide`, `globalProperties`.

## Что публикует пакет

- `Vue`-компоненты через root barrel и component subpath exports.
- package-level API для директив и file validation.
- `UnoCSS` preset `presetGranularNode` (из `@feugene/unocss-preset-granular/node`) + `granularityProvider`
  (из `@feugene/granularity/granular-provider/node`) — единственный поддерживаемый способ интеграции.
- внутреннюю инженерную документацию по развитию пакета.

## Принцип документации

В этих файлах описаны только те возможности, которые реально подтверждаются текущими `exports`, `README.md` и
исходниками `packages/granularity`.