# Changelog

All notable changes to the [`@feugene/granularity-tokens`](.) package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Пакет токенов и тем дизайн-системы.** Словарь токенов, данные тем и сборка темы вынесены из
  `@feugene/granularity`: реестр без значений (`tokens/foundation.json`, `roles.json`,
  `derived.json` — 101 примитив, 94 роли, 18 формул), тема `slate` в `themes/slate/` с режимами
  `light` и `dark`, каталог тем `grThemeCatalog`.
- **`defineTheme`** собирает тему целиком: наследование темы от темы и режима от режима, полнота по
  реестру, контраст и различимость тонов в каждом режиме, фолбэки производных для браузеров без
  `color-mix`. Результат — данные в форме `GranumThemeData` контракта granum 3.
- **`loadTheme`** (`/theme/node`) читает тему из папки, находит тему-базу по id и отдаёт
  прочитанные файлы в `sources`.
- `extendTheme`, `createTheme`, `tone`, `validateTheme`, цветовая математика и `applyTheme` — те же,
  что были в `@feugene/granularity/theme`. `extendTheme` сверяет покомпонентные токены с
  `knownComponentTokens`, если список передан: реестр компонентов живёт у пакетов с компонентами.
- Гейты значений идут по каждой паре «тема × режим»: различимость тонов, запрет тона в роли текста,
  граница контрола, палитра графиков, тени по режимам, полнота и каталог.

### Changed

- **Тени `--gr-shadow-1..3` — только роли режима.** Примитивом остаётся `--gr-shadow-0`: тень,
  объявленная и в `:root`, и в режиме, при равной специфичности решалась порядком файлов.
